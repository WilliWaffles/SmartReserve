#!/bin/sh
set -e

# Genera Prisma Client (por si el lock cambió)
npx prisma generate

# Crea el esquema en SQLite si aún no existe (no requiere migraciones previas)
# Si usas migraciones, cambia a: npx prisma migrate deploy
npx prisma migrate deploy

# Arranca la app
node index.js
