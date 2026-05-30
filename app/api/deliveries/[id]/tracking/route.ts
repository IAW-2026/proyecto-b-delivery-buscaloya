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
    
    // Buscar primero por ID interno (uuid) o por order_id
    const delivery = await prisma.delivery.findFirst({
      where: {
        OR: [
          { id: id },
          { order_id: id }
        ]
      },
      include: {
        tracking_points: {
          orderBy: { timestamp: 'desc' },
          take: 1
        },
        assignments: {
          where: { status: 'ASSIGNED' },
          include: { courier: true },
          take: 1
        }
      }
    });

    if (!delivery) {
      return NextResponse.json({ error: 'Delivery not found' }, { status: 404 });
    }

    // Calcular geolocalización GPS real en Bahía Blanca
    let lat = -38.7196; // Fallback centro de Bahía Blanca
    let lng = -62.2724; // Fallback centro de Bahía Blanca

    if (delivery.tracking_points.length > 0) {
      lat = delivery.tracking_points[0].lat;
      lng = delivery.tracking_points[0].lon;
    } else if (delivery.assignments.length > 0) {
      const courier = delivery.assignments[0].courier;
      if (courier && courier.last_x !== null && courier.last_y !== null) {
        // Conversión inversa de coordenadas cartesianas (0-10000) a lat/lon geográficas
        const x_percentage = courier.last_x / 10000;
        const y_percentage = courier.last_y / 10000;
        
        const MAP_BOUNDS = {
          n: -38.68,
          s: -38.76,
          w: -62.33,
          e: -62.21
        };

        lng = MAP_BOUNDS.w + x_percentage * (MAP_BOUNDS.e - MAP_BOUNDS.w);
        lat = MAP_BOUNDS.n - y_percentage * (MAP_BOUNDS.n - MAP_BOUNDS.s);
      }
    }

    return NextResponse.json({
      status: delivery.status,
      lat: Number(lat.toFixed(6)),
      lng: Number(lng.toFixed(6))
    });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
