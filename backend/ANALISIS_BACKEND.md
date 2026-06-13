# Analisis Tecnico Senior - Rueda de Negocios v2

Fecha: 2026-04-22
Alcance: revision de codigo backend (Node.js/Express/Mongoose) y frontend (HTML/CSS/JS vanilla), con foco en seguridad, consistencia funcional, mantenibilidad y calidad de ingenieria.

## Backend: problemas y mejoras

### 2) Control de acceso insuficiente en endpoints sensibles (Critica)
Problema:
- `POST /api/matches/generate` esta protegido solo por token, no por rol admin.
- `PUT /api/matches/status` permite cambiar estado de cualquier match si se conoce `matchId`.
- `POST /api/meetings` permite agendar en cualquier match aceptado sin verificar pertenencia.

Evidencia:
- `backend/routes/matchRoutes.js:6`
- `backend/routes/matchRoutes.js:8`
- `backend/routes/meetingRoutes.js:6`
- `backend/controllers/matchController.js`
- `backend/controllers/meetingController.js`

Impacto:
- Escalada horizontal de privilegios.
- Manipulacion de negocio por usuarios no autorizados.

Mejora propuesta:
- Aplicar middleware de autorizacion por rol/pertenencia:
  - Solo `adminSistema` (o `adminEvento`) para generar matches.
  - Solo participantes del match (y admins) para aceptar/rechazar/agendar.
- Validar ownership en controlador con consultas condicionadas.

### 3) Bug funcional en registro de archivos por uso incorrecto de helper (Alta)
Problema:
- `getFile` se define con un parametro (`field`) pero se invoca con dos (`req.files`, `"campo"`).
- Resultado: no encuentra archivos y devuelve `null` en todos los campos.

Evidencia:
- `backend/controllers/userController.js:22`
- `backend/controllers/userController.js:45`
- `backend/controllers/userController.js:49`

Impacto:
- Perdida silenciosa de archivos durante registro.
- Datos incompletos de onboarding.

Mejora propuesta:
- Corregir firma/uso de `getFile(field)`.
- Cubrir con test de integracion multipart para validar persistencia real de archivos.

### 4) Mapeo de campos inconsistente entre controlador y esquema (Alta)
Problema:
- El registro guarda campos top-level (`rutFile`, `certificadoExistenciaFile`, etc.) que no existen en `User` schema.
- El esquema espera `documentosFormalizados.*` y `documentosNoFormalizados.*`.

Evidencia:
- `backend/controllers/userController.js:55`
- `backend/models/User.js`

Impacto:
- Campos descartados por Mongoose (modo estricto), perdida de informacion.
- Frontend y backend quedan desalineados sobre estructura real.

Mejora propuesta:
- Normalizar DTO de entrada y persistir en rutas del esquema correcto.
- Introducir capa de mapping explicita (request -> domain model).
- Definir contrato OpenAPI/JSON Schema para evitar drift.

### 5) Uso de `this.sendNotification` potencialmente roto en Express callback (Alta)
Problema:
- `scheduleMeeting` llama `await this.sendNotification(...)`.
- En callbacks de Express, `this` no es un contrato fiable.

Evidencia:
- `backend/controllers/meetingController.js:28`

Impacto:
- Riesgo de error en tiempo de ejecucion al agendar reuniones.

Mejora propuesta:
- Llamar la funcion por referencia directa (`sendNotification(...)`) o extraer a servicio.
- Separar `meetingService` y `notificationService` para reducir acoplamiento.

### 6) Validaciones definidas pero no aplicadas en rutas (Alta)
Problema:
- Existe middleware `validator.js`, pero el registro y update no lo usan en routing.

Evidencia:
- `backend/middleware/validator.js:4`
- `backend/routes/userRoutes.js:22`

Impacto:
- Ingresan payloads inconsistentes.
- Mayor probabilidad de fallos de negocio y datos sucios.

Mejora propuesta:
- Enlazar validadores en rutas (`validateRegister`, `validateUpdateUser`).
- Consolidar validacion con `express-validator` + sanitizacion de entrada.


### 8) Endpoint de subida de archivos sin autenticacion ni limites (Alta)
Problema:
- `POST /api/uploads` no exige token.
- Multer no define `limits.fileSize`.

Evidencia:
- `backend/server.js:20`
- `backend/routes/uploadRoutes.js:7`
- `backend/middleware/upload.js:24`

Impacto:
- Riesgo de abuso de almacenamiento y DoS por archivos grandes.

Mejora propuesta:
- Proteger endpoint con `protect` y permisos.
- Definir limites de tamano y cantidad.
- Normalizar nombre de archivos, validar extension real y mover a storage externo.

### 9) Inconsistencia en actualizacion de estado de usuarios (Media)
Problema:
- Se asigna `estadoRegistro = req.body.estado` sin validar enum.

Evidencia:
- `backend/routes/userRoutes.js:72`

Impacto:
- Estados invalidos en base de datos.

Mejora propuesta:
- Validar explicitamente `pendiente|aprobado|rechazado`.
- Reutilizar middleware de validacion para esa ruta.

### 10) Doble middleware estatico duplicado (Media)
Problema:
- `app.use("/uploads", express.static(...))` se registra dos veces.

Evidencia:
- `backend/server.js:19`
- `backend/server.js:28`

Impacto:
- Configuracion redundante, ruido y potencial confusion operacional.

Mejora propuesta:
- Eliminar duplicado y centralizar bootstrap de middlewares.

