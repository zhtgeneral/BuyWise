# Latest version on node.js site as of 18May2025
FROM node:22

# Working dir
WORKDIR /usr/src/app/backend

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy server files over
COPY . .

# Expose port 4000
EXPOSE 4000

# Run the backend
CMD ["npm", "run", "dev"]