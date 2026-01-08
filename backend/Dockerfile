# Node.js Backend için Dockerfile
FROM node:20-alpine

# Çalışma dizini
WORKDIR /app

# Package files
COPY package*.json ./

# Bağımlılıkları yükle
RUN npm ci --only=production

# Uygulama kodunu kopyala
COPY . .

# Port
EXPOSE 3001

# Environment
ENV NODE_ENV=production
ENV PORT=3001

# Başlat
CMD ["node", "index.js"]
