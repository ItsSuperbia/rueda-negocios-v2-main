# Ejecucion del frontend

## Requisitos
- Node.js 18+ (recomendado LTS).
- npm (incluido con Node.js).

## Configuracion
1. Verifica el archivo de variables de entorno:
   - `.env.local` debe contener `NEXT_PUBLIC_API_URL`.

## Instalacion
Desde la carpeta `frontend-next`:

```bash
npm install
```

## Desarrollo
Inicia el servidor de desarrollo:

```bash
npm run dev
```

Luego abre:
- http://localhost:3000

## Build de produccion
Genera el build:

```bash
npm run build
```

## Ejecucion de produccion
Inicia el servidor en modo produccion (luego del build):

```bash
npm run start
```

## Notas
- Si cambias `NEXT_PUBLIC_API_URL`, reinicia el servidor de desarrollo.
- El frontend usa Next.js App Router y Tailwind CSS.
