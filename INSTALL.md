# Velunisa — Guía de Instalación y Puesta en Marcha

## Requisitos previos

- Node.js v18 o superior
- pnpm v9 (`npm install -g pnpm`)
- Git
- Cuenta en Supabase (base de datos)
- Cuenta en Cloudinary (imágenes)
- Cuenta en Resend (emails)
- API Key de Anthropic (chat IA)

---

## 1. Instalar dependencias

```bash
cd C:\Users\COMPUTER SOLUTIONS\Downloads\velunisa
pnpm install
```

---

## 2. Configurar variables de entorno

```bash
# Copia el archivo de ejemplo
copy .env.example apps\web\.env.local
```

Edita `apps\web\.env.local` y completa:

| Variable | Dónde obtenerla |
|----------|----------------|
| `DATABASE_URL` | Supabase → Settings → Database → Connection string |
| `DIRECT_URL` | Supabase → Settings → Database → Direct connection |
| `NEXTAUTH_SECRET` | Ejecuta: `openssl rand -base64 32` |
| `ANTHROPIC_API_KEY` | console.anthropic.com |
| `CLOUDINARY_*` | cloudinary.com → Dashboard |
| `RESEND_API_KEY` | resend.com → API Keys |
| `WHATSAPP_*` | Meta for Developers → WhatsApp |
| `BANK_*` | Tus datos bancarios del Ecuador |

---

## 3. Configurar la base de datos

```bash
# Generar el cliente Prisma
pnpm db:generate

# Crear las tablas en Supabase
pnpm db:push

# Cargar productos de ejemplo
pnpm db:seed
```

---

## 4. Ejecutar en desarrollo

```bash
# Inicia la web (http://localhost:3000)
pnpm dev

# O solo la web
cd apps/web && pnpm dev
```

---

## 5. Acceso al admin

1. Ve a http://localhost:3000/login
2. Email: `admin@velunisa.com`
3. Contraseña: `velunisa_admin_2026`
4. **IMPORTANTE:** Cambia la contraseña en producción

---

## 6. Despliegue en Vercel (Web)

```bash
# Instala Vercel CLI
npm install -g vercel

# Dentro de apps/web
cd apps/web
vercel

# Configura todas las variables de entorno en:
# vercel.com → Tu proyecto → Settings → Environment Variables
```

### Variables requeridas en Vercel:
Copia todas las del `.env.local` al panel de Vercel.

---

## 7. App Móvil (Expo)

```bash
# Instalar EAS CLI
npm install -g eas-cli

# Configurar proyecto
cd apps/mobile
eas login
eas build:configure

# Build de desarrollo
eas build --profile development --platform android

# Build de producción
eas build --profile production --platform android
eas build --profile production --platform ios

# Publicar en stores
eas submit --platform android
eas submit --platform ios

# Updates OTA (sin pasar por stores)
eas update --branch production --message "Nueva versión"
```

---

## 8. Configurar WhatsApp Business

1. Ve a [Meta for Developers](https://developers.facebook.com)
2. Crea una app → Agrega WhatsApp
3. Obtén `WHATSAPP_PHONE_NUMBER_ID` y `WHATSAPP_ACCESS_TOKEN`
4. Configura el webhook apuntando a: `https://tudominio.com/api/webhooks/whatsapp`
5. Token de verificación: el valor de `WHATSAPP_VERIFY_TOKEN` en tu `.env`

---

## 9. Configurar Instagram (Meta Graph API)

1. En Meta for Developers → tu app → Instagram Basic Display
2. Obtén `META_INSTAGRAM_USER_ID` desde Graph API Explorer
3. Genera un token de larga duración: `META_ACCESS_TOKEN`
4. El cron job de Vercel publica automáticamente cada 5 minutos

---

## 10. Configurar ManyChat

1. En ManyChat → Settings → API → genera `MANYCHAT_API_KEY`
2. Crea un flujo que llame a: `POST https://tudominio.com/api/webhooks/manychat`
3. Header requerido: `x-manychat-key: TU_API_KEY`

---

## Estructura del proyecto

```
velunisa/
├── apps/
│   ├── web/       ← Next.js 14 (web + admin + API)
│   └── mobile/    ← Expo React Native (iOS + Android)
├── packages/
│   └── types/     ← TypeScript compartidos
└── prisma/        ← Schema de base de datos
```

## URLs del sistema

| URL | Descripción |
|-----|-------------|
| `/` | Homepage de la tienda |
| `/tienda` | Catálogo de productos |
| `/admin` | Panel de administración |
| `/login` | Iniciar sesión |
| `/checkout` | Proceso de compra |
| `/api/webhooks/whatsapp` | Webhook WhatsApp |
| `/api/webhooks/manychat` | Webhook ManyChat |
| `/api/social/process-queue` | Cron social media |

---

## Soporte

¿Problemas? Escribe a hola@velunisa.com o por WhatsApp.
