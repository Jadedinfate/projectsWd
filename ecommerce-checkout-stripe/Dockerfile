# Use official Node.js LTS image
FROM node:20-slim

# Install build dependencies for better-sqlite3 native C++ compilation
RUN apt-get update && apt-get install -y python3 make g++ sqlite3 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application source code
COPY . .

# Run database seed during build or container start if db does not exist
RUN node scripts/seed.js

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

CMD ["node", "src/server.js"]
