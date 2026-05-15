# Bitácora de Desarrollo - Iteración 2

**Fecha:** 13 de Mayo de 2026
**Fase:** Fase 2 (Auth, APIs Externas y Mocks)

## Resumen de la Iteración
El objetivo de esta iteración fue cumplir con los requerimientos técnicos "pesados" de la Etapa 2 de forma aislada, incluyendo la autenticación, validación de datos en el servidor y consumo de APIs (externas e internas mockeadas).

## Tareas Completadas

1. **Autenticación (Clerk)**:
   - Se integró el `<ClerkProvider>` en el `app/layout.tsx`.
   - Se configuró el `proxy.ts` (middleware en Next.js 16) para proteger todas las rutas bajo `/admin` y `/dashboard`.
   - Se crearon las rutas para el login y registro (`/sign-in` y `/sign-up`).

2. **Validación Server-Side (Zod)**:
   - Se implementó un esquema de Zod estricto en el endpoint `POST /api/delivery-requests` para garantizar que toda orden que entra tenga los IDs y coordenadas obligatorias.

3. **Consumo de API Externa (Open-Meteo)**:
   - Se actualizó `app/dashboard/page.tsx` (como Server Component) para hacer un fetch real a la API meteorológica de Open-Meteo, trayendo el clima actual de Bahía Blanca y mostrando los datos junto con el listado de entregas recientes directamente desde Prisma.

4. **Mocks de Aislamiento**:
   - Se generó el archivo `lib/mock-external.ts` exportando funciones simuladas (`notifyOrderStatusChange`, `notifyPaymentClose`) para que la Delivery App pueda interactuar con el ecosistema sin romper el aislamiento requerido en esta etapa.

## Notas Finales
- Se inyectaron exitosamente las claves de entorno de Clerk (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` y `CLERK_SECRET_KEY`) en el archivo `.env`. Con esto, la autenticación y protección de rutas del panel de administración quedan operativas localmente.
- El despliegue a Vercel se programó para realizarse después de aplicar la estética (Fase 3), tal como se acordó en el flujo de trabajo inicial.
