# 📖 Manual de Usuario — Velunisa

> E-commerce de Wax Melts Artesanales · Ecuador  
> Versión 1.0 · Abril 2026

---

## Índice

1. [Primeros pasos](#1-primeros-pasos)
2. [Panel Admin — Dashboard](#2-panel-admin--dashboard)
3. [Gestión de Pedidos](#3-gestión-de-pedidos)
4. [Gestión de Productos](#4-gestión-de-productos)
5. [Gestión de Categorías](#5-gestión-de-categorías)
6. [Publicaciones Sociales](#6-publicaciones-sociales-instagramtiktok)
7. [Analytics](#7-analytics)
8. [Sistema de Pagos](#8-sistema-de-pagos)
9. [Chat Luna (IA)](#9-chat-luna-ia)
10. [Emails y Notificaciones](#10-emails-y-notificaciones)
11. [Mi Cuenta (cliente)](#11-mi-cuenta-cliente)
12. [App Móvil](#12-app-móvil)
13. [Configuración y Deploy](#13-configuración-y-deploy)
14. [Variables de Entorno](#14-variables-de-entorno)
15. [Comandos de Desarrollo](#15-comandos-de-desarrollo)

---

## 1. Primeros pasos

### Crear el primer administrador

Después de correr el seed inicial, asigna el rol admin desde Prisma Studio:

```bash
cd apps/web
DATABASE_URL="file:./prisma/dev.db" npx prisma studio
```

En la tabla `users` → busca tu usuario → cambia `role` de `CUSTOMER` a `ADMIN`.

### Acceder al admin

- URL local: `http://localhost:3001/admin`
- URL producción: `https://velunisa.com/admin`
- Requiere iniciar sesión con Google o email/contraseña

---

## 2. Panel Admin — Dashboard

**URL:** `/admin`

Vista general del negocio:

- **Ingresos confirmados** — solo de pedidos con pago confirmado
- **Pedidos pendientes** — requieren atención (esperando confirmar pago)
- **Pedidos confirmados** — procesados correctamente
- **Últimos 10 pedidos** — con enlace a cada uno

---

## 3. Gestión de Pedidos

**URL:** `/admin/pedidos`

### Flujo de vida de un pedido

```
PENDING           → cliente creó el pedido, esperando transferencia
TRANSFER_SUBMITTED → cliente subió comprobante
CONFIRMED         → admin confirmó el pago ✅ (stock se descuenta)
PROCESSING        → pedido en preparación
SHIPPED           → enviado con código de tracking 🚚
DELIVERED         → entregado al cliente 🎉
CANCELLED         → cancelado
```

### Confirmar un pago

1. Entrar a `/admin/pedidos`
2. Click en el número de pedido (ej: `VEL-2024-00001`)
3. Ver el comprobante de transferencia subido por el cliente
4. Click **"Confirmar pago"**
5. ✅ El sistema automáticamente:
   - Cambia el estado a `PROCESSING`
   - **Descuenta el stock** de cada producto
   - Envía **email de confirmación** al cliente
   - Envía **WhatsApp** al cliente
   - Envía **push notification** a la app móvil

### Cambiar estado del pedido

1. Abrir el pedido
2. Usar el selector **"Estado del pedido"**
3. Si seleccionas **Enviado** → aparece formulario para:
   - Código de seguimiento (tracking)
   - Transportista (Servientrega, Laar, etc.)
4. Al guardar → el cliente recibe automáticamente email + WhatsApp + push con el tracking

---

## 4. Gestión de Productos

**URL:** `/admin/productos`

### Crear producto nuevo

1. Click **"+ Nuevo producto"**
2. **Subir imagen** → se sube automáticamente a Cloudinary
3. Click **"Analizar con IA ✨"** → Claude Vision analiza la imagen y sugiere:
   - Nombre del producto
   - Descripción persuasiva
   - Categoría más adecuada
   - Palabras clave
4. Revisar y ajustar los datos
5. Configurar: precio, precio comparado (tachado), stock, SKU
6. Marcar si es **Nuevo** o **Destacado** (aparece en home)
7. Click **"Crear producto"**

### Editar producto

1. Click **"Editar"** en la fila del producto
2. Puedes:
   - Agregar/quitar imágenes (arrastra el orden)
   - Cambiar precio, stock, descripción, categoría
   - Activar/desactivar el producto
3. Click **"Guardar cambios"**

### Variantes de producto

En la pantalla de edición puedes agregar variantes (ej: Individual, Pack x3, Pack x6):
- Cada variante tiene su propio precio y stock
- El cliente selecciona la variante antes de agregar al carrito

### Desactivar vs eliminar

- **Desactivar** (`isActive = false`): el producto no aparece en la tienda pero no se pierde el historial
- **Eliminar**: permanente, no recomendado si ya tiene pedidos asociados

---

## 5. Gestión de Categorías

**URL:** `/admin/categorias`

Edición inline directamente en la tabla:
1. Click **"Editar"** en una fila
2. Modifica nombre, descripción o imagen
3. Click **"Guardar"**

> ⚠️ El `slug` de la categoría NO se puede cambiar — afectaría los URLs existentes y el SEO.

Categorías disponibles: Baby Shower, Bodas, Cumpleaños, Días Especiales

---

## 6. Publicaciones Sociales (Instagram/TikTok)

**URL:** `/admin/publicaciones`

### Programar una publicación

1. Click **"+ Nueva publicación"**
2. Seleccionar **plataforma**: Instagram / TikTok / Ambas
3. Seleccionar **tono del caption**:
   - ✨ Elegante — sofisticado, sensorial
   - 🎉 Festivo — alegre, energético
   - 🌹 Romántico — íntimo, poético
   - 🍼 Tierno — dulce, emotivo
4. Pegar la **URL de imagen** de Cloudinary
5. Click **"Generar con IA ✨"** → Claude genera el caption con hashtags
6. Revisar en la **vista previa** estilo Instagram
7. Editar el caption si deseas
8. Seleccionar **fecha y hora** de publicación
9. Click **"📅 Programar publicación"**

### Estados de publicaciones

- 🟡 **Programado** — pendiente de publicar
- 🟢 **Publicado** — publicado exitosamente
- 🔴 **Error** — falló, puedes ver el error en la fila

### Cancelar una publicación

Click en el ícono 🗑️ de la publicación (solo disponible si no fue publicada aún).

### Requisitos

Configura en `.env.local`:
```
META_ACCESS_TOKEN=...
META_INSTAGRAM_USER_ID=...
TIKTOK_ACCESS_TOKEN=...
```

---

## 7. Analytics

**URL:** `/admin/analytics`

Métricas de los últimos 30 días:

| Métrica | Descripción |
|---------|-------------|
| Ingresos | Solo pedidos confirmados, con comparación vs mes anterior |
| Pedidos | Total de pedidos recibidos |
| Ticket promedio | Ingresos / pedidos confirmados |
| Tasa de confirmación | % de pedidos que se pagaron |

**Gráficas:**
- Ingresos por día (últimos 30 días)
- Pedidos por día
- Desglose por estado de pago
- Top 8 productos más vendidos

---

## 8. Sistema de Pagos

### A. Transferencia bancaria (activa por defecto)

El cliente realiza una transferencia y sube el comprobante. El admin confirma manualmente.

Configura los datos del banco en `.env.local`:
```env
BANK_NAME="Banco Pichincha"
BANK_ACCOUNT_NUMBER="2207654321"
BANK_ACCOUNT_OWNER="Velunisa S.A."
BANK_ACCOUNT_TYPE="Corriente"
NEXT_PUBLIC_BANK_NAME="Banco Pichincha"
NEXT_PUBLIC_BANK_NUMBER="2207654321"
NEXT_PUBLIC_BANK_OWNER="Velunisa S.A."
NEXT_PUBLIC_BANK_TYPE="Corriente"
```

### B. Tarjeta de crédito/débito — Paymentez

Cuando configuras las claves de Paymentez, aparece automáticamente la opción de pago con tarjeta junto a la transferencia.

**Registro:** [paymentez.com](https://paymentez.com)

```env
PAYMENTEZ_SERVER_APP_CODE="tu-server-code"
PAYMENTEZ_SERVER_APP_KEY="tu-server-key"
NEXT_PUBLIC_PAYMENTEZ_CLIENT_APP_CODE="tu-client-code"
NEXT_PUBLIC_PAYMENTEZ_CLIENT_APP_KEY="tu-client-key"
NEXT_PUBLIC_PAYMENTEZ_ENV="stg"   # → "prod" en producción
```

**Configurar webhook en Paymentez Dashboard:**
- URL: `https://velunisa.com/api/webhooks/paymentez`
- Esto asegura que los pagos asincrónicos también se confirmen

**Tarjetas de prueba (entorno stg):**
| Red | Número | Exp | CVC |
|-----|--------|-----|-----|
| Visa aprobada | 4111111111111111 | 12/25 | 123 |
| Mastercard aprobada | 5500005555555559 | 12/25 | 123 |
| Visa rechazada | 4000000000000002 | 12/25 | 123 |

---

## 9. Chat Luna (IA)

Luna es el asistente virtual de la tienda. Aparece como ícono flotante 💬 en todas las páginas.

### Lo que puede hacer Luna:

- **Recomendar productos** según la ocasión, aroma preferido o presupuesto
- **Mostrar tarjetas de producto** con enlace directo a la ficha
- **Consultar pedidos** — el cliente escribe su número de pedido (ej: `VEL-2024-00001`) y Luna muestra el estado
- **Respuestas rápidas** — botones predefinidos para preguntas frecuentes

### Configuración:

```env
ANTHROPIC_API_KEY="sk-ant-..."
```

Modelo usado: `claude-haiku-4-5` (rápido y económico).

---

## 10. Emails y Notificaciones

### Emails automáticos

| Momento | Contenido |
|---------|-----------|
| Pedido creado | Número de pedido, items, total, instrucciones de pago (datos bancarios) |
| Pago confirmado | Confirmación con enlace a seguimiento |
| Pedido enviado | Código de tracking, transportista, enlace al pedido |

**Configurar Resend:**
1. Registrarse en [resend.com](https://resend.com)
2. Verificar dominio `velunisa.com` → Domains → Add Domain
3. Copiar el API key
4. Configurar en `.env.local`:
```env
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="pedidos@velunisa.com"
```

### WhatsApp automático

Se envían mensajes por WhatsApp al:
- **Cliente** → confirmación de pago + tracking de envío
- **Número de la tienda** → notificación de nuevo pedido

```env
WHATSAPP_API_URL="..."
WHATSAPP_API_TOKEN="..."
NEXT_PUBLIC_WHATSAPP_NUMBER="+593XXXXXXXXX"
```

### Push Notifications (app móvil)

Se envían automáticamente cuando cambia el estado del pedido:
- ✅ Pago confirmado
- 📦 Preparando pedido
- 🚚 En camino (con tracking si aplica)
- 🎉 Entregado

No requiere configuración adicional — usa la API gratuita de Expo.

---

## 11. Mi Cuenta (cliente)

**URL:** `/mi-cuenta`

El cliente puede:
- Ver su nombre, email, teléfono
- **Editar perfil** (nombre y teléfono)
- **Cambiar contraseña** (requiere contraseña actual)
- Acceder a **Mis pedidos** con historial completo y estado en tiempo real

---

## 12. App Móvil

### Pantallas disponibles

| Pantalla | Descripción |
|----------|-------------|
| Inicio | Categorías + productos destacados |
| Tienda | Lista completa con buscador |
| Detalle de producto | Galería, variantes, agregar al carrito |
| Carrito | Items, cantidades, total |
| Checkout | Formulario de envío |
| Pago | Transferencia bancaria + referencia |
| Confirmación | Éxito con número de pedido |
| Mis pedidos | Buscar por número, ver estado |
| Mi cuenta | Login, registro, info del usuario |

### Correr en desarrollo

```bash
cd apps/mobile
npx expo start
# Escanea el QR con Expo Go en tu celular
```

### Configurar URL del API

En `apps/mobile/app.json`:
```json
{
  "expo": {
    "extra": {
      "apiUrl": "https://velunisa.com"
    }
  }
}
```

Para desarrollo local (si tu celular y computadora están en la misma red WiFi):
```json
{
  "extra": {
    "apiUrl": "http://192.168.X.X:3001"
  }
}
```

### Build para producción

```bash
# Instalar EAS CLI
npm install -g eas-cli
eas login

# Build Android (APK / AAB)
eas build --platform android

# Build iOS (requiere cuenta Apple Developer)
eas build --platform ios
```

---

## 13. Configuración y Deploy

### Deploy en Vercel

1. Sube el código a GitHub
2. En [vercel.com](https://vercel.com) → **Add New Project** → selecciona el repo
3. Configura:
   - **Root Directory:** `apps/web`
   - **Framework:** Next.js (auto-detectado)
4. Agrega todas las variables de entorno (sección 14)
5. Deploy ✅

### Base de datos en producción

SQLite no funciona en Vercel. Migra a PostgreSQL:

**Recomendado: [Neon](https://neon.tech)** (gratis hasta 0.5 GB)

1. Crea una DB en Neon → copia la `DATABASE_URL`
2. Cambia en `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```
3. Corre la migración:
```bash
DATABASE_URL="tu-postgres-url" npx prisma db push
DATABASE_URL="tu-postgres-url" npx tsx prisma/seed.ts
```

### Cron Jobs (publicaciones sociales)

El archivo `vercel.json` ya tiene configurado el cron:
```json
{
  "crons": [{
    "path": "/api/social/process-queue",
    "schedule": "*/5 * * * *"
  }]
}
```

Agrega en Vercel el secreto:
```
CRON_SECRET=un-string-aleatorio-largo
```

---

## 14. Variables de Entorno

Copia `apps/web/.env.example` a `apps/web/.env.local` y completa:

### Obligatorias

| Variable | Descripción | Dónde obtenerla |
|----------|-------------|-----------------|
| `DATABASE_URL` | URL de la DB | Local: `file:./prisma/dev.db` |
| `NEXTAUTH_SECRET` | Secreto JWT | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | URL de la app | `https://velunisa.com` |
| `ANTHROPIC_API_KEY` | Claude AI | [console.anthropic.com](https://console.anthropic.com) |

### Para pagos con tarjeta (opcional)

| Variable | Descripción |
|----------|-------------|
| `PAYMENTEZ_SERVER_APP_CODE` | Código servidor Paymentez |
| `PAYMENTEZ_SERVER_APP_KEY` | Clave servidor Paymentez |
| `NEXT_PUBLIC_PAYMENTEZ_CLIENT_APP_CODE` | Código cliente Paymentez |
| `NEXT_PUBLIC_PAYMENTEZ_CLIENT_APP_KEY` | Clave cliente Paymentez |
| `NEXT_PUBLIC_PAYMENTEZ_ENV` | `stg` o `prod` |

### Para emails

| Variable | Descripción |
|----------|-------------|
| `RESEND_API_KEY` | API key de Resend |
| `RESEND_FROM_EMAIL` | Email remitente |

### Para imágenes

| Variable | Descripción |
|----------|-------------|
| `CLOUDINARY_CLOUD_NAME` | Nombre del cloud |
| `CLOUDINARY_API_KEY` | API key |
| `CLOUDINARY_API_SECRET` | API secret |

### Para Google OAuth

| Variable | Descripción |
|----------|-------------|
| `GOOGLE_CLIENT_ID` | Client ID de Google |
| `GOOGLE_CLIENT_SECRET` | Client secret de Google |

---

## 15. Comandos de Desarrollo

```bash
# ── Web ──────────────────────────────────────────────────────
# Iniciar servidor de desarrollo
cd apps/web && npx next dev -p 3001

# Ver y editar la base de datos
cd apps/web && DATABASE_URL="file:./prisma/dev.db" npx prisma studio

# Aplicar cambios del schema a la DB
cd apps/web && DATABASE_URL="file:./prisma/dev.db" npx prisma db push

# Regenerar cliente Prisma
cd apps/web && DATABASE_URL="file:./prisma/dev.db" npx prisma generate

# Poblar con datos de prueba
cd apps/web && DATABASE_URL="file:./prisma/dev.db" npx tsx prisma/seed.ts

# Verificar TypeScript
cd apps/web && npx tsc --noEmit --skipLibCheck

# ── Mobile ───────────────────────────────────────────────────
# Iniciar en modo desarrollo
cd apps/mobile && npx expo start

# Build para Android
cd apps/mobile && eas build --platform android

# Build para iOS
cd apps/mobile && eas build --platform ios
```

---

*Manual generado automáticamente · Velunisa v1.0 · Abril 2026*
