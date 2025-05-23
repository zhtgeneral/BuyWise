# Latest version on node.js site as of 18May2025
FROM node:22

# Working dir
WORKDIR /usr/src/app/frontend

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy frontend files over
COPY . .

# Export port 3000
EXPOSE 3000

# Run the frontend
CMD ["npm", "start"]