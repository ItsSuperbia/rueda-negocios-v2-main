# 🚀 Rueda de Negocios - Guía de Instalación y Ejecución

Esta guía te ayudará a configurar y ejecutar la aplicación de Rueda de Negocios utilizando Docker.

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

### 1. Git

Descargar desde:

https://git-scm.com/

Verificar instalación:

```bash
git --version
```

### 2. Docker

Descargar desde:

https://www.docker.com/products/docker-desktop/

Verificar instalación:

```bash
docker --version
docker compose version
```

---

## 📥 Paso 1: Clonar el Repositorio

```bash
git clone https://github.com/faibe1118/rueda-negocios-v2.git

cd rueda-negocios-v2
```

---

## ⚙️ Paso 2: Configurar Variables de Entorno

### Backend

Crear el archivo:

```text
backend/.env
```

con el siguiente contenido:

```env
MONGO_URI=mongodb://mongodb:27017/rueda-negocios
PORT=4000
JWT_SECRET=my_jwt_secret_key
```

### Frontend

Crear el archivo:

```text
frontend-next/.env.local
```

con el siguiente contenido:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

---

## 🐳 Paso 3: Levantar los Contenedores

Desde la raíz del proyecto ejecutar:

```bash
docker compose up -d --build
```

Verificar que los contenedores estén ejecutándose:

```bash
docker ps
```

Deberías ver:

```text
rueda-negocios-mongodb
rueda-negocios-backend
rueda-negocios-frontend
```

---

## 🗄️ Paso 4: Restaurar la Base de Datos

El proyecto incluye un respaldo de la base de datos en la carpeta:

```text
backup/
```

Una vez que MongoDB esté ejecutándose:

```bash
mongorestore \
  --host localhost \
  --port 27018 \
  --drop \
  ./backup
```

### Verificar restauración

Ingresar al contenedor de MongoDB:

```bash
docker compose exec mongodb mongosh
```

Seleccionar la base de datos:

```javascript
use("rueda-negocios")
```

Mostrar colecciones:

```javascript
show collections
```

---

## 🌐 Paso 5: Acceder a la Aplicación

### Frontend

```text
http://localhost:3000
```

### Backend

```text
http://localhost:4000
```

---

## 🔑 Credenciales de Prueba

Si la base de datos restaurada contiene el usuario administrador:

```text
Email: admin@ruedanegocios.com
Password: admin123
```

---

## 🛠️ Comandos Útiles

### Ver logs del backend

```bash
docker compose logs -f backend
```

### Ver logs del frontend

```bash
docker compose logs -f frontend
```

### Ver logs de MongoDB

```bash
docker compose logs -f mongodb
```

### Acceder al contenedor MongoDB

```bash
docker compose exec mongodb mongosh
```

### Detener la aplicación

```bash
docker compose down
```

### Eliminar contenedores y base de datos

⚠️ **Advertencia:** Este comando elimina también los datos almacenados en MongoDB.

```bash
docker compose down -v
```

---

## 📌 Notas Importantes

- No es necesario instalar MongoDB localmente.
- MongoDB se ejecuta automáticamente dentro de Docker.
- La base de datos debe restaurarse desde el backup incluido en el proyecto.
- El backend se conecta a MongoDB mediante la red interna de Docker usando:

```env
MONGO_URI=mongodb://mongodb:27017/rueda-negocios
```

- El frontend consume la API mediante:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

- Si se modifica alguna variable de entorno, es recomendable reconstruir los contenedores:

