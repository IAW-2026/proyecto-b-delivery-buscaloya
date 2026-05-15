# Bitácora de Desarrollo - Iteración 1

**Fecha:** 13 de Mayo de 2026
**Fase:** Fase 1 (Base Funcional)

## Resumen de la Iteración
En esta iteración nos enfocamos en levantar la estructura base del proyecto, conectar la base de datos de producción (usando Supabase) y dejar el backend listo para gestionar las entidades principales, respetando el principio de la menor cantidad de código posible.

## Tareas Completadas

1. **Setup de Next.js**: 
   - Generación del proyecto `delivery-app` usando el App Router, Tailwind v4 y TypeScript.
   - Limpieza del código por defecto (Next.js boilerplate) para tener un lienzo en blanco.

2. **Estructura de Rutas Frontend (Esqueletos)**:
   - Se crearon los archivos base para `/dashboard` y el panel `/admin` (`/admin/couriers`, `/admin/couriers/new`), garantizando que la estructura de URLs cumpla con la consigna de la Etapa 2.

3. **Base de Datos y Prisma v7**:
   - Se integró `@prisma/client` y `@prisma/adapter-pg`.
   - Se configuró la conexión directa a **Supabase (São Paulo)** en el archivo `.env`.
   - Creación del `schema.prisma` definiendo 6 entidades (`Delivery`, `Courier`, `DeliveryAssignment`, `DeliveryTrackingPoint`, `DeliveryStatusEvent`, `DeliveryContextSnapshot`) y sus respectivos Enums.

4. **Inyección de Datos (Seed)**:
   - Se programó y ejecutó `seed.ts` para cargar datos iniciales (repartidores y entregas) requeridos para testear la app sin cargar info manualmente.

5. **Contratos API (Backend)**:
   - Se expusieron los 4 endpoints obligatorios de la Etapa 1:
     - `POST /api/delivery-requests`
     - `POST /api/deliveries/quote`
     - `GET /api/deliveries/[id]/tracking`
     - `POST /api/deliveries/[id]/cancel`

## Notas y Decisiones Técnicas
- **Latencia**: Se optó por abandonar PostgreSQL local y Neon en favor de Supabase (São Paulo) para evitar dolores de cabeza con el ping (150ms+), logrando una respuesta mucho más rápida (~40ms) desde Argentina.
- **Prisma Adapters**: Se usó el driver nativo de `pg` y el `driverAdapter` de Prisma v7 debido a las restricciones de las nuevas versiones, centralizando el singleton en `lib/prisma.ts`.
