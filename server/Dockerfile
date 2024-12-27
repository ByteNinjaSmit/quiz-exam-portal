# ./server/Dockerfile
# Dockerfile for the server
FROM node:18

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY ./server/package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . /usr/src/app


# Expose the app on port 5000
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
