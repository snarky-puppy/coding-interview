FROM node:18

# Update and install basic tools and postgres client
RUN apt-get update && apt-get install -y postgresql-client

# Create app directory
WORKDIR /app

# Copy package files
COPY package.json ./
COPY package-lock.json* ./

# Install dependencies - no package-lock
# The --no-optional flag can be used if you encounter problems
RUN npm install

# Copy project files
COPY . .

# Build the application
# Warning: This might take a while on first run
# If build fails, try again with --force flag
RUN npm run build

# Expose port 3000
EXPOSE 3000

# Set environment variable
ENV NODE_ENV=development
# For production deployment, set NODE_ENV=production

# Start the application
# In DEV we use this to keep container running
# PROD should use: CMD ["npm", "run", "start"]
CMD ["tail", "-f", "/dev/null"]
