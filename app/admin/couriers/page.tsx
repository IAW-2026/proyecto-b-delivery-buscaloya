/**
 * PÁGINA VISUAL: GET /admin/couriers
 * DESCRIPCIÓN: Listado y control de flota de drones (Couriers).
 * CARACTERÍSTICAS:
 *   - Muestra el listado de drones con paginación y búsqueda integrada mediante URL.
 *   - Enlaza al formulario de registro de nuevas unidades.
 *   - Permite ingresar a la edición detallada de cada dron.
 */
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { SearchBar } from '@/components/SearchBar';
import { Pagination } from '@/components/Pagination';
import { StatusBadge } from '@/components/StatusBadge';

export default async function CouriersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string, search?: string }>
}) {
  const params = await searchParams;
  const pageNum = Number(params?.page) || 1;
  const search = params?.search || '';
  const limit = 5;

  const whereClause = search ? { name: { contains: search, mode: 'insensitive' as any } } : {};

  const total = await prisma.courier.count({ where: whereClause });
  const couriers = await prisma.courier.findMany({
    where: whereClause,
    skip: (pageNum - 1) * limit,
    take: limit,
    orderBy: { created_at: 'desc' }
  });

  return (
    <div className="w-full p-8">
      <header className="mb-8 border-b-2 border-brand-safety pb-4 flex flex-col md:flex-row md:justify-between md:items-end">
        <div>
          <h2 className="text-brand-safety font-mono text-sm tracking-[0.2em] mb-2 uppercase">Recursos Aéreos [Flota]</h2>
          <h1 className="text-4xl md:text-6xl font-sans uppercase tracking-tighter leading-none">Couriers </h1>
        </div>
        <div className="flex flex-wrap gap-6 mt-4 md:mt-0 items-center">
          <Link href="/admin" className="font-mono text-gray-500 uppercase hover:text-white transition-colors duration-75 text-sm tracking-widest border-b border-transparent hover:border-white pb-1">
            &lt;// VOLVER
          </Link>
          <Link href="/admin/couriers/new" className="bg-brand-safety text-black font-sans font-bold uppercase px-6 py-3 text-sm hover:bg-white transition-colors duration-75 border-2 border-brand-safety hover:border-white whitespace-nowrap">
            REGISTRAR UNIDAD
          </Link>
        </div>
      </header>

      <SearchBar placeholder="NOMBRE O ID DE UNIDAD..." />

      <div className="border border-brand-safety overflow-x-auto relative">
        <table className="min-w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-brand-safety bg-brand-safety text-black font-sans uppercase text-lg">
              <th className="p-4 tracking-tight">Designación</th>
              <th className="p-4 tracking-tight">Frecuencia (Tel)</th>
              <th className="p-4 tracking-tight">Modelo / Clase</th>
              <th className="p-4 tracking-tight">ID Chasis / Patente</th>
              <th className="p-4 tracking-tight text-right">Estado</th>
            </tr>
          </thead>
          <tbody className="font-mono text-sm">
            {couriers.map((c: any) => (
              <tr key={c.id} className="border-b border-gray-800 hover:bg-gray-900 transition-colors duration-75 group">
                <td className="p-4 text-white font-bold">
                  <Link href={`/admin/couriers/${c.id}`} className="hover:text-brand-neon flex items-center gap-2">
                    {c.name}
                    <span className="text-[10px] text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">[EDITAR]</span>
                  </Link>
                </td>
                <td className="p-4 text-gray-400">{c.phone}</td>
                <td className="p-4 text-brand-neon uppercase">{c.vehicle_type}</td>
                <td className="p-4 text-gray-500 uppercase">{c.license_plate || 'N/A'}</td>
                <td className="p-4 text-right"><StatusBadge status={c.status} /></td>
              </tr>
            ))}
            {couriers.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-brand-safety font-sans uppercase tracking-widest border-t border-dashed border-gray-800">
                  SIN UNIDADES REGISTRADAS
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination totalItems={total} itemsPerPage={limit} />
    </div>
  );
}
