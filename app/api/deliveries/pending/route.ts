/**
 * API ENDPOINT: GET /api/deliveries/pending
 * DESCRIPCIÓN: Devuelve una lista de todos los envíos pendientes de asignación de dron (estado ACCEPTED_FOR_ASSIGNMENT).
 * ROL EN EL ECOSISTEMA: Utilizado por el Radar Táctico mediante short-polling (cada 3s) para detectar nuevos envíos automáticamente.
 */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const pendingDeliveries = await prisma.delivery.findMany({
      where: {
        status: 'ACCEPTED_FOR_ASSIGNMENT'
      },
      include: {
        snapshot: true
      },
      orderBy: {
        created_at: 'asc'
      }
    });

    return NextResponse.json(pendingDeliveries);
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
