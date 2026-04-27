# Arquitectura Frontend - Rueda de Negocios (Next.js)

## Objetivo del refactor

Migrar de una base HTML/CSS/JS vanilla a una arquitectura escalable basada en Next.js + React, orientada a una plataforma SaaS multi-rol con foco en UX operativa y mantenibilidad.

## Stack implementado

- Next.js (App Router)
- Tailwind CSS
- TanStack React Query
- Zustand
- React Hook Form + Zod

## Estructura por features

```txt
frontend-next/
  app/
    (auth)/login/
    (app)/dashboard/
    (app)/usuarios/
    (app)/eventos/
    (app)/mensajes/
    (app)/reuniones/
  features/
    auth/
    dashboard/
    usuarios/
    eventos/
    mensajes/
    reuniones/
  shared/
    api/
    types/
  store/
  components/
    layout/
    ui/
```

## Decisiones UX/UI

- Interfaz diferenciada por rol: navegación y permisos por perfil de usuario.
- Layout de consola SaaS: sidebar contextual + contenido principal.
- Jerarquía visual reforzada:
  - Headlines claros por módulo.
  - KPIs visibles en cards.
  - Acciones críticas (aprobar/rechazar) con contraste y semántica de color.
- Estados explícitos en cada flujo:
  - loading
  - error
  - empty
  - success
- Diseño mobile-first: tablas degradan a cards en pantallas pequeñas.

## Capa de datos

- React Query para consultas y mutaciones.
- Invalidación de caché post-mutation para sincronización inmediata.
- Cliente API único (`shared/api/client.ts`) con manejo estándar de errores.

## Estado global

- Zustand (`store/auth-store.ts`) para sesión, usuario actual y rol.
- Persistencia en `sessionStorage` para reducir exposición prolongada del JWT.
- Guard de rutas (`ProtectedLayout`) con control por rol y redirección segura.

## Performance aplicada

- Code splitting por rutas de App Router.
- Lazy loading explícito con `next/dynamic` en módulos pesados (`dashboard`, `usuarios`, `eventos`).
- Memoización de navegación por rol en el shell principal.
- Configuración de React Query para evitar refetch innecesario (`staleTime`, `refetchOnWindowFocus=false`).

## Seguridad frontend

- Render condicional por rol antes de exponer vistas sensibles.
- Rutas protegidas con verificación de sesión + permisos.
- Headers `Authorization: Bearer` centralizados en cliente API.

Nota: para seguridad de nivel producción, se recomienda migrar JWT a cookie `HttpOnly` y actualizar backend para refresh tokens.

## Módulos funcionales implementados (ejemplo)

- Dashboard por rol (`/dashboard`)
- Gestión de usuarios pendientes (`/usuarios`)
- Gestión de eventos:
  - creación para `adminEvento`
  - moderación (aprobar/rechazar) para `adminSistema` (`/eventos`)

## Resultado técnico

- Proyecto compilando correctamente (`npm run typecheck` y `npm run build`).
- Base lista para extender flujos de mensajería en tiempo real, agenda avanzada y reportes.
