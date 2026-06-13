# Resumen de mejoras backend

## Seguridad y autorizacion
- Se restringio la generacion de matches a roles adminSistema y adminEvento.
- Se agregaron validaciones de pertenencia para actualizar estados de match y agendar reuniones.
- La subida de archivos ahora requiere autenticacion.

## Validaciones y consistencia de datos
- Se aplicaron validaciones de registro y actualizacion en las rutas de usuario.
- Se valida el estado de registro permitido al aprobar o rechazar usuarios.
- Se ajusto la lectura de checkbox de terminos para aceptar valores comunes.

## Archivos y documentos
- Se corrigio el mapeo de archivos del registro para usar documentosFormalizados y documentosNoFormalizados.
- Se normalizaron los nombres de archivos subidos y se agrego limite de tamano.

## Estabilidad
- Se corrigio la llamada a sendNotification en el controlador de reuniones.
- Se elimino middleware duplicado para /uploads en el servidor.
