/**
 * PÁGINA PRINCIPAL: GET / (Landing Page)
 * DESCRIPCIÓN: Pantalla de bienvenida (Landing Page) de la aplicación de Delivery.
 * CARACTERÍSTICAS:
 *   - Estética brutalista y cyberpunk con grilla decorativa de fondo.
 *   - Enlaces rápidos para iniciar la operación (Dashboard / Radar) y para el Panel de Administración (Admin Terminal).
 */
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-8 relative overflow-hidden">
      
      {/* Background decoration */}
      <div 
        className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" 
        suppressHydrationWarning
        style={{ 
          backgroundImage: 'linear-gradient(0deg, transparent 24%, #ffffff 25%, #ffffff 26%, transparent 27%, transparent 74%, #ffffff 75%, #ffffff 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, #ffffff 25%, #ffffff 26%, transparent 27%, transparent 74%, #ffffff 75%, #ffffff 76%, transparent 77%, transparent)', 
          backgroundSize: '50px 50px' 
        }}
      ></div>

      <div className="border-4 border-brand-neon p-12 relative z-10 max-w-2xl text-center bg-black">
        <h2 className="text-brand-neon font-mono tracking-widest uppercase mb-4 text-sm md:text-base">Módulo Logístico Autónomo</h2>
        <h1 className="text-5xl md:text-8xl font-sans uppercase tracking-tighter leading-none mb-8 text-white">Delivery<br/>System</h1>
        
        <p className="font-mono text-gray-400 mb-12 max-w-md mx-auto">
          SISTEMA DE GESTIÓN DE ENTREGAS Y FLOTA. AUTENTICACIÓN REQUERIDA PARA ACCESO CLASIFICADO.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Link href="/dashboard" className="bg-brand-neon text-black font-sans font-bold uppercase px-8 py-4 text-xl hover:bg-white transition-colors duration-75 border-2 border-brand-neon hover:border-white">
            Iniciar Operación
          </Link>
          <Link href="/admin" className="bg-transparent text-white border-2 border-white font-sans font-bold uppercase px-8 py-4 text-xl hover:bg-white hover:text-black transition-colors duration-75">
            Admin Terminal
          </Link>
        </div>
      </div>
      
    </div>
  );
}