```bash
docker compose down
docker compose up -d --build
``
## 📁 Estructura del Proyecto

```
└── 📁rueda-negocios-v2-main
    └── 📁backend
        └── Dockerfile # Construccioón del contenedor
        └── 📁config
            ├── database.js
        └── 📁controllers
            ├── eventoController.js
            ├── matchController.js
            ├── meetingController.js
            ├── notificationController.js
            ├── userController.js
        └── 📁middleware
            ├── adminMiddleware.js
            ├── authMiddleware.js
            ├── upload.js
            ├── validator.js
        └── 📁models
            ├── Evento.js
            ├── EventoInscripcion.js
            ├── Match.js
            ├── Meeting.js
            ├── Notification.js
            ├── TableReservation.js
            ├── User.js
        └── 📁routes
            ├── eventoRoutes.js
            ├── index.js
            ├── matchRoutes.js
            ├── meetingRoutes.js
            ├── notificationRoutes.js
            ├── uploadRoutes.js
            ├── userRoutes.js
        └── 📁services
            ├── meetingService.js
            ├── notificationService.js
            ├── reminderJob.js
        └── 📁uploads
        ├── .env
        ├── createAdmin.js
        ├── server.js
    └── 📁frontend-next
        └── Dockerfile # Construccioón del contenedor
        └── 📁app
            └── 📁(app)
                └── 📁dashboard
                    ├── page.tsx
                └── 📁eventos
                    ├── page.tsx
                └── 📁matches
                    ├── page.tsx
                └── 📁mensajes
                    ├── page.tsx
                └── 📁notificaciones
                    ├── page.tsx
                └── 📁perfil
                    ├── page.tsx
                └── 📁reuniones
                    ├── page.tsx
                └── 📁usuarios
                    ├── page.tsx
                ├── layout.tsx
                ├── navbar-notification-bell.tsx
            └── 📁(auth)
                └── 📁login
                    ├── page.tsx
                └── 📁proteccion-datos
                    ├── page.tsx
                └── 📁register
                    ├── page.tsx
            ├── globals.css
            ├── layout.tsx
            ├── page.tsx
        └── 📁components
            └── 📁layout
                ├── app-shell.tsx
                ├── protected-layout.tsx
            └── 📁ui
                ├── button.tsx
                ├── card.tsx
                ├── empty-state.tsx
                ├── status-chip.tsx
        └── 📁features
            └── 📁auth
                └── 📁components
                    ├── data-policy-modal.tsx
                    ├── login-form.tsx
                    ├── register-form.tsx
                ├── api.ts
                ├── hooks.ts
                ├── schema.ts
            └── 📁dashboard
                └── 📁components
                    ├── role-dashboard.tsx
                ├── api.ts
            └── 📁eventos
                └── 📁components
                    ├── admin-evento-eventos.tsx
                    ├── empresa-eventos.tsx
                    ├── evento-create-form.tsx
                    ├── evento-inscripciones-panel.tsx
                    ├── eventos-workspace.tsx
                ├── api.ts
                ├── schema.ts
            └── 📁matches
                └── 📁components
                    ├── admin-match-panel.tsx
                    ├── empresa-match-panel.tsx
                    ├── match-card.tsx
                    ├── match-detail-modal.tsx
                    ├── match-stats.tsx
                    ├── matches-workspace.tsx
                ├── api.ts
                ├── schema.ts
            └── 📁mensajes
                └── 📁components
            └── 📁notificaciones
                └── 📁components
                    ├── notification-bell.tsx
                    ├── notifications-page.tsx
                ├── api.ts
                ├── hooks.ts
            └── 📁perfil
                └── 📁components
                    ├── profile-workspace.tsx
                ├── api.ts
                ├── schema.ts
            └── 📁reuniones
                └── 📁components
                    ├── reuniones-workspace.tsx
                ├── api.ts
            └── 📁usuarios
                └── 📁components
                    ├── user-management-board.tsx
                ├── api.ts
        └── 📁lib
            ├── cn.ts
            ├── providers.tsx
        └── 📁public
            └── 📁images
                └── 📁branding
                    ├── endless-constellation.svg
                └── 📁hero
                    ├── hero_main_img.jpg
                    ├── hero_sec_img_left.jpg
                    ├── hero_sec_img_right.jpg
                    ├── hero_sec_main_right.jpg
                    ├── hero_serv_deals_img.jpg
                    ├── hero_serv_reunions_img.jpg
                    ├── hero_serv_room_img.jpg
                └── 📁icons
                    ├── icon_favicon_EventConnect.jpg
                    ├── icon_favicon_EventConnect.png
                    ├── icon_navbar_logo_EventConnect.jpg
                    ├── icon_navbar_logo_EventConnect.png
        └── 📁shared
            └── 📁api
                ├── client.ts
            └── 📁types
                ├── domain.ts
        └── 📁store
            ├── auth-store.ts
        ├── .env.localn
    └── README.md
    └── docker-compose.yaml # Construcción y despligue de contenedores
    └── backup-db
            ├── rueda-negocios # Populacion inicial de la base de datos


```

## 🔐 Credenciales de Prueba

### Administrador del Sistema
- **Email**: `admin@ruedanegocios.com`
- **Password**: `admin123`

### Crear más usuarios
Para crear usuarios de prueba (ofertantes/demandantes), usa el formulario de registro en la aplicación.

## 📞 Soporte

Si encuentras algún problema que no está cubierto en esta guía:

1. Revisa los logs del servidor en la terminal donde ejecutaste `npm start`
2. Verifica la consola del navegador (F12) para errores de JavaScript
3. Contacta al equipo de desarrollo

## 🎉 ¡Listo!

Ahora tu equipo puede ejecutar la aplicación sin problemas. Recuerda:

**Desarrollado por el equipo de Rueda de Negocios v2 - 2026**
**Mención honorifica: ItsSuperbia**
