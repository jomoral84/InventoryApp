#!/bin/sh
set -e

# En Railway, el volumen se monta en /app/prisma/
# La variable DATABASE_URL debe apuntar ahí: file:/app/prisma/prod.db

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   CNRT — Sistema de Inventario           ║"
echo "║   Iniciando servidor de producción...    ║"
echo "╚══════════════════════════════════════════╝"
echo ""

echo "▶ [1/3] Generando cliente Prisma..."
npx prisma generate

echo "▶ [2/3] Aplicando migraciones de base de datos..."
npx prisma migrate deploy

echo "▶ [3/3] Cargando usuarios iniciales (si la DB está vacía)..."
npx ts-node \
  --compiler-options '{"module":"CommonJS","esModuleInterop":true}' \
  --project tsconfig.json \
  prisma/seed.ts

echo ""
echo "✅ Setup completo. Iniciando Next.js en producción..."
echo ""

exec node_modules/.bin/next start -p ${PORT:-3000}
