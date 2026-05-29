/**
 * PÁGINA VISUAL: GET /admin/couriers/[id]
 * DESCRIPCIÓN: Formulario de modificación (Edición) para un dron específico de la flota.
 * CARACTERÍSTICAS:
 *   - Recupera dinámicamente los datos del dron a través de su ID utilizando params asíncronos.
 *   - Envía los datos actualizados mediante una Server Action segura (`updateCourier`).
 */
import { prisma } from '@/lib/prisma';
import { CourierForm } from '../new/courier-form';
import { updateCourier } from './actions';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { clerkClient } from '@clerk/nextjs/server';

export default async function EditCourierPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  
  const courier = await prisma.courier.findUnique({
    where: { id }
  });

  if (!courier) {
    notFound();
  }

  // Obtener TODOS los usuarios registrados en Clerk
  const client = await clerkClient();
  const clerkUsers = await client.users.getUserList();
  
  const existingOperators = clerkUsers.data.map(user => ({
    id: user.id,
    name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'Usuario Sin Nombre'
  }));

  return (
    <div className="w-full h-screen flex flex-col bg-black text-white overflow-hidden p-4 md:p-8">
      <header className="mb-4 border-b-2 border-brand-neon pb-4 flex flex-col md:flex-row md:justify-between md:items-end flex-shrink-0">
        <div>
          <h2 className="text-brand-neon font-mono text-sm tracking-[0.2em] mb-1 uppercase">Modificación de Parámetros</h2>
          <h1 className="text-3xl md:text-5xl font-sans uppercase tracking-tighter leading-none">Editar Unidad</h1>
        </div>
        <div className="mt-4 md:mt-0">
          <Link href="/admin/couriers" className="font-mono text-gray-500 uppercase hover:text-white transition-colors duration-75 text-[10px] tracking-widest border-b border-transparent hover:border-white pb-1">
            &lt;// VOLVER
          </Link>
        </div>
      </header>
      
      <main className="flex-1 min-h-0">
        <CourierForm 
          initialData={courier} 
          action={updateCourier} 
          submitLabel="ACTUALIZAR BASE DE DATOS" 
          existingOperators={existingOperators}
        />
      </main>
    </div>
  );
}
