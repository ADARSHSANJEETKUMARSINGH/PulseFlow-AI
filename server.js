const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = parseInt(process.env.PORT || '8080', 10);

// Initialize Next.js app
const nextApp = next({ dev, hostname, port });
const handle = nextApp.getRequestHandler();

const { calculateRedirects } = require('./src/algorithms/smartRedirect.js');
const { runSmartExit } = require('./src/algorithms/smartExit.js');
const { issueToken } = require('./src/controllers/queueController.js');

nextApp.prepare().then(() => {
    const app = express();
    app.use(cors());
    app.use(express.json());

    const server = http.createServer(app);
    const io = new Server(server, {
        cors: {
            origin: '*', 
            methods: ['GET', 'POST']
        }
    });

    // Mock Venue State
    let venueState = {
        zones: [
            { id: 'gate_a', name: 'Gate A', occupancy: 85, capacity: 100, waitTimeMin: 15, status: 'Red' },
            { id: 'gate_b', name: 'Gate B', occupancy: 30, capacity: 100, waitTimeMin: 2, status: 'Green' },
            { id: 'food_court_1', name: 'Food Court 1', occupancy: 95, capacity: 150, waitTimeMin: 25, status: 'Red' },
            { id: 'food_court_2', name: 'Food Court 2', occupancy: 40, capacity: 150, waitTimeMin: 5, status: 'Green' },
            { id: 'restroom_east', name: 'Restroom East', occupancy: 60, capacity: 80, waitTimeMin: 8, status: 'Yellow' }
        ],
        activeMode: 'Sports' // 'Sports' or 'Professional'
    };

    // WebSocket logic for real-time updates
    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id}`);
        
        socket.emit('live-pulse-update', venueState);

        const interval = setInterval(() => {
            venueState.zones.forEach(zone => {
                const fluctuation = Math.floor(Math.random() * 11) - 5;
                zone.occupancy = Math.max(0, Math.min(zone.capacity, zone.occupancy + fluctuation));
                
                const fillRatio = zone.occupancy / zone.capacity;
                if (fillRatio > 0.8) zone.status = 'Red';
                else if (fillRatio > 0.5) zone.status = 'Yellow';
                else zone.status = 'Green';
                
                zone.waitTimeMin = Math.max(0, Math.floor(fillRatio * 30));
            });

            io.emit('live-pulse-update', venueState);
            
            const suggestions = calculateRedirects(venueState);
            if (suggestions.length > 0) {
                io.emit('smart-redirect', suggestions);
            }
        }, 3000);

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`);
            clearInterval(interval);
        });
    });

    // REST API for actions
    app.post('/api/queue', (req, res) => {
        const { userId, zoneId } = req.body;
        const tokenInfo = issueToken(userId, zoneId, venueState);
        
        setTimeout(() => {
            io.emit('queue-notification', {
                userId,
                message: `Your token ${tokenInfo.token} for ${tokenInfo.zoneName} is Ready to Serve!`
            });
        }, tokenInfo.estimatedWaitMs);
        
        res.json(tokenInfo);
    });

    app.post('/api/smart-exit', (req, res) => {
        const plan = runSmartExit(venueState);
        io.emit('smart-exit-plan', plan);
        res.json(plan);
    });

    // Default catch-all Next.js handler
    app.use((req, res) => {
        return handle(req, res);
    });

    server.listen(port, hostname, (err) => {
        if (err) throw err;
        console.log(`> Ready on http://${hostname}:${port}`);
    });
});
