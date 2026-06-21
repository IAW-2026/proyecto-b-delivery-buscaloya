import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DeliveryStatus, AvailabilityStatus, AssignmentStatus, EventSource } from '@prisma/client';
import { mockNotifyOrderStatusChange } from '@/lib/mock-external';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Ejecutar todo de forma atómica en una transacción de base de datos
    const delivery = await prisma.$transaction(async (tx) => {
      // 1. Obtener la entrega activa para validar que exista e incluir asignaciones activas
      const currentDelivery = await tx.delivery.findUnique({
        where: { id },
        include: {
          assignments: {
            where: { status: AssignmentStatus.ASSIGNED },
            orderBy: { assigned_at: 'desc' },
            take: 1
          }
        }
      });

      if (!currentDelivery) {
        throw new Error('Delivery not found');
      }

      // 2. Si tiene un dron (courier) asignado, desvincularlo y liberarlo
      if (currentDelivery.assignments.length > 0) {
        const activeAssignment = currentDelivery.assignments[0];

        // Liberar al dron poniéndolo disponible y retornándolo a la base (5000, 5000)
        await tx.courier.update({
          where: { id: activeAssignment.courier_id },
          data: {
            status: AvailabilityStatus.AVAILABLE,
            last_x: 5000,
            last_y: 5000
          }
        });

        // Desvincular el dron de la orden cambiando el estado de la asignación a CANCELLED
        await tx.deliveryAssignment.update({
          where: { id: activeAssignment.id },
          data: {
            status: AssignmentStatus.CANCELLED,
            resolved_at: new Date()
          }
        });
      }

      // 3. Registrar el evento de estado de cancelación
      await tx.deliveryStatusEvent.create({
        data: {
          delivery_id: id,
          status: DeliveryStatus.CANCELLED_SUCCESSFULLY,
          source: EventSource.SYSTEM,
          reason: 'Misión abortada por solicitud de cancelación del cliente'
        }
      });

      // 4. Actualizar el estado de la entrega a cancelada
      return await tx.delivery.update({
        where: { id },
        data: { status: DeliveryStatus.CANCELLED_SUCCESSFULLY }
      });
    });

    // 5. Notificar a la Buyer App (fuera de la transacción de forma segura)
    await mockNotifyOrderStatusChange(delivery.order_id, 'CANCELLED_SUCCESSFULLY', 'Misión abortada');

    return NextResponse.json({
      success: true,
      message: 'Delivery cancelled successfully',
      delivery
    });
  } catch (error: any) {
    console.error('Error cancelling delivery:', error);
    return NextResponse.json({ error: error.message || 'Failed to cancel delivery' }, { status: 400 });
  }
}
