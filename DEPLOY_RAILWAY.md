# Deploy en Railway — Guía paso a paso

## Requisitos previos
- Cuenta en [railway.app](https://railway.app) (podés registrarte con GitHub)
- Repositorio en GitHub con el código del proyecto
- Cuenta de Gmail con verificación en 2 pasos (para los emails)

---

## Paso 1 — Subir el código a GitHub

```bash
cd inventario-app

# Inicializar repositorio Git
git init
git add .
git commit -m "deploy inicial"

# Crear repo en github.com y conectarlo
git remote add origin https://github.com/TU-USUARIO/inventario-cnrt.git
git branch -M main
git push -u origin main
```

---

## Paso 2 — Crear el proyecto en Railway

1. Ir a [railway.app](https://railway.app) → **"Start a New Project"**
2. Seleccionar **"Deploy from GitHub repo"**
3. Autorizar Railway a acceder a tu GitHub
4. Seleccionar el repositorio `inventario-cnrt`
5. Railway detecta Next.js automáticamente → clic en **"Deploy Now"**

---

## Paso 3 — Configurar el volumen persistente para SQLite

> ⚠️ **Este paso es crítico.** Sin el volumen, la base de datos se borra en cada deploy.

1. En el panel del proyecto → clic en el servicio web
2. Ir a la pestaña **"Volumes"**
3. Clic en **"New Volume"**
4. Configurar:
   - **Mount Path:** `/app/prisma`
   - **Size:** 1 GB (suficiente para SQLite)
5. Clic en **"Create"**

---

## Paso 4 — Configurar las variables de entorno

En el panel del servicio → pestaña **"Variables"** → agregar cada una:

| Variable | Valor |
|----------|-------|
| `DATABASE_URL` | `file:/app/prisma/prod.db` |
| `JWT_SECRET` | Una clave aleatoria larga (ver abajo) |
| `SMTP_SERVICE` | `gmail` |
| `SMTP_USER` | `tu-cuenta@gmail.com` |
| `SMTP_PASS` | Tu App Password de Gmail |
| `EMAIL_FROM_NAME` | `CNRT - Sistema de Inventario` |
| `ADMIN_EMAIL` | `admin@cnrt.gob.ar` |
| `NODE_ENV` | `production` |

**Generar JWT_SECRET seguro:**
```bash
# En tu terminal local
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Obtener App Password de Gmail:**
1. Ir a [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Necesitás tener la verificación en 2 pasos activada
3. Crear una App Password para "Correo" → copiar los 16 caracteres

---

## Paso 5 — Configurar el comando de inicio

En el panel del servicio → **"Settings"** → **"Deploy"**:

- **Build Command:** `npm install && npx prisma generate && npm run build`
- **Start Command:** `npm run start:prod`

---

## Paso 6 — Redeploy

1. En el panel → clic en **"Redeploy"** (o hacer un nuevo push a GitHub)
2. Seguir los logs en tiempo real
3. Cuando aparezca `✅ Setup completo. Iniciando Next.js...` → el deploy fue exitoso

---

## Paso 7 — Asignar dominio

1. En el panel → pestaña **"Settings"** → **"Domains"**
2. Clic en **"Generate Domain"** para obtener una URL de Railway gratis (ej: `inventario-cnrt.up.railway.app`)
3. O clic en **"Custom Domain"** para usar tu propio dominio (ej: `inventario.cnrt.gob.ar`)

---

## Credenciales iniciales del sistema

Una vez deployado, podés ingresar con:

| Usuario | Contraseña | Rol |
|---------|------------|-----|
| `admin` | `admin123` | Administrador |
| `usuario1` | `user123` | Usuario (Rosario) |

> ⚠️ **Cambiá las contraseñas inmediatamente** desde el panel de Usuarios.

---

## Actualizaciones futuras

Cada vez que hagas cambios al código:

```bash
git add .
git commit -m "descripción del cambio"
git push
```

Railway detecta el push y redeploya automáticamente en ~2 minutos.

---

## Backup de la base de datos

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Descargar la DB desde el volumen
railway run cp /app/prisma/prod.db ./backup-$(date +%Y%m%d).db
```

---

## Troubleshooting

**El deploy falla en el build:**
- Verificar que el repositorio tiene todos los archivos commiteados
- Revisar los logs de build en Railway

**"Database is locked" o errores de SQLite:**
- Verificar que el volumen está montado en `/app/prisma`
- Verificar que `DATABASE_URL=file:/app/prisma/prod.db`

**Los emails no se envían:**
- Verificar que `SMTP_PASS` es una App Password (no la contraseña normal de Gmail)
- Ir a "Notificaciones" en el panel y usar "Enviar email de prueba"

**El servidor no responde:**
- Verificar que `PORT` no está seteado manualmente (Railway lo asigna solo)
- Revisar los logs del servicio en Railway
