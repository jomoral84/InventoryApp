# Sistema de Inventario Institucional

Aplicación web para inventariar elementos de un organismo: móviles, alcoholímetros, PDA/celulares e informática.

## Stack

- **Frontend**: Next.js 14 + React 18 + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes (Node.js)
- **Base de datos**: SQLite (archivo local) via Prisma ORM
- **Auth**: JWT con bcryptjs

## Credenciales iniciales

| Usuario | Contraseña | Rol |
|---------|------------|-----|
| `admin` | `admin123` | Administrador |
| `usuario1` | `user123` | Usuario (Rosario) |

## Instalación — primeros pasos

```bash
# 1. Instalar dependencias (genera el cliente Prisma automáticamente)
npm install

# 2. Crear la base de datos SQLite y aplicar el esquema
npm run db:migrate

# 3. Cargar los usuarios iniciales
npm run db:seed

# 4. Iniciar el servidor
npm run dev

# Abrir en: http://localhost:3000
```

## Dónde se guarda la base de datos

El archivo SQLite se crea en **`prisma/dev.db`** dentro del proyecto.
Persiste entre reinicios. Para hacer backup, basta con copiar ese archivo.

## Comandos útiles

```bash
npm run db:migrate   # Aplicar cambios del schema
npm run db:seed      # Crear usuarios iniciales (solo si no existen)
npm run db:studio    # Abrir explorador visual de la DB en el navegador
npm run build        # Build de producción
npm start            # Iniciar en producción
```

## Estructura

```
/prisma
  schema.prisma    → Tablas: User, Item
  seed.ts          → Usuarios iniciales
  dev.db           → Archivo SQLite (generado al migrar)

/pages/api
  auth/login.ts    → POST /api/auth/login
  items/index.ts   → GET · POST · DELETE /api/items
  users/index.ts   → GET · POST /api/users
  users/[id].ts    → PATCH · DELETE /api/users/:id

/lib
  prisma.ts        → Cliente Prisma singleton
  auth.ts          → JWT helpers
  AuthContext.tsx  → Contexto de autenticación React
  delegaciones.ts  → Lista de 26 delegaciones
```
