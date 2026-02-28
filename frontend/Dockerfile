# Use official Node.js image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy all frontend source code
COPY . .

# Expose port for React dev server
EXPOSE 3000

# Start the frontend
CMD ["npm", "start"]