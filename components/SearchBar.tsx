'use client';

/**
 * COMPONENTE REUTILIZABLE: components/SearchBar.tsx
 * DESCRIPCIÓN: Barra de búsqueda brutalista.
 * CARACTERÍSTICAS:
 *   - Implementa búsqueda del lado del cliente inyectando y actualizando dinámicamente el parámetro `?search=...` en la URL.
 *   - Setea la página automáticamente a 1 al buscar.
 */
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, FormEvent } from 'react';

export function SearchBar({ placeholder = "BUSCAR..." }: { placeholder?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('search') || '');

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (query) {
      params.set('search', query);
    } else {
      params.delete('search');
    }
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="flex gap-0 mb-6 border border-white">
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="bg-black text-white p-3 flex-1 font-mono outline-none uppercase placeholder:text-gray-600"
      />
      <button type="submit" className="bg-brand-neon text-black px-6 py-3 font-bold font-sans uppercase hover:bg-white transition-colors duration-75">
        Buscar
      </button>
    </form>
  );
}
