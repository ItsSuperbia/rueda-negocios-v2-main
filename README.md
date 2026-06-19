# 🚀 Rueda de Negocios - Guía de Instalación y Ejecución

Esta guía te ayudará a configurar y ejecutar la aplicación de Rueda de Negocios en tu máquina local.

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado lo siguiente:

1. **Node.js** (versión 16 o superior)
   - Descargar desde: https://nodejs.org/
   - Verificar instalación: `node --version`

2. **Git** (para clonar el repositorio)
   - Descargar desde: https://git-scm.com/

**Nota**: ✅ **Necesitas instalar MongoDB para ejecución local**. 

## 📥 Paso 1: Clonar el Repositorio

```bash
git clone https://github.com/faibe1118/rueda-negocios-v2.git
cd rueda-negocios-v2
```

## 🔧 Paso 2: Configurar el Backend

### 2.1 Navegar a la carpeta backend
```bash
cd backend
```

### 2.2 Instalar dependencias
```bash
npm install
```

### 2.3.0 Verificar DB Engine 
Asegurate de que el servicio de mongoDB este activo
```
sudo systemctl status mongod
```
Si aparece **Disable** ejecuta
```
sudo systemctl start mongod
```

### 2.3.1 Crear archivo de configuración `.env`

Crea un archivo llamado `.env` en la carpeta `backend` con el siguiente contenido:

```env
MONGO_URI=mongodb://localhost:27017/rueda-negocios #Uri de la base de datos 
PORT=4000 #puerto donde quieres que corra el backend 
JWT_SECRET=my_jwt_secret_key #jwt key para autenticación
```

**Importante**: 
- ⚠️ Este archivo `.env` **NO se debe subir a GitHub** (ya está en `.gitignore`)
- ✅ Todos los miembros del equipo deben usar la misma configuración

### 2.4 Crear usuario administrador

Ejecuta el siguiente comando para crear un usuario admin de prueba:

```bash
node createAdmin.js
```

Deberías ver un mensaje como:
```
✅ MongoDB conectado
✅ Admin creado exitosamente:
   Email: admin@ruedanegocios.com
   Password: admin123
```

**Credenciales del Admin:**
- Email: `admin@ruedanegocios.com`
- Password: `admin123`

## ▶️ Paso 3: Ejecutar el Backend

Desde la carpeta `backend`, ejecuta:

```bash
npm start
```

Deberías ver:
```
🔥 Servidor backend corriendo en http://localhost:4000
```

**¡No cierres esta terminal!** El servidor debe estar corriendo para que la aplicación funcione.


## 🎯 Paso 5: Usar la Aplicación

### 5.1 Iniciar sesión como Administrador

1. En la página de login, ingresa:
   - **Email**: `admin@ruedanegocios.com`
   - **Password**: `admin123`

2. Haz clic en "Iniciar Sesión"

3. Serás redirigido al **Panel de Administrador**

### 5.2 Generar Matches Automáticos (Admin)

1. En el panel de administrador, haz clic en el botón:
   ```
   ⚡ Generar Matches Automáticos
   ```

2. Confirma la acción

3. El sistema emparejará automáticamente empresas ofertantes y demandantes del mismo sector

### 5.3 Gestionar Usuarios (Admin)

1. Haz clic en "👥 Gestión de Usuarios"
2. Podrás ver, aprobar o rechazar usuarios registrados

### 5.4 Registrar una Empresa

1. Cierra sesión del admin
2. En la página de login, haz clic en "Registrarse"
3. Completa el formulario con los datos de la empresa
4. Selecciona el rol:
   - **Ofertante**: Empresa que ofrece productos/servicios
   - **Demandante**: Empresa que busca proveedores

### 5.5 Ver Matches (Usuario)

1. Inicia sesión como usuario (ofertante o demandante)
2. Ve a "🤝 Mis Matches"
3. Verás las empresas compatibles
4. Puedes:
   - ✅ Aceptar un match
   - ❌ Rechazar un match

### 5.6 Agendar Reunión

1. Una vez que aceptes un match, aparecerá el botón "📅 Agendar Cita"
2. Haz clic y completa:
   - Fecha y hora de inicio
   - Fecha y hora de fin
   - Lugar/Mesa
3. Confirma la cita

### 5.7 Ver Agenda

1. Ve a "📅 Mi Agenda"
2. Verás todas tus reuniones programadas con:
   - Fecha y hora
   - Empresa con la que te reunirás
   - Lugar asignado

## 🛠️ Solución de Problemas

### Error: "Cannot connect to MongoDB"

**Solución:**
1. Verifica que tienes conexión a internet (MongoDB Atlas requiere conexión)
2. Verifica que el archivo `.env` tenga la URL correcta de MongoDB Atlas
3. Si el problema persiste, contacta al administrador del equipo que configuró MongoDB Atlas

### Error: "MongoNetworkError" o "Connection timeout"

**Solución:**
1. Verifica tu conexión a internet
2. Puede ser un problema temporal de MongoDB Atlas, espera unos minutos e intenta de nuevo
3. Verifica que no estés detrás de un firewall que bloquee la conexión

### Error: "Port 4000 already in use"

**Solución:**
1. Cambia el puerto en el archivo `.env`:
   ```env
   PORT=5000
   ```

2. Reinicia el servidor backend

### Error: "Module not found"

**Solución:**
1. Asegúrate de estar en la carpeta `backend`
2. Ejecuta nuevamente:
   ```bash
   npm install
   ```

### La página no carga o muestra errores de CORS

**Solución:**
1. Verifica que el backend esté corriendo en `http://localhost:4000`
2. Usa Live Server en lugar de abrir el archivo directamente
3. Verifica que los archivos de servicio (`matchService.js`, `meetingService.js`) tengan la URL correcta del API

## 📁 Estructura del Proyecto

```
└── 📁rueda-negocios-v2-main
    └── 📁backend
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

1. **Mantener** la terminal del backend abierta mientras uses la aplicación
2. **No compartir** el archivo `.env` en el repositorio (ya está en `.gitignore`)
3. **Tener MongoDB corriendo con la base de datos creada** para que la aplicación pueda conectarse a MongoDB Atlas

---

**Desarrollado por el equipo de Rueda de Negocios v2**
