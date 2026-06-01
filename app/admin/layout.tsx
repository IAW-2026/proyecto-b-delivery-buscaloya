import { currentUser } from '@clerk/nextjs/server';
import Link from 'next/link';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  const role = user?.publicMetadata?.role;

  // VERIFICACIÓN DE SEGURIDAD ABSOLUTA (NIVEL SERVIDOR):
  // Si el usuario no tiene el rol de administrador, mostramos una página de error táctica a pantalla completa
  if (role !== 'admin') {
    const email = user?.emailAddresses?.[0]?.emailAddress || 'USUARIO_ANÓNIMO';
    
    return (
      <div className="min-h-screen bg-black text-[#FF0055] font-mono flex flex-col justify-center items-center p-8 relative overflow-hidden select-none">
        
        {/* CRT Scanline Overlay Effect */}
        <div 
          className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
          style={{ 
            backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))', 
            backgroundSize: '100% 2px, 3px 100%' 
          }}
        ></div>

        <div className="border-4 border-[#FF0055] p-12 bg-zinc-950 max-w-2xl text-center shadow-[12px_12px_0px_rgba(255,0,85,0.3)] relative z-10 animate-[pulse_3s_infinite_ease-in-out]">
          <h2 className="text-[#FF0055] font-black tracking-[0.4em] uppercase mb-4 text-xs">
            [ ALERT: SECURITY_VIOLATION_DETECTED ]
          </h2>
          <h1 className="text-4xl md:text-6xl font-sans uppercase tracking-tighter leading-none mb-8 text-white">
            Access <span className="text-[#FF0055]">Denied</span>
          </h1>
          
          <div className="border border-dashed border-[#FF0055]/50 p-6 bg-black mb-8 text-left text-xs text-zinc-400 leading-relaxed">
            <p className="mb-2"><span className="text-[#FF0055] font-bold">DETECCIÓN DE SISTEMA:</span> Intento de intrusión registrado en el sector crítico.</p>
            <p className="mb-2"><span className="text-[#FF0055] font-bold">CREDENCIAL ACTIVA:</span> {email.toUpperCase()}</p>
            <p className="mb-2"><span className="text-[#FF0055] font-bold">ROL DETECTADO:</span> {String(role || 'INSUFICIENTE').toUpperCase()}</p>
            <p><span className="text-[#FF0055] font-bold">REQUISITO:</span> Clave de seguridad de nivel de administrador.</p>
          </div>

          <p className="text-[9px] text-zinc-600 uppercase mb-8 leading-tight">
            ESTA ACCIÓN HA SIDO REGISTRADA EN LA BITÁCORA DEL TRAVELER LOG BAJO EL CÓDIGO DE ERROR STATUS_403 (FORBIDDEN).
          </p>

          <Link href="/dashboard" className="bg-[#FF0055] text-black font-sans font-black uppercase px-8 py-4 text-base hover:bg-white hover:text-black transition-colors duration-75 border-2 border-[#FF0055] hover:border-white block">
            &lt;// Retornar al Radar Táctico
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}



