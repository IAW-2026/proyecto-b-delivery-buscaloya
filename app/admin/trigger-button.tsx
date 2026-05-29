'use client';

/**
 * COMPONENTE ADMINISTRATIVO: app/admin/trigger-button.tsx
 * DESCRIPCIÓN: Botón interactivo para disparar pedidos simulados (mocks) en el panel de control.
 * CARACTERÍSTICAS:
 *   - Llama de forma asíncrona a la Server Action `triggerMockOrder` para registrar un pedido en Supabase sin dependencias externas.
 *   - Maneja estados de carga y notificaciones emergentes tras el éxito o fallo de la simulación.
 */
import { useState } from 'react';
import { triggerMockOrder, fixMissingCoordinates } from './actions';

export function TriggerOrderButton() {
  const [loading, setLoading] = useState(false);

  const handleTrigger = async () => {
    setLoading(true);
    const res = await triggerMockOrder();
    if (res.success) {
      alert(`ORDEN GENERADA EXITOSAMENTE: ${res.orderId}`);
    } else {
      alert(`ERROR AL GENERAR ORDEN: ${res.error}`);
    }
    setLoading(false);
  };

  const handleFix = async () => {
    setLoading(true);
    const res = await fixMissingCoordinates();
    if (res.success) {
      alert(`RADAR SINCRONIZADO: ${res.count} UNIDADES DETECTADAS`);
    } else {
      alert(`ERROR DE SINCRONIZACIÓN: ${res.error}`);
    }
    setLoading(false);
  };

  return (
    <button 
      onClick={handleTrigger}
      disabled={loading}
      className="bg-brand-safety text-black font-black py-2 px-4 text-[10px] uppercase border-2 border-black shadow-[4px_4px_0px_#FF5E00] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all h-full"
    >
      {loading ? 'DESPACHANDO...' : 'DISPARAR PEDIDO [MOCK]'}
    </button>
  );
}
