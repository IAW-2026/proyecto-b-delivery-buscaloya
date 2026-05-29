'use client';

/**
 * COMPONENTE FLOTANTE: components/SimulatorPanel.tsx
 * DESCRIPCIÓN: Panel de Simulación y Visualización de Tráfico (Simulator & Traveler's Log).
 * CARACTERÍSTICAS:
 *   - Tab SIMULATOR: Permite "disparar" peticiones HTTP locales simuladas al endpoint `/api/delivery-requests`.
 *   - Tab TRAFFIC LOGS: Realiza short-polling al endpoint `/api/logs` para listar e inspeccionar payloads de red entrantes/salientes en tiempo real.
 */
import { useState, useEffect } from 'react';

export function SimulatorPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'SIM' | 'LOGS'>('SIM');
  const [status, setStatus] = useState<string | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/logs');
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (e) {
      console.error("Error fetching logs", e);
    }
  };

  useEffect(() => {
    if (isOpen && activeTab === 'LOGS') {
      fetchLogs();
      const interval = setInterval(fetchLogs, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen, activeTab]);

  const simulateIncomingOrder = async () => {
    setStatus('PROCESANDO...');
    try {
      const orderId = `ORD-${Math.floor(Math.random() * 10000)}`;
      const res = await fetch('/api/delivery-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId,
          seller_id: "SEL-MOCK",
          seller_name: "HAMBURGUESERÍA BRUTAL",
          seller_address: "AV. ALEM 1234",
          seller_x: Math.floor(Math.random() * 9000) + 500,
          seller_y: Math.floor(Math.random() * 9000) + 500,
          buyer_id: "BUY-MOCK",
          buyer_name: "TEST USER",
          buyer_phone: "291-555-0199",
          buyer_address: "SARMIENTO 456",
          buyer_x: Math.floor(Math.random() * 9000) + 500,
          buyer_y: Math.floor(Math.random() * 9000) + 500
        })
      });

      if (res.ok) {
        setStatus(`ORDEN ${orderId} CREADA`);
        if (activeTab === 'LOGS') fetchLogs();
      } else {
        setStatus('ERROR EN SIMULACIÓN');
      }
    } catch (e) {
      setStatus('ERROR DE CONEXIÓN');
    }
    setTimeout(() => setStatus(null), 3000);
  };

  return (
    <>
      {/* Botón flotante para abrir el centro de control */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-8 right-8 p-4 font-bold font-mono text-xs z-50 border-2 border-white shadow-[4px_4px_0px_#000000] transition-all ${isOpen ? 'bg-white text-black' : 'bg-brand-safety text-black hover:bg-white'}`}
      >
        {isOpen ? '[ CERRAR PANEL ]' : '[ CONTROL CENTER ]'}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-8 w-96 bg-black border-2 border-brand-safety z-50 font-mono shadow-[8px_8px_0px_#FF5E00] flex flex-col max-h-[70vh]">
          
          {/* Tabs */}
          <div className="flex border-b-2 border-brand-safety">
            <button 
              onClick={() => setActiveTab('SIM')}
              className={`flex-1 p-3 text-xs font-bold uppercase transition-all ${activeTab === 'SIM' ? 'bg-brand-safety text-black' : 'text-brand-safety hover:bg-gray-900'}`}
            >
              SIMULATOR
            </button>
            <button 
              onClick={() => setActiveTab('LOGS')}
              className={`flex-1 p-3 text-xs font-bold uppercase transition-all ${activeTab === 'LOGS' ? 'bg-brand-safety text-black' : 'text-brand-safety hover:bg-gray-900'}`}
            >
              TRAFFIC LOGS
            </button>
          </div>

          <div className="p-6 overflow-y-auto">
            {activeTab === 'SIM' ? (
              <div className="flex flex-col gap-4">
                <h3 className="text-brand-safety text-sm font-bold uppercase tracking-widest mb-2">Simular Petición Inbound</h3>
                <button 
                  onClick={simulateIncomingOrder}
                  className="bg-transparent border border-white text-white p-4 text-xs uppercase hover:bg-white hover:text-black transition-all font-bold"
                >
                  DISPARAR PEDIDO DE SELLER
                </button>

                <div className="mt-4 p-3 border border-dashed border-gray-700 text-[10px] text-gray-500 uppercase">
                  STATUS_ENGINE: {status || 'IDLE'}
                </div>
                
                <p className="text-[9px] text-gray-600 uppercase leading-tight">
                  ESTO SIMULA UNA APP EXTERNA ENVIANDO UN PEDIDO PARA ACTIVAR EL RADAR DE DESPACHO.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-brand-safety text-sm font-bold uppercase tracking-widest">Real-time Traffic</h3>
                  <div className="flex gap-2">
                    <button onClick={fetchLogs} className="text-[9px] text-gray-400 hover:text-white uppercase">[Actualizar]</button>
                    <button 
                      onClick={async () => {
                        if (window.confirm('¿ELIMINAR TODA LA BITÁCORA DE TRÁFICO? ESTA ACCIÓN ES IRREVERSIBLE.')) {
                          await fetch('/api/logs', { method: 'DELETE' });
                          fetchLogs();
                        }
                      }}
                      className="text-[9px] text-red-800 hover:text-red-500 uppercase"
                    >
                      [Purgar]
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  {logs.length === 0 ? (
                    <div className="text-[10px] text-gray-600 italic">ESCANEANDO TRÁFICO...</div>
                  ) : (
                    logs.map(log => (
                      <div key={log.id} className="border border-gray-800 bg-gray-950 p-2">
                        <div 
                          className="flex justify-between items-center cursor-pointer group"
                          onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`text-[9px] font-bold px-1 ${log.direction === 'INBOUND' ? 'bg-brand-safety text-black' : 'bg-brand-neon text-black'}`}>
                              {log.direction === 'INBOUND' ? '>>> IN' : 'OUT >>>'}
                            </span>
                            <span className="text-white text-[10px] truncate max-w-[120px]">{log.endpoint}</span>
                          </div>
                          <div className="text-[9px] text-gray-500">
                            {log.status_code} {expandedLogId === log.id ? '[-]' : '[+]'}
                          </div>
                        </div>

                        {expandedLogId === log.id && (
                          <div className="mt-3 border-t border-gray-800 pt-2 text-[9px]">
                            <div className="text-brand-safety mb-1 font-bold">REQUEST_PAYLOAD:</div>
                            <pre className="text-gray-400 overflow-x-auto p-2 bg-black border border-gray-900 mb-2 whitespace-pre-wrap">
                              {JSON.stringify(log.request_payload, null, 2)}
                            </pre>
                            <div className="text-brand-neon mb-1 font-bold">RESPONSE_PAYLOAD:</div>
                            <pre className="text-gray-400 overflow-x-auto p-2 bg-black border border-gray-900 whitespace-pre-wrap">
                              {JSON.stringify(log.response_payload, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
