'use client';

/**
 * COMPONENTE REUTILIZABLE: components/Pagination.tsx
 * DESCRIPCIÓN: Paginador brutalista y asincrónico por URL.
 * CARACTERÍSTICAS:
 *   - Calcula dinámicamente las páginas totales y genera los enlaces de navegación usando URLSearchParams (`?page=...`).
 *   - Diseñado bajo accesibilidad básica e indicadores de estado inactivos (disabled).
 */
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export function Pagination({ totalItems, itemsPerPage }: { totalItems: number, itemsPerPage: number }) {
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get('page')) || 1;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) return null;

  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', pageNumber.toString());
    return `?${params.toString()}`;
  };

  return (
    <div className="flex justify-between items-center mt-6 border-t border-white pt-4 font-mono uppercase text-sm">
      {currentPage > 1 ? (
        <Link href={createPageUrl(currentPage - 1)} className="border border-brand-neon text-brand-neon px-4 py-2 hover:bg-brand-neon hover:text-black transition-colors duration-75">
          &lt;
        </Link>
      ) : <div className="px-4 py-2 opacity-50 border border-gray-600 text-gray-600 cursor-not-allowed">&lt;</div>}
      
      <span className="tracking-widest border px-4 py-2 border-dashed border-gray-600">
        PAG {currentPage} {"//"} {totalPages}
      </span>
      
      {currentPage < totalPages ? (
        <Link href={createPageUrl(currentPage + 1)} className="border border-brand-neon text-brand-neon px-4 py-2 hover:bg-brand-neon hover:text-black transition-colors duration-75">
          &gt;
        </Link>
      ) : <div className="px-4 py-2 opacity-50 border border-gray-600 text-gray-600 cursor-not-allowed">&gt;</div>}
    </div>
  );
}
