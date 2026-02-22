# Use Node 20 LTS image
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --frozen-lockfile

# Copy source code
COPY . .

# Build the NestJS app
RUN npm run build

# Production image
FROM node:20-alpine

WORKDIR /usr/src/app

# Copy only built files and package.json for production
COPY package*.json ./
COPY --from=builder /usr/src/app/dist ./dist
RUN npm install --production --frozen-lockfile

# Expose the port (Render will provide PORT via environment)
EXPOSE 3000

# Set default environment variable (Render will override)
ENV PORT=3000

# Start the app
CMD ["node", "dist/main.js"]