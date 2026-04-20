FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install --no-audit --no-fund --legacy-peer-deps

COPY . .

# Build the Next.js production bundle
RUN npm run build

# Cloud Run requires binding to 0.0.0.0 and defaults to port 8080
EXPOSE 8080
ENV PORT=8080
ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"

# Start the combined server
CMD ["node", "server.js"]
