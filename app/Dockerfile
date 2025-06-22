#FROM node:24.2.0-alpine
#FROM node:16-alpine3.16
#FROM node:20-slim
FROM node:20-alpine3.20

RUN ln -s /usr/lib/libssl.so.3 /lib/libssl.so.3

# Install OpenSSL 1.1 compatibility library
RUN apk add --no-cache openssl
#RUN apt-get update && apt-get install -y openssl

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
