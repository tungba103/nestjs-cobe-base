# Use node:20.16.0 as a base image
FROM node:20.16.0
RUN apt-get update && apt-get install libssl-dev -y --no-install-recommends && apt-get install make

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Set permissions for the working directory
RUN chown -R node:node /app

# Switch to the node user
USER node

# Install dependencies (including devDependencies)
RUN npm install

# Copy all project files
COPY --chown=node:node . .

# Generate Prisma files
RUN npx prisma generate

# Expose the application port
# EXPOSE 3000

# Command to run the application in development mode
# CMD ["npm", "run", "start:dev"]
