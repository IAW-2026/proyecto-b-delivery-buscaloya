/**
 * API ENDPOINT: GET /api/deliveries/[id]/tracking
 * DESCRIPCIÓN: Consulta de telemetría de dron. Devuelve el estado actual de la entrega y el último punto de geolocalización.
 * ROL EN EL ECOSISTEMA: Consumido por el cliente (Buyer App) para visualizar el dron en su mapa en tiempo real.
 */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const delivery = await prisma.delivery.findUnique({
      where: { id },
      include: {
        tracking_points: {
          orderBy: { timestamp: 'desc' },
          take: 1
        }
      }
    });

    if (!delivery) {
      return NextResponse.json({ error: 'Delivery not found' }, { status: 404 });
    }

    return NextResponse.json({
      status: delivery.status,
      last_location: delivery.tracking_points[0] || null
    });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
