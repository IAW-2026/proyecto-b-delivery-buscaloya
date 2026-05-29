/**
 * PÁGINA VISUAL: GET /dashboard
 * DESCRIPCIÓN: Consola de control táctil (Radar Táctico).
 * CARACTERÍSTICAS:
 *   - Renderiza el mapa táctil interactivo en tiempo real (`TacticalMap`).
 *   - Consume en el servidor la API externa de Open-Meteo para obtener telemetría meteorológica.
 *   - Protegido por Clerk para acceso exclusivo de operadores autenticados.
 */
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { TacticalMap } from '@/components/radar/TacticalMap';
import { UserButton } from '@clerk/nextjs';
import { currentUser } from '@clerk/nextjs/server';

async function getWeather() {
  try {
    const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=-38.7196&longitude=-62.2724&current_weather=true', { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const data = await res.json();
    return data.current_weather;
  } catch (e) {
    return null;
  }
}

export default async function DashboardPage() {
  const user = await currentUser();
  const weather = await getWeather();
  
  const initialCouriers = await prisma.courier.findMany({
    where: { clerk_id: user?.id }
  });

  const activeMissions = await prisma.delivery.findMany({
    where: {
      status: { in: ['COURIER_ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY'] },
      assignments: { some: { courier: { clerk_id: user?.id } } }
    },
    include: {
      snapshot: true,
      assignments: {
        where: { status: 'ASSIGNED' },
        include: { courier: true },
        take: 1
      }
    },
    orderBy: { updated_at: 'desc' }
  });

  const initialPending = await prisma.delivery.findMany({
    where: { status: 'ACCEPTED_FOR_ASSIGNMENT' },
    include: { snapshot: true },
    orderBy: { created_at: 'asc' }
  });

  return (
    <div className="w-full h-screen flex flex-col bg-black text-[#FF007F] overflow-hidden p-4 md:p-8">
      <header className="mb-4 border-b-2 border-[#FF007F] pb-4 flex flex-col md:flex-row md:justify-between md:items-end flex-shrink-0">
        <div>
          <div className="flex items-center gap-4 mb-1">
            <h2 className="text-[#FF007F] font-mono text-[10px] tracking-[0.3em] uppercase">Tactical Control Center</h2>
            <UserButton />
          </div>
          <h1 className="text-3xl md:text-5xl font-sans uppercase tracking-tighter leading-none text-white">Console <span className="text-[#FF007F]">{"//"}</span> Radar</h1>
        </div>
        <div className="flex flex-wrap gap-6 mt-4 md:mt-0 items-center">
          {weather && (
            <div className="font-mono text-xs md:text-sm text-[#FF007F] border-2 border-[#FF007F] px-5 py-2 flex gap-8 bg-[#FF007F]/10 font-black uppercase tracking-tighter shadow-[4px_4px_0px_#FF007F]">
              <span>ATMOS_TEMP: {weather.temperature}°C</span>
              <span>WIND_VEL: {weather.windspeed} KM/H</span>
            </div>
          )}
          <Link href="/" className="font-mono text-zinc-500 uppercase hover:text-[#FF007F] transition-colors duration-75 text-xs tracking-[0.2em] border-b-2 border-transparent hover:border-[#FF007F] pb-1 font-bold">
            &lt;// VOLVER
          </Link>
        </div>
      </header>

      <main className="flex-1 min-h-0">
        <TacticalMap 
          initialCouriers={initialCouriers} 
          activeMissions={activeMissions} 
          initialPending={initialPending} 
        />
      </main>
      
      <footer className="mt-2 flex justify-between items-center flex-shrink-0">
        <div className="text-[8px] text-zinc-700 font-mono uppercase tracking-widest">
          Auth_Status: {user?.id ? `OPERATOR_CONNECTED [${user.id.slice(0,10)}...]` : 'SECURE_LINK_LOST'}
        </div>
        <div className="text-[8px] text-zinc-800 font-mono">
          V1.2.0 // BRUTALIST_SYSTEMS_CORP
        </div>
      </footer>
    </div>
  );
}
