/**
 * PÁGINA 404: app/not-found.tsx
 * DESCRIPCIÓN: Manejador visual para rutas inexistentes (Página 404 Not Found) en Next.js.
 * CARACTERÍSTICAS:
 *   - Muestra un mensaje amigable cuando un usuario o sistema intenta acceder a una URL inválida.
 *   - Proporciona un enlace de retorno seguro a la landing page principal.
 */
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-4">404 - No Encontrado</h1>
      <p className="mb-4">La ruta que intentas acceder no existe en la aplicación de Delivery.</p>
      <Link href="/" className="bg-black text-white px-6 py-2 rounded font-bold">
        Volver al Inicio
      </Link>
    </div>
  );
}
