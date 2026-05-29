import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { SearchBar } from '@/components/SearchBar';
import { Pagination } from '@/components/Pagination';
import { StatusBadge } from '@/components/StatusBadge';
import { UserButton } from '@clerk/nextjs';
import { fixMissingCoordinatesFormAction, fixMissionCoordinatesFormAction } from './actions';
import { TriggerOrderButton as TriggerButton } from './trigger-button';

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string, search?: string }>
}) {
  const params = await searchParams;
  const pageNum = Number(params?.page) || 1;
  const search = params?.search || '';
  const limit = 5;

  const whereClause = search ? { order_id: { contains: search, mode: 'insensitive' as any } } : {};

  const total = await prisma.delivery.count({ where: whereClause });
  const deliveries = await prisma.delivery.findMany({
    where: whereClause,
    skip: (pageNum - 1) * limit,
    take: limit,
    orderBy: { created_at: 'desc' }
  });

  return (
    <div className="w-full p-8 flex flex-col gap-12">
      <header className="border-b-2 border-white pb-4 flex flex-col md:flex-row md:justify-between md:items-end">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h2 className="text-brand-neon font-mono text-sm tracking-[0.2em] uppercase">Gestión de Infraestructura</h2>
            <UserButton />
          </div>
          <h1 className="text-4xl md:text-6xl font-sans uppercase tracking-tighter leading-none">Admin Panel</h1>
        </div>
        <div className="flex flex-wrap gap-6 mt-4 md:mt-0 items-center">
          <Link href="/" className="font-mono text-gray-500 uppercase hover:text-white transition-colors duration-75 text-sm tracking-widest border-b border-transparent hover:border-white pb-1">
            &lt;// VOLVER
          </Link>
          <Link href="/admin/couriers" className="brutalist-button border-white text-white hover:bg-white hover:text-black">
            GESTIÓN DE FLOTA
          </Link>
        </div>
      </header>

      <section className="bg-zinc-950 border-2 border-zinc-900 p-6">
        <h3 className="text-zinc-500 font-mono text-[10px] uppercase tracking-[0.3em] mb-4">Mantenimiento de Red</h3>
        <div className="flex flex-wrap gap-4">
          <TriggerButton />
          <form action={fixMissingCoordinatesFormAction}>
            <button type="submit" className="bg-transparent border border-zinc-800 text-zinc-500 px-4 py-2 text-[10px] hover:border-white hover:text-white transition-all font-mono uppercase">
              [ Recalibrate_Drones ]
            </button>
          </form>
          <form action={fixMissionCoordinatesFormAction}>
            <button type="submit" className="bg-transparent border border-zinc-800 text-zinc-500 px-4 py-2 text-[10px] hover:border-white hover:text-white transition-all font-mono uppercase">
              [ Recalibrate_Missions ]
            </button>
          </form>
        </div>
      </section>

      <section>
        <div className="flex justify-between items-end mb-4">
          <h3 className="text-brand-neon font-mono text-xs uppercase tracking-widest">Telemetría de Envíos</h3>
        </div>
        <SearchBar placeholder="TRACKING ID..." />
        <div className="border border-white overflow-x-auto relative">
          <table className="min-w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white bg-white text-black font-sans uppercase text-lg">
                <th className="p-4 tracking-tight">ID Entrega</th>
                <th className="p-4 tracking-tight">Order ID</th>
                <th className="p-4 tracking-tight">Estado</th>
                <th className="p-4 tracking-tight text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="font-mono text-sm">
              {deliveries.map(d => (
                <tr key={d.id} className="border-b border-gray-800 last:border-0 hover:bg-gray-900 transition-colors duration-75">
                  <td className="p-4 text-white font-bold">{d.id.slice(0, 8)}...</td>
                  <td className="p-4 text-gray-400">{d.order_id}</td>
                  <td className="p-4"><StatusBadge status={d.status} /></td>
                  <td className="p-4 text-right text-gray-600">{new Date(d.created_at).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination totalItems={total} itemsPerPage={limit} />
      </section>
    </div>
  );
}
