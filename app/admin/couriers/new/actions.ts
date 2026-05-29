'use server';

/**
 * SERVER ACTIONS DE CREACIÓN: app/admin/couriers/new/actions.ts
 * DESCRIPCIÓN: Valida y procesa la creación (Alta) de nuevos drones en la base de datos de producción.
 * CARACTERÍSTICAS:
 *   - Valida la información del formulario utilizando Zod en el servidor.
 *   - Asigna coordenadas iniciales de geolocalización de forma aleatoria para telemetría inicial.
 *   - Redirecciona de vuelta al listado principal tras la creación.
 */
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

const courierSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  phone: z.string().min(6, "El teléfono no es válido"),
  vehicle_type: z.string().min(2, "Tipo de vehículo requerido"),
  license_plate: z.string().optional(),
  status: z.enum(['AVAILABLE', 'OFFLINE', 'ASSIGNED']).default('AVAILABLE'),
  clerk_id: z.string().optional()
});

export async function createCourier(prevState: any, formData: FormData) {
  const rawData = {
    name: formData.get('name') as string,
    phone: formData.get('phone') as string,
    vehicle_type: formData.get('vehicle_type') as string,
    license_plate: formData.get('license_plate') as string,
    status: (formData.get('status') as any) || 'AVAILABLE',
    clerk_id: formData.get('clerk_id') as string,
  };

  const validation = courierSchema.safeParse(rawData);
  
  if (!validation.success) {
    return {
      errors: validation.error.flatten().fieldErrors,
      message: 'Faltan campos o son inválidos',
      data: rawData
    };
  }

  try {
    const BASE_LAT = -38.7196;
    const BASE_LON = -62.2724;

    await prisma.courier.create({
      data: {
        ...validation.data,
        last_x: Math.floor(Math.random() * 10000),
        last_y: Math.floor(Math.random() * 10000),
      }
    });
  } catch (error) {
    return {
      message: 'Error de base de datos al crear el repartidor',
      data: rawData
    };
  }

  redirect('/admin/couriers');
}
