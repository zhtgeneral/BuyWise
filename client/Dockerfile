# Latest version on node.js site as of 18May2025
FROM node:22

# Working dir
WORKDIR /app

# # Force devDependecies to install
# ENV NODE_ENV=development

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy frontend files over
COPY . .

# Export port 5173
EXPOSE 5173

# Run the frontend
CMD ["npm", "run", "dev"]

# CMD ["npm", "run", "debug"]