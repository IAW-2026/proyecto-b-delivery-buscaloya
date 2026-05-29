/**
 * ARCHIVO DE CONFIGURACIÓN: lib/prisma.ts
 * DESCRIPCIÓN: Inicializa y exporta la instancia del cliente de base de datos de Prisma (`prisma`).
 * CARACTERÍSTICAS:
 *   - Implementa el adaptador de PostgreSQL `@prisma/adapter-pg` usando un pool de conexiones `pg`.
 *   - Optimizado para resolver concurrencias y soportar PGBouncer en producción con Supabase.
 */
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const connectionString = `${process.env.DATABASE_URL}`

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
export const prisma = new PrismaClient({ adapter })
