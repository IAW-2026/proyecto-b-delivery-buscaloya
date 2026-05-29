'use client';

/**
 * PÁGINA DE ERROR GLOBAL: app/error.tsx
 * DESCRIPCIÓN: Manejador de errores del lado del cliente y del servidor (ErrorBoundary) en Next.js.
 * CARACTERÍSTICAS:
 *   - Captura excepciones inesperadas en tiempo de ejecución en Server y Client Components de forma elegante.
 *   - Muestra el mensaje de error de forma segura y proporciona un botón interactivo para reintentar la renderización (`reset()`).
 */
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-4">Algo salió mal</h1>
      <p className="mb-4 text-red-600">{error.message}</p>
      <button
        onClick={() => reset()}
        className="bg-black text-white px-6 py-2 rounded font-bold"
      >
        Intentar de nuevo
      </button>
    </div>
  );
}
