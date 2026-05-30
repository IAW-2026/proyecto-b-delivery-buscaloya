'use server';

/**
 * SERVER ACTIONS DE ADMINISTRACIÓN: app/admin/actions.ts
 * DESCRIPCIÓN: Acciones del servidor para realizar tareas de administración y calibración en el panel de control.
 * ACCIONES PRINCIPALES:
 *   - `triggerMockOrder`: Genera un pedido simulado (mock) con datos de Bahía Blanca para testing del radar táctico.
 *   - `fixMissingCoordinates` y `fixMissionCoordinates`: Rutinas de calibración para corregir coordenadas nulas o vacías.
 */
import { prisma } from '@/lib/prisma';
import { fakerES as faker } from '@faker-js/faker';
import { revalidatePath } from 'next/cache';
import { mockSendConfirmationCodeToBuyer } from '@/lib/mock-external';
import { logApiTraffic } from '@/lib/traveler-logger';

export async function triggerMockOrder() {
  try {
    const orderId = `ORD-${faker.string.numeric(4)}`;
    
    // Calles reales de Bahía Blanca para mayor realismo
    const calles = ['ALEM', 'SARMIENTO', 'ESTOMBA', 'FLORIDA', 'RODRIGUEZ', 'BELGRANO', 'ALSINA', 'MITRE', 'URQUIZA', 'CASANOVA', 'PERU', 'ZELARRAYAN'];
    const rubros = ['HAMBURGUESERIA', 'PIZZERIA', 'FARMACIA', 'SUSHI BAR', 'COFFEE SHOP', 'MERCADO', 'HELADERIA'];
    const adjetivos = ['BRUTAL', 'TACTICO', 'NEON', 'RADAR', 'DRON', 'ALPHA', 'OMEGA'];

    const sellerName = `${faker.helpers.arrayElement(rubros)} ${faker.helpers.arrayElement(adjetivos)}`;
    const sellerAddress = `${faker.helpers.arrayElement(calles)} ${faker.number.int({ min: 100, max: 2500 })}`;
    
    // Sistema X/Y (0 a 10000) con margen de seguridad para bordes
    const sellerX = Math.floor(Math.random() * 9000) + 500;
    const sellerY = Math.floor(Math.random() * 9000) + 500;

    console.log(`[RADAR] Generando misión: ${orderId} en X:${sellerX} Y:${sellerY}`);

    const buyerX = Math.floor(Math.random() * 9000) + 500;
    const buyerY = Math.floor(Math.random() * 9000) + 500;
    
    const buyerAddress = `${faker.helpers.arrayElement(calles)} ${faker.number.int({ min: 10, max: 3500 })}`;

    // Generar Código OTP de Confirmación aleatorio de 4 dígitos
    const confirmationCode = Math.floor(1000 + Math.random() * 9000).toString();

    const delivery = await prisma.delivery.create({
      data: {
        order_id: orderId,
        status: 'ACCEPTED_FOR_ASSIGNMENT',
        confirmation_code: confirmationCode,
        snapshot: {
          create: {
            buyer_id: `BUY-${faker.string.alphanumeric(6).toUpperCase()}`,
            buyer_name: faker.person.fullName().toUpperCase(),
            buyer_phone: `291-${faker.number.int({ min: 4000000, max: 6999999 })}`,
            buyer_address: buyerAddress,
            buyer_x: buyerX,
            buyer_y: buyerY,
            seller_id: `SEL-${faker.string.alphanumeric(6).toUpperCase()}`,
            seller_name: sellerName,
            seller_address: sellerAddress,
            seller_x: sellerX,
            seller_y: sellerY,
          }
        }
      }
    });

    // Simular el envío del código OTP a la Buyer App
    await mockSendConfirmationCodeToBuyer(orderId, confirmationCode);

    revalidatePath('/admin');
    revalidatePath('/dashboard');
    
    return { success: true, orderId: delivery.order_id };
  } catch (error: any) {
    console.error("Faker Error:", error);
    return { success: false, error: error.message };
  }
}

export async function triggerMockTracking() {
  try {
    const activeDeliveries = await prisma.delivery.findMany({
      where: {
        status: { in: ['COURIER_ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY'] }
      },
      include: {
        assignments: {
          where: { status: 'ASSIGNED' },
          include: { courier: true },
          take: 1
        }
      }
    });

    if (activeDeliveries.length === 0) {
      return { success: false, error: 'NO HAY MISIONES ACTIVAS EN CURSO' };
    }

    let count = 0;
    const MAP_BOUNDS = {
      n: -38.68,
      s: -38.76,
      w: -62.33,
      e: -62.21
    };

    for (const delivery of activeDeliveries) {
      const assignment = delivery.assignments[0];
      const courier = assignment?.courier;
      
      let lat = -38.7196;
      let lng = -62.2724;

      if (courier && courier.last_x !== null && courier.last_y !== null) {
        const x_percentage = courier.last_x / 10000;
        const y_percentage = courier.last_y / 10000;
        lng = MAP_BOUNDS.w + x_percentage * (MAP_BOUNDS.e - MAP_BOUNDS.w);
        lat = MAP_BOUNDS.n - y_percentage * (MAP_BOUNDS.n - MAP_BOUNDS.s);
      } else {
        lat = -38.7196 + (Math.random() - 0.5) * 0.05;
        lng = -62.2724 + (Math.random() - 0.5) * 0.05;
      }

      const trackingPoint = await prisma.deliveryTrackingPoint.create({
        data: {
          delivery_id: delivery.id,
          lat: Number(lat.toFixed(6)),
          lon: Number(lng.toFixed(6)),
          source: 'COURIER_APP'
        }
      });

      // Registrar en la bitácora de tráfico (Traffic Logs)
      await logApiTraffic({
        direction: 'INBOUND',
        endpoint: `/api/deliveries/${delivery.id}/tracking`,
        method: 'POST',
        request_payload: {
          delivery_id: delivery.id,
          lat: Number(lat.toFixed(6)),
          lng: Number(lng.toFixed(6)),
          source: 'COURIER_APP'
        },
        response_payload: {
          success: true,
          tracking_point: trackingPoint
        },
        status_code: 201
      });

      count++;
    }

    revalidatePath('/dashboard');
    return { success: true, count };
  } catch (error: any) {
    console.error("Tracking Sim Error:", error);
    return { success: false, error: error.message };
  }
}

