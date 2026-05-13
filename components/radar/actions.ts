'use server';

import { prisma } from '@/lib/prisma';
import { mockNotifyOrderStatusChange, mockNotifyPaymentClose } from '@/lib/mock-external';
import { DeliveryStatus, AvailabilityStatus, EventSource } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export async function assignCourier(deliveryId: string, courierId: string) {
  try {
    await prisma.$transaction(async (tx) => {
      // 1. Verificar que el courier está disponible
      const courier = await tx.courier.findUnique({ where: { id: courierId } });
      if (courier?.status !== 'AVAILABLE') throw new Error('Courier no disponible');

      // 2. Generar Color Táctico 100% Aleatorio (Hexadecimal)
      const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0').toUpperCase();

      await tx.delivery.update({
        where: { id: deliveryId },
        data: { 
          status: 'COURIER_ASSIGNED',
          color_code: randomColor
        }
      });

      // 3. Actualizar Courier
      await tx.courier.update({
        where: { id: courierId },
        data: { status: 'ASSIGNED' }
      });

      // 4. Crear Asignación
      await tx.deliveryAssignment.create({
        data: {
          delivery_id: deliveryId,
          courier_id: courierId,
          status: 'ASSIGNED'
        }
      });

      // 5. Registrar Evento
      await tx.deliveryStatusEvent.create({
        data: {
          delivery_id: deliveryId,
          status: 'COURIER_ASSIGNED',
          source: 'SYSTEM',
          reason: 'Dron asignado desde Radar'
        }
      });
    });

    const delivery = await prisma.delivery.findUnique({ where: { id: deliveryId } });
    if (delivery) {
      await mockNotifyOrderStatusChange(delivery.order_id, 'COURIER_ASSIGNED', 'Dron en vuelo a origen');
    }

    revalidatePath('/admin/dispatch');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function updateDeliveryStatus(deliveryId: string, newStatus: DeliveryStatus) {
  try {
    await prisma.$transaction(async (tx) => {
      // Actualizar Delivery
      await tx.delivery.update({
        where: { id: deliveryId },
        data: { status: newStatus }
      });

      // Evento
      await tx.deliveryStatusEvent.create({
        data: {
          delivery_id: deliveryId,
          status: newStatus,
          source: 'SYSTEM',
          reason: `Cambio manual desde Radar`
        }
      });

      // Si se recoge el pedido, el dron ya está físicamente en el local
      if (newStatus === 'PICKED_UP') {
        const delivery = await tx.delivery.findUnique({
          where: { id: deliveryId },
          include: { snapshot: true, assignments: { where: { status: 'ASSIGNED' }, take: 1 } }
        });
        const courierId = delivery?.assignments[0]?.courier_id;
        if (courierId && delivery.snapshot) {
          await tx.courier.update({
            where: { id: courierId },
            data: {
              last_x: delivery.snapshot.seller_x,
              last_y: delivery.snapshot.seller_y
            }
          });
        }
      }

      // Si se entrega, el dron termina en la casa del cliente
      if (newStatus === 'DELIVERED') {
        const delivery = await tx.delivery.findUnique({
          where: { id: deliveryId },
          include: { snapshot: true, assignments: { where: { status: 'ASSIGNED' }, take: 1 } }
        });
        const courierId = delivery?.assignments[0]?.courier_id;
        if (courierId && delivery.snapshot) {
          await tx.courier.update({
            where: { id: courierId },
            data: {
              last_x: delivery.snapshot.buyer_x,
              last_y: delivery.snapshot.buyer_y
            }
          });
        }
      }

      // Si es estado final, liberar courier
      if (['DELIVERED', 'CANCELLED_SUCCESSFULLY', 'DELIVERY_FAILED'].includes(newStatus)) {
        const assignment = await tx.deliveryAssignment.findFirst({
          where: { delivery_id: deliveryId, status: 'ASSIGNED' },
          orderBy: { assigned_at: 'desc' }
        });
        if (assignment) {
          await tx.courier.update({
            where: { id: assignment.courier_id },
            data: { status: 'AVAILABLE' }
          });
          await tx.deliveryAssignment.update({
            where: { id: assignment.id },
            data: { resolved_at: new Date() }
          });
        }
      }
    });

    const delivery = await prisma.delivery.findUnique({ where: { id: deliveryId } });
    if (delivery) {
      if (newStatus === 'PICKED_UP') {
        await mockNotifyOrderStatusChange(delivery.order_id, 'PICKED_UP', 'Carga asegurada');
      } else if (newStatus === 'OUT_FOR_DELIVERY') {
        await mockNotifyOrderStatusChange(delivery.order_id, 'OUT_FOR_DELIVERY', 'Dron en tránsito a destino');
      } else if (newStatus === 'DELIVERED') {
        await mockNotifyOrderStatusChange(delivery.order_id, 'DELIVERED', 'Misión completada');
        await mockNotifyPaymentClose(delivery.order_id);
      } else if (newStatus === 'CANCELLED_SUCCESSFULLY') {
        await mockNotifyOrderStatusChange(delivery.order_id, 'CANCELLED_SUCCESSFULLY', 'Misión abortada');
      }
    }

    revalidatePath('/admin/dispatch');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
