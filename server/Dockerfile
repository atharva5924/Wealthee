# Use official Node image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json ./

# Install dependencies
RUN npm install

# Copy rest of the backend files
COPY . .

# Expose backend port
EXPOSE 5000

# Command to start backend
CMD ["npm", "start"]
