FROM debian:bullseye-slim

RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN npm install -g pm2

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 8001

# CMD ["npm", "run", "serve"]
CMD ["npm", "run", "pm2:deploy"]
