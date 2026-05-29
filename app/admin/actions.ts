'use server';

import { prisma } from '@/lib/prisma';
import { fakerES as faker } from '@faker-js/faker';
import { revalidatePath } from 'next/cache';

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

    const delivery = await prisma.delivery.create({
      data: {
        order_id: orderId,
        status: 'ACCEPTED_FOR_ASSIGNMENT',
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

    revalidatePath('/admin');
    revalidatePath('/dashboard');
    
    return { success: true, orderId: delivery.order_id };
  } catch (error: any) {
    console.error("Faker Error:", error);
    return { success: false, error: error.message };
  }
}

export async function fixMissingCoordinates() {
  try {
    const couriers = await prisma.courier.findMany();

    for (const c of couriers) {
      await prisma.courier.update({
        where: { id: c.id },
        data: {
          last_x: Math.floor(Math.random() * 10000),
          last_y: Math.floor(Math.random() * 10000),
        }
      });
    }

    revalidatePath('/dashboard');
    return { success: true, count: couriers.length };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function fixMissionCoordinates() {
  try {
    const snapshots = await prisma.deliveryContextSnapshot.findMany();

    for (const s of snapshots) {
      await prisma.deliveryContextSnapshot.update({
        where: { id: s.id },
        data: {
          seller_x: Math.floor(Math.random() * 9000) + 500,
          seller_y: Math.floor(Math.random() * 9000) + 500,
          buyer_x: Math.floor(Math.random() * 9000) + 500,
          buyer_y: Math.floor(Math.random() * 9000) + 500,
        }
      });
    }

    revalidatePath('/dashboard');
    return { success: true, count: snapshots.length };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function fixMissingCoordinatesFormAction(formData: FormData): Promise<void> {
  await fixMissingCoordinates();
}

export async function fixMissionCoordinatesFormAction(formData: FormData): Promise<void> {
  await fixMissionCoordinates();
}
