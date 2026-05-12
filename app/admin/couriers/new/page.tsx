import { prisma } from '@/lib/prisma';
import { CourierForm } from './courier-form';
import { createCourier } from './actions';
import Link from 'next/link';
import { clerkClient } from '@clerk/nextjs/server';

export default async function NewCourierPage() {
  // Obtener TODOS los usuarios registrados en Clerk
  const client = await clerkClient();
  const clerkUsers = await client.users.getUserList();
  
  const existingOperators = clerkUsers.data.map(user => ({
    id: user.id,
    name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'Usuario Sin Nombre'
  }));

  return (
    <div className="w-full h-screen flex flex-col bg-black text-white overflow-hidden p-4 md:p-8">
      <header className="mb-4 border-b-2 border-brand-safety pb-4 flex flex-col md:flex-row md:justify-between md:items-end flex-shrink-0">
        <div>
          <h2 className="text-brand-safety font-mono text-sm tracking-[0.2em] mb-1 uppercase">Alta de Unidades</h2>
          <h1 className="text-3xl md:text-5xl font-sans uppercase tracking-tighter leading-none">Registrar Dron</h1>
        </div>
        <div className="mt-4 md:mt-0">
          <Link href="/admin/couriers" className="font-mono text-gray-500 uppercase hover:text-white transition-colors duration-75 text-sm tracking-widest border-b border-transparent hover:border-white pb-1">
            &lt;// VOLVER
          </Link>
        </div>
      </header>
      
      <main className="flex-1 min-h-0">
        <CourierForm 
          action={createCourier} 
          submitLabel="INICIALIZAR UNIDAD" 
          existingOperators={existingOperators}
        />
      </main>
    </div>
  );
}
