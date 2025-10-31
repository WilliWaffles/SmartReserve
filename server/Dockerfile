# server/Dockerfile
FROM node:20-bullseye-slim

# Instala OpenSSL y utilidades básicas
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiamos manifiestos
COPY package*.json ./

# Instalar dependencias (respeta lockfile)
RUN npm install

# Copiar schema y generar Prisma Client (glibc)
COPY prisma ./prisma
RUN npx prisma generate

# Copiar resto del código
COPY . .

# Opcional: adelgazar imagen para producción
RUN npm prune --production

ENV NODE_ENV=production
EXPOSE 3001

CMD ["./entrypoint.sh"]
