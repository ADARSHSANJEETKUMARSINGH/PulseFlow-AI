const crypto = require('crypto');

/**
 * Issues a virtual queue token for a user at a specific zone.
 * Calculates an estimated wait time based on the zone's current load.
 */
function issueToken(userId, zoneId, venueState) {
    const zone = venueState.zones.find(z => z.id === zoneId);
    
    if (!zone) {
        throw new Error('Zone not found');
    }

    const token = crypto.randomBytes(3).toString('hex').toUpperCase();
    
    // Calculate simulated wait time for demo (e.g., 5-15 seconds real time for the demo)
    // We base it roughly on the waitTimeMin but scaled down for demonstration
    const estimatedWaitMs = Math.max(5000, Math.floor(zone.waitTimeMin * 1000)); 

    return {
        userId,
        zoneId,
        zoneName: zone.name,
        token: `#${token}`,
        estimatedWaitMs,
        status: 'Waiting'
    };
}

module.exports = { issueToken };
