'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';

interface Operator {
  id: string;
  name: string;
}

interface CourierFormProps {
  initialData?: any;
  action: (prevState: any, formData: FormData) => Promise<any>;
  submitLabel: string;
  existingOperators?: Operator[];
}

export function CourierForm({ initialData, action, submitLabel, existingOperators = [] }: CourierFormProps) {
  const [state, formAction, pending] = useActionState(action, null);
  const [selectedClerkId, setSelectedClerkId] = useState(initialData?.clerk_id || '');

  const inputClass = "bg-black border border-white text-white p-3 font-mono w-full uppercase placeholder:text-gray-700 outline-none focus:border-brand-safety transition-colors duration-75 text-sm";

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full items-stretch">
      {/* Columna del Formulario (NARANJA) */}
      <form action={formAction} className="flex flex-col gap-4 w-full max-w-xl border-2 border-brand-safety p-6 relative bg-black overflow-y-auto custom-scrollbar">
        {initialData?.id && <input type="hidden" name="id" value={initialData.id} />}
        <div className="absolute top-0 left-0 bg-brand-safety text-black font-sans font-bold uppercase px-4 py-1 -translate-y-1/2 translate-x-4 text-xs">
          TELEMETRÍA DE UNIDAD
        </div>

        {state?.message && <div className="border border-red-500 bg-black text-red-500 p-3 font-mono uppercase text-[10px] tracking-widest">{state.message}</div>}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-brand-safety font-mono text-[10px] uppercase tracking-widest">Designación</label>
            <input type="text" name="name" placeholder="DRON-01" defaultValue={initialData?.name || state?.data?.name} className={inputClass} />
            {state?.errors?.name && <p className="text-red-500 font-mono text-[9px] uppercase">{state.errors.name[0]}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-brand-safety font-mono text-[10px] uppercase tracking-widest">Frecuencia Enlace</label>
            <input type="text" name="phone" placeholder="+54 9 11..." defaultValue={initialData?.phone || state?.data?.phone} className={inputClass} />
            {state?.errors?.phone && <p className="text-red-500 font-mono text-[9px] uppercase">{state.errors.phone[0]}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-brand-safety font-mono text-[10px] uppercase tracking-widest">Clase de Nave</label>
            <select name="vehicle_type" defaultValue={initialData?.vehicle_type || state?.data?.vehicle_type || ''} className={`${inputClass} appearance-none`}>
              <option value="" disabled>SELECCIONE</option>
              <option value="Dron">DRON AUTÓNOMO</option>
              <option value="Moto">MOTO-VEHÍCULO</option>
              <option value="Bicicleta">TRACCIÓN HUMANA</option>
              <option value="Auto">UNIDAD TERRESTRE</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-brand-safety font-mono text-[10px] uppercase tracking-widest">Estado en Flota</label>
            <select name="status" defaultValue={initialData?.status === 'ASSIGNED' ? 'AVAILABLE' : (initialData?.status || 'AVAILABLE')} className={`${inputClass} appearance-none`}>
              <option value="AVAILABLE">MODO ONLINE</option>
              <option value="OFFLINE">MODO OFFLINE</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 border-t border-dashed border-gray-800 pt-4">
          <label className="text-brand-safety font-mono text-[10px] uppercase tracking-widest">ID Operador Clerk (Responsable)</label>
          <input 
            type="text" 
            name="clerk_id" 
            placeholder="user_..." 
            value={selectedClerkId}
            onChange={(e) => setSelectedClerkId(e.target.value)}
            className={`${inputClass} border-brand-safety/50`} 
          />
          <p className="text-[8px] text-gray-500 uppercase font-mono">Vínculo de seguridad único entre usuario y dron.</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-brand-safety font-mono text-[10px] uppercase tracking-widest">ID Chasis / Patente</label>
          <input type="text" name="license_plate" placeholder="CH-000-X" defaultValue={initialData?.license_plate || state?.data?.license_plate} className={inputClass} />
        </div>

        <div className="mt-auto pt-6 flex gap-4">
           <button type="submit" disabled={pending} className="bg-brand-safety text-black px-6 py-4 font-sans font-black uppercase text-xl hover:bg-white transition-colors duration-75 flex-1 disabled:opacity-50">
            {pending ? 'PROCESANDO...' : submitLabel}
          </button>
        </div>
      </form>

      {/* Columna de Directorio (VERDE NEON) */}
      <div className="flex-1 border-2 border-brand-neon bg-black p-6 flex flex-col gap-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 bg-brand-neon text-black font-sans font-bold uppercase px-4 py-1 -translate-y-1/2 translate-x-4 text-xs">
          DIRECTORIO DE USUARIOS CLERK
        </div>
        
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar mt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {existingOperators.map((op) => (
              <div
                key={op.id}
                className={`p-3 border border-dashed transition-all duration-75 flex flex-col justify-between ${selectedClerkId === op.id ? 'border-brand-neon bg-brand-neon/10' : 'border-gray-800 bg-zinc-950'}`}
              >
                <div>
                  <div className="text-[10px] font-bold text-white uppercase truncate">{op.name}</div>
                  <div className="text-[8px] text-brand-neon font-mono break-all mt-1">{op.id}</div>
                </div>
                <button 
                  type="button"
                  onClick={() => setSelectedClerkId(op.id)}
                  className="mt-3 text-[9px] bg-brand-neon text-black px-2 py-1 font-black hover:bg-white transition-colors uppercase self-end"
                >
                  VINCULAR_ID
                </button>
              </div>
            ))}
          </div>
          {existingOperators.length === 0 && (
            <div className="text-center p-8 border border-dashed border-gray-800 text-gray-600 font-mono text-[10px]">
              SIN USUARIOS DETECTADOS EN CLERK_AUTH
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #000;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #FF5E00;
        }
      `}</style>
    </div>
  );
}
