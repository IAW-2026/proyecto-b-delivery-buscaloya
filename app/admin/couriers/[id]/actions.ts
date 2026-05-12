'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

const courierSchema = z.object({
  id: z.string(),
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  phone: z.string().min(6, "El teléfono no es válido"),
  vehicle_type: z.string().min(2, "Tipo de vehículo requerido"),
  license_plate: z.string().optional(),
  status: z.enum(['AVAILABLE', 'OFFLINE', 'ASSIGNED']),
  clerk_id: z.string().optional()
});

export async function updateCourier(prevState: any, formData: FormData) {
  const rawData = {
    id: formData.get('id') as string,
    name: formData.get('name') as string,
    phone: formData.get('phone') as string,
    vehicle_type: formData.get('vehicle_type') as string,
    license_plate: formData.get('license_plate') as string,
    status: formData.get('status') as any,
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
    await prisma.courier.update({
      where: { id: validation.data.id },
      data: {
        name: validation.data.name,
        phone: validation.data.phone,
        vehicle_type: validation.data.vehicle_type,
        license_plate: validation.data.license_plate,
        status: validation.data.status,
        clerk_id: validation.data.clerk_id,
      }
    });
  } catch (error) {
    return {
      message: 'Error de base de datos al actualizar la unidad',
      data: rawData
    };
  }

  redirect('/admin/couriers');
}
