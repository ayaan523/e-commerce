# Use a lightweight, stable version of Node.js
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first to leverage Docker caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the backend application code
COPY . .

# Expose the port your Express server runs on
EXPOSE 5000

# Command to boot the server
CMD ["node", "server.js"]
