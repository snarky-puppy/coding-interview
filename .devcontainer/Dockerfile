FROM node:12

# Update and install basic tools and postgres client
RUN apt-get update && apt-get install -y postgresql-client

# Install old version of npm
RUN npm install -g npm@6.14.11

# Create app directory
WORKDIR /app

# Copy package files
COPY package.json ./
COPY package-lock.json* ./

# Install dependencies - no package-lock 
RUN npm install

# Copy project files
COPY . .

# Build the application
RUN npm run build

# Expose port 3000
EXPOSE 3000

# Set environment variable
ENV NODE_ENV=development

# Start the application
CMD ["npm", "run", "dev"]
