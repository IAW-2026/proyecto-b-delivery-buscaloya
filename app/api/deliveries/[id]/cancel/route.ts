/**
 * API ENDPOINT: POST /api/deliveries/[id]/cancel
 * DESCRIPCIÓN: Cancela una misión de entrega activa marcando su estado como CANCELLED_SUCCESSFULLY en Supabase.
 * ROL EN EL ECOSISTEMA: Utilizado de forma aislada en Etapa 2 y consumido por otros módulos en Etapa 3.
 */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DeliveryStatus } from '@prisma/client';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const delivery = await prisma.delivery.update({
      where: { id },
      data: { status: DeliveryStatus.CANCELLED_SUCCESSFULLY }
    });

    return NextResponse.json({
      success: true,
      message: 'Delivery cancelled',
      delivery
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to cancel delivery' }, { status: 400 });
  }
}
