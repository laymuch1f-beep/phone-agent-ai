# Use official Node.js LTS image
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy app source
COPY . .

# Build the NestJS app
RUN npm run build

# Expose port (Cloud Run will set PORT env var)
EXPOSE 8080

# Start the app
CMD [ "node", "dist/main.js" ]