# Latest version on node.js site as of 18May2025
FROM node:22

# Working dir
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
ENV NODE_ENV=development
RUN npm install --include=dev

# Copy server files over
COPY . .

# Expose port 3000
EXPOSE 3000

# Run the backend
CMD ["npm", "run", "dev"]

# Use this command to check if node_modules are being installed in the container correctly.
# CMD ["npm", "run", "debug"] 