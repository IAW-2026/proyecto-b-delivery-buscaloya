/**
 * COMPONENTE REUTILIZABLE: components/StatusBadge.tsx
 * DESCRIPCIÓN: Etiqueta de estado (Badge) de estética brutalista.
 * CARACTERÍSTICAS:
 *   - Proporciona estilos, bordes y colores específicos dependiendo del estado de entrega o dron (AVAILABLE, DELIVERED, OFFLINE, etc.).
 *   - Normaliza los nombres de los estados reemplazando los guiones bajos por espacios legibles.
 */
import React from 'react';

export function StatusBadge({ status }: { status: string }) {
  // Brutalist style
  const baseClasses = "px-2 py-1 text-xs uppercase font-mono border border-brand-neon bg-black text-brand-neon";
  
  const getColor = () => {
    switch(status) {
      case 'DELIVERED': return 'border-brand-neon text-brand-neon';
      case 'CANCELLED_SUCCESSFULLY': return 'border-brand-safety text-brand-safety';
      case 'AVAILABLE': return 'border-brand-neon text-black bg-brand-neon'; // Inverted for high visibility
      case 'OFFLINE': return 'border-gray-600 text-gray-500';
      default: return 'border-white text-white';
    }
  }

  const getLabel = () => {
    switch(status) {
      case 'AVAILABLE': return 'ONLINE';
      case 'OFFLINE': return 'OFFLINE';
      case 'ASSIGNED': return 'EN MISIÓN';
      default: return status.replace(/_/g, ' ');
    }
  }

  return (
    <span className={`px-2 py-1 text-[10px] uppercase font-mono border ${getColor()}`}>
      {getLabel()}
    </span>
  );
}
