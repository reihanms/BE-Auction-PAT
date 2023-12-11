# Gunakan image Node.js yang ringan sebagai base image
FROM node:18-alpine

# Set working directory di dalam container
WORKDIR /app

# Copy package.json dan package-lock.json (atau yarn.lock jika menggunakan Yarn)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy semua file aplikasi ke dalam container
COPY . .

RUN npm run generate:prisma

RUN npm run build

# Command untuk menjalankan aplikasi ketika container dijalankan
CMD ["npm", "start"]
