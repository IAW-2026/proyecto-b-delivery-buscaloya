'use client';

/**
 * COMPONENTE NÚCLEO: components/radar/TacticalMap.tsx
 * DESCRIPCIÓN: El "Radar Táctico" o mapa interactivo de control de flota de drones.
 * CARACTERÍSTICAS:
 *   - Mapea dinámicamente coordenadas de latitud/longitud en un plano de porcentajes cartesianos en pixeles.
 *   - Permite hacer Zoom & Pan táctico usando ratón/gestos táctiles mediante `react-zoom-pan-pinch`.
 *   - Implementa short-polling cada 3 segundos a `/api/deliveries/pending` para alertas Uber-style de asignación.
 *   - Llama a Server Actions de forma asíncrona para avanzar el viaje y actualizar los mocks en producción.
 */
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { assignCourier, updateDeliveryStatus } from './actions';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import mapaBblanca from '@/app/mapa-bblanca.png';
import { supabase } from '@/lib/supabase';

export function TacticalMap({
  initialCouriers,
  activeMissions,
  initialPending = []
}: {
  initialCouriers: any[],
  activeMissions: any[],
  initialPending?: any[]
}) {
  const router = useRouter();
  const [couriers, setCouriers] = useState<any[]>(initialCouriers);
  const [pendingDeliveries, setPendingDeliveries] = useState<any[]>(initialPending);
  const [localActiveMissions, setLocalActiveMissions] = useState<any[]>(activeMissions);
  const [selectedCourierId, setSelectedCourierId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAssignmentFor, setShowAssignmentFor] = useState<any | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showOtpFor, setShowOtpFor] = useState<any | null>(null);
  const [otpCodeInput, setOtpCodeInput] = useState<string>('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSuccess, setOtpSuccess] = useState<boolean>(false);

  // Sincronizar props del servidor con el estado del cliente cuando cambian
  useEffect(() => {
    setCouriers(initialCouriers);
  }, [initialCouriers]);

  useEffect(() => {
    setPendingDeliveries(initialPending);
  }, [initialPending]);

  useEffect(() => {
    setLocalActiveMissions(activeMissions);
  }, [activeMissions]);

  useEffect(() => {
    setMounted(true);

    const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || 
                          !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'VALOR_ANON_KEY_DE_SUPABASE';

    if (isPlaceholder) {
      console.warn('⚠️ Supabase Realtime no está configurado. Activando fallback de short-polling (3s).');
      const interval = setInterval(async () => {
        try {
          const res = await fetch('/api/deliveries/pending');
          if (res.ok) {
            const data = await res.json();
            setPendingDeliveries(data);
          }
        } catch (e) {
          console.error("Radar Error", e);
        }
      }, 3000);
      return () => clearInterval(interval);
    }

    // Suscripción reactiva en tiempo real con Supabase
    const deliveryChannel = supabase
      .channel('delivery-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'Delivery' },
        (payload) => {
          const id = (payload.new as any)?.id || (payload.old as any)?.id;
          if (id) {
            setPendingDeliveries(prev => prev.filter(p => p.id !== id));
            setLocalActiveMissions(prev => prev.filter(m => m.id !== id));
          }
          if (payload.new) {
            const updatedDelivery = payload.new as any;
            if (['CANCELLED_SUCCESSFULLY', 'DELIVERED', 'DELIVERY_FAILED'].includes(updatedDelivery.status)) {
              setPendingDeliveries(prev => prev.filter(p => p.id !== updatedDelivery.id));
              setLocalActiveMissions(prev => prev.filter(m => m.id !== updatedDelivery.id));
            }
          }
          router.refresh();
        }
      )
      .subscribe();

    const courierChannel = supabase
      .channel('courier-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'Courier' },
        (payload) => {
          console.log('⚡ [Realtime] Cambio en Courier recibido:', payload);
          const updatedCourier = payload.new as any;
          if (updatedCourier) {
            setCouriers(prev => prev.map(c => c.id === updatedCourier.id ? { ...c, ...updatedCourier } : c));
          }
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(deliveryChannel);
      supabase.removeChannel(courierChannel);
    };
  }, [router]);

  // Bounding Box para Bahía Blanca (Mapeo de Coordenadas a % de Mapa)
  const MAP_BOUNDS = {
    n: -38.68,
    s: -38.76,
    w: -62.33,
    e: -62.21
  };

  const coordToPos = (lat: any, lon: any) => {
    const l = Number(lat);
    const ln = Number(lon);
    const x = ((ln - MAP_BOUNDS.w) / (MAP_BOUNDS.e - MAP_BOUNDS.w)) * 100;
    const y = ((MAP_BOUNDS.n - l) / (MAP_BOUNDS.n - MAP_BOUNDS.s)) * 100;
    return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
  };

  const handleAssign = async (deliveryId: string) => {
    if (!selectedCourierId) return alert('Seleccione un dron');
    setIsProcessing(true);

    const targetOrder = pendingDeliveries.find(d => d.id === deliveryId);
    const res = await assignCourier(deliveryId, selectedCourierId);

    if (res.success) {
      setPendingDeliveries(p => p.filter(d => d.id !== deliveryId));
      setShowAssignmentFor(null);
      setSelectedCourierId('');
      router.refresh(); // Actualizar datos en servidor

      // SECUENCIA DE LANZAMIENTO: Esperar 1 segundo para que carguen los colores, luego volar.
      setTimeout(() => {
        if (targetOrder?.snapshot) {
          setCouriers(prev => prev.map(c => {
            if (c.id === selectedCourierId) {
              return {
                ...c,
                last_x: targetOrder.snapshot.seller_x,
                last_y: targetOrder.snapshot.seller_y,
                status: 'ASSIGNED'
              };
            }
            return c;
          }));
        }
      }, 1000); // 1 Segundo de preparación de motores

    } else {
      alert(res.error || 'Error en asignación');
    }
    setIsProcessing(false);
  };

  const handleStatusChange = async (deliveryId: string, newStatus: any) => {
    setIsProcessing(true);

    // Buscar la misión para obtener coordenadas de destino
    const mission = localActiveMissions.find(m => m.id === deliveryId);

    const res = await updateDeliveryStatus(deliveryId, newStatus);

    if (!res.success) {
      alert(res.error || 'Error al actualizar el estado');
      setIsProcessing(false);
      return;
    }

    router.refresh(); // Actualizar datos en servidor

    if (newStatus === 'OUT_FOR_DELIVERY' && mission?.snapshot) {
      // MOTOR DE VUELO FASE 2: Volar a destino
      const courierId = mission.assignments?.[0]?.courier_id;
      setCouriers(prev => prev.map(c => {
        if (c.id === courierId) {
          return {
            ...c,
            last_x: mission.snapshot.buyer_x,
            last_y: mission.snapshot.buyer_y
          };
        }
        return c;
      }));
    }

    setIsProcessing(false);
  };

  const availableCouriers = initialCouriers.filter(c => c.status === 'AVAILABLE');

  return (
    <div className="flex flex-col md:flex-row h-full border-4 border-[#FF007F] bg-black text-[#FF007F] font-mono overflow-hidden">

      {/* MAPA (Izquierda) */}
      <div className="flex-[3] relative border-r-4 border-[#FF007F] bg-zinc-950 overflow-hidden select-none"
        onContextMenu={(e) => e.preventDefault()}>

        <TransformWrapper
          initialScale={1}
          minScale={1}
          maxScale={10}
          centerOnInit={true}
          limitToBounds={true}
          centerZoomedOut={true}
          panning={{
            disabled: false,
          }}
        >
          <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full">
            <div className="relative w-full h-full">
              {/* Fondo del Mapa */}
              <div className="absolute inset-0 z-0 opacity-40 grayscale"
                style={{
                  backgroundImage: `url(${mapaBblanca.src})`,
                  backgroundSize: '100% 100%',
                  backgroundPosition: 'center',
                }}>
              </div>

              <div className="absolute inset-0 bg-[#FF007F]/5 z-0 pointer-events-none"></div>

              {/* CAPA DE NAVEGACIÓN (SVG) - Solo pre-vuelo a destino */}
              <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none overflow-visible">
                {localActiveMissions.map(m => {
                  const courierId = m.assignments?.[0]?.courier_id;
                  const courier = couriers.find(c => c.id === courierId);

                  // La línea solo aparece cuando ya recogió pero aún no sale (PICKED_UP)
                  if (m.status !== 'PICKED_UP' || !courier || m.snapshot?.buyer_x === undefined) return null;

                  const x1 = courier.last_x / 100;
                  const y1 = courier.last_y / 100;
                  const x2 = m.snapshot.buyer_x / 100;
                  const y2 = m.snapshot.buyer_y / 100;
                  const missionColor = m.color_code || '#FF007F';

                  return (
                    <g key={`nav-line-${m.id}`}>
                      <line
                        x1={`${x1}%`} y1={`${y1}%`}
                        x2={`${x2}%`} y2={`${y2}%`}
                        stroke={missionColor}
                        strokeWidth="2"
                        strokeDasharray="8 4"
                        className="animate-[dash_20s_linear_infinite]"
                        style={{ opacity: 0.6 }}
                      />
                    </g>
                  );
                })}
              </svg>

              {/* ORBES DE ÓRDENES DISPONIBLES (Misiones en espera) */}
              {pendingDeliveries.map(p => {
                if (p.snapshot?.seller_x === undefined) return null;
                const posX = p.snapshot.seller_x / 100;
                const posY = p.snapshot.seller_y / 100;
                return (
                  <div
                    key={p.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAssignmentFor(p);
                    }}
                    className="absolute z-20 cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${posX}%`, top: `${posY}%` }}
                  >
                    <div className="relative flex flex-col items-center">
                      <div className="h-5 w-5 rounded-full bg-[#FF007F] animate-ping absolute"></div>
                      <div className="h-5 w-5 rounded-full bg-[#FF007F] border-2 border-white relative z-10"></div>

                      {/* ID Etiqueta Permanente */}
                      <div className="mt-1.5 bg-black border-2 border-[#FF007F] px-1.5 py-0.5 whitespace-nowrap z-20 shadow-[4px_4px_0px_rgba(0,0,0,0.5)]">
                        <div className="text-[9px] text-white font-black leading-none uppercase">
                          {p.order_id}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* ORBES DE ÓRDENES ACTIVAS (Misiones en curso) */}
              {localActiveMissions.map(m => {
                if (m.snapshot?.seller_x === undefined) return null;
                // Si ya fue recogido, quizás mostramos el destino (buyer)? Por ahora según el pedido, el local
                const posX = m.snapshot.seller_x / 100;
                const posY = m.snapshot.seller_y / 100;
                const missionColor = m.color_code || '#FF007F';

                return (
                  <div
                    key={`active-order-${m.id}`}
                    className="absolute z-20 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ left: `${posX}%`, top: `${posY}%` }}
                  >
                    <div className="relative flex flex-col items-center">
                      <div className="h-5 w-5 rounded-full border-2 border-white relative z-10" style={{ backgroundColor: missionColor }}></div>
                      <div className="mt-1.5 bg-black border-2 px-1.5 py-0.5 whitespace-nowrap z-20 shadow-[4px_4px_0px_rgba(0,0,0,0.5)]" style={{ borderColor: missionColor }}>
                        <div className="text-[9px] text-white font-black leading-none uppercase">
                          {m.order_id}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* ORBES DE DESTINO (Ubicación del Comprador) */}
              {localActiveMissions.map(m => {
                if (!['PICKED_UP', 'OUT_FOR_DELIVERY'].includes(m.status) || m.snapshot?.buyer_x === undefined) return null;

                const posX = m.snapshot.buyer_x / 100;
                const posY = m.snapshot.buyer_y / 100;
                const missionColor = m.color_code || '#FF007F';

                return (
                  <div
                    key={`target-${m.id}`}
                    className="absolute z-20 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ left: `${posX}%`, top: `${posY}%` }}
                  >
                    <div className="relative flex flex-col items-center">
                      <div className="h-6 w-6 border-4 border-white rotate-45 flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.5)]" style={{ backgroundColor: missionColor }}>
                        <div className="h-2 w-2 bg-white rounded-full"></div>
                      </div>
                      <div className="mt-2 bg-black border-2 px-2 py-0.5 whitespace-nowrap z-20 shadow-[4px_4px_0px_rgba(0,0,0,0.5)]" style={{ borderColor: missionColor }}>
                        <div className="text-[9px] text-white font-black leading-none uppercase">
                          TARGET: {m.snapshot.buyer_address}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* ORBES DE COURIERS (Unidades) */}
              {couriers.map(c => {
                if (c.last_x === undefined) return null;
                const posX = c.last_x / 100;
                const posY = c.last_y / 100;

                // Buscar si este courier tiene una misión activa
                const activeMission = localActiveMissions.find(m => m.assignments?.[0]?.courier_id === c.id);
                const isAssigned = !!activeMission;
                const courierColor = isAssigned ? activeMission.color_code : '#10B981'; // Verde si disponible, color misión si no

                // No mostrar en mapa si está offline
                if (c.status === 'OFFLINE') return null;

                return (
                  <div
                    key={c.id}
                    className="absolute z-30 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                    style={{
                      left: `${posX}%`,
                      top: `${posY}%`,
                      transition: 'all 5s linear' // MOTOR DE VUELO
                    }}
                  >
                    <div className="relative flex flex-col items-center">
                      {isAssigned && <div className="h-4 w-4 rounded-full animate-ping absolute" style={{ backgroundColor: courierColor }}></div>}
                      <div className="h-4 w-4 rounded-full border-2 border-white relative z-10 shadow-[0_0_15px_rgba(0,0,0,0.5)]" style={{ backgroundColor: courierColor }}></div>
                      <div className="mt-1.5 text-[9px] text-white font-black bg-black border-2 px-1.5 py-0.5 whitespace-nowrap shadow-[4px_4px_0px_rgba(0,0,0,0.5)]" style={{ borderColor: courierColor }}>
                        {c.name.toUpperCase()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TransformComponent>
        </TransformWrapper>

        {/* POPUP DE ASIGNACIÓN */}
        {showAssignmentFor && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-4 border-[#FF007F] bg-black p-8 z-50 w-[95%] max-w-lg shadow-[12px_12px_0px_#FF007F]">
            <div className="flex justify-between items-start mb-6">
              <div className="bg-[#FF007F] text-black px-4 py-1 font-bold text-lg uppercase tracking-tighter">Mission_Engagement</div>
              <button onClick={() => setShowAssignmentFor(null)} className="text-white text-xl font-bold hover:text-[#FF007F]">[/X]</button>
            </div>

            <div className="text-white mb-8 grid grid-cols-2 gap-4">
              <div className="border border-zinc-800 p-3 bg-zinc-950">
                <div className="text-[10px] text-[#FF007F] uppercase mb-1">Origin</div>
                <div className="text-xs font-bold uppercase truncate">{showAssignmentFor.snapshot?.seller_name}</div>
              </div>
              <div className="border border-zinc-800 p-3 bg-zinc-950">
                <div className="text-[10px] text-[#FF007F] uppercase mb-1">Recipient</div>
                <div className="text-xs font-bold uppercase truncate">{showAssignmentFor.snapshot?.buyer_name}</div>
              </div>
              <div className="col-span-2 border border-zinc-800 p-3 bg-zinc-950">
                <div className="text-[10px] text-[#FF007F] uppercase mb-1">Final_Destination</div>
                <div className="text-xs font-bold uppercase">{showAssignmentFor.snapshot?.buyer_address}</div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <label className="text-[10px] uppercase text-[#FF007F] tracking-widest">Select_Unit_Link:</label>
              <select
                className="w-full bg-zinc-900 border-2 border-white text-white p-4 outline-none font-bold text-sm focus:border-[#FF007F] appearance-none"
                value={selectedCourierId}
                onChange={e => setSelectedCourierId(e.target.value)}
              >
                <option value="">-- WAITING_FOR_LINK --</option>
                {availableCouriers.map(c => (
                  <option key={c.id} value={c.id}>{c.name.toUpperCase()} [{c.vehicle_type}]</option>
                ))}
              </select>

              <button
                disabled={isProcessing || !selectedCourierId}
                onClick={() => handleAssign(showAssignmentFor.id)}
                className="w-full bg-[#FF007F] text-black p-5 font-black text-xl uppercase hover:bg-white transition-all disabled:opacity-10"
              >
                {isProcessing ? 'PROCESSING...' : 'ENGAGE_LINK'}
              </button>
            </div>
          </div>
        )}
        {/* POPUP DE VERIFICACIÓN OTP */}
        {showOtpFor && (() => {
          const missionColor = showOtpFor.color_code || '#FF007F';
          return (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-4 bg-black p-8 z-50 w-[95%] max-w-lg shadow-[12px_12px_0px]" style={{ borderColor: missionColor, boxShadow: `12px 12px 0px ${missionColor}` } as any}>
              <div className="flex justify-between items-start mb-6">
                <div className="text-black px-4 py-1 font-bold text-lg uppercase tracking-tighter" style={{ backgroundColor: missionColor }}>Secure_Delivery_Closure</div>
                <button 
                  onClick={() => {
                    setShowOtpFor(null);
                    setOtpError(null);
                    setOtpSuccess(false);
                  }} 
                  className="text-white text-xl font-bold hover:text-red-500"
                >
                  [/X]
                </button>
              </div>

              <div className="text-white mb-6">
                <p className="text-[10px] uppercase text-zinc-400 mb-2">Misión de Entrega</p>
                <h4 className="text-xl font-black">{showOtpFor.order_id}</h4>
                <p className="text-xs text-zinc-500 mt-1.5 uppercase">Destinatario: {showOtpFor.snapshot?.buyer_name}</p>
                <p className="text-xs text-zinc-500 uppercase">Dirección: {showOtpFor.snapshot?.buyer_address}</p>
              </div>

              <div className="flex flex-col gap-4">
                <label className="text-[10px] uppercase tracking-widest font-bold" style={{ color: missionColor }}>Ingrese_Código_Confirmación_OTP:</label>
                <input
                  type="text"
                  maxLength={4}
                  placeholder="0000"
                  value={otpCodeInput}
                  onChange={e => {
                    setOtpCodeInput(e.target.value.replace(/\D/g, ''));
                    setOtpError(null);
                  }}
                  disabled={isProcessing || otpSuccess}
                  className="w-full bg-zinc-900 border-2 text-white p-4 outline-none font-bold text-center text-3xl tracking-[0.5em] focus:border-white uppercase"
                  style={{ borderColor: missionColor }}
                />

                {/* NOTIFICACIONES TÁCTICAS DEL ESTADO OTP */}
                {otpError && (
                  <div className="border border-red-500 bg-red-950/20 text-red-500 p-3 text-center text-[10px] font-bold uppercase tracking-wider animate-pulse">
                    [ ! ERROR: {otpError.toUpperCase()} ]
                  </div>
                )}

                {otpSuccess && (
                  <div className="border border-green-500 bg-green-950/20 text-green-500 p-3 text-center text-[10px] font-bold uppercase tracking-wider animate-bounce">
                    [ ✔ ÉXITO: ENLACE COMPLETADO. CERRANDO SISTEMA... ]
                  </div>
                )}

                <button
                  disabled={isProcessing || otpCodeInput.length !== 4 || otpSuccess}
                  onClick={async () => {
                    setIsProcessing(true);
                    setOtpError(null);
                    const res = await updateDeliveryStatus(showOtpFor.id, 'DELIVERED', otpCodeInput);
                    if (res.success) {
                      setOtpSuccess(true);
                      
                      // Actualizar de forma inmediata el estado local del dron en el cliente para liberarlo
                      const courierId = showOtpFor.assignments?.[0]?.courier_id;
                      if (courierId) {
                        setCouriers(prev => prev.map(c => {
                          if (c.id === courierId) {
                            return {
                              ...c,
                              status: 'AVAILABLE',
                              last_x: showOtpFor.snapshot?.buyer_x ?? c.last_x,
                              last_y: showOtpFor.snapshot?.buyer_y ?? c.last_y
                            };
                          }
                          return c;
                        }));
                      }

                      router.refresh(); // Forzar actualización de servidor para liberar al dron y misiones
                      setTimeout(() => {
                        setShowOtpFor(null);
                        setOtpCodeInput('');
                        setOtpSuccess(false);
                      }, 2000); // 2 segundos de visualización de éxito
                    } else {
                      setOtpError(res.error || 'CÓDIGO OTP INCORRECTO');
                    }
                    setIsProcessing(false);
                  }}
                  className="w-full text-black p-5 font-black text-xl uppercase transition-all disabled:opacity-10 hover:bg-white hover:text-black"
                  style={{ backgroundColor: missionColor }}
                >
                  {isProcessing ? 'CONFIRMANDO...' : otpSuccess ? 'ENLACE_LIBERADO' : 'CERRAR_OPERACIÓN'}
                </button>
              </div>
            </div>
          );
        })()}

        {/* Controles Visuales */}
        <div className="absolute bottom-4 left-4 z-20 flex gap-2">
          <div className="bg-black border border-[#FF007F] px-2 py-1 text-[8px] text-[#FF007F]">
            [SCROLL] ZOOM | [R-CLICK] PAN
          </div>
        </div>
      </div>

      {/* PANEL DE DATOS (Derecha) */}
      <div className="flex-1 flex flex-col bg-black overflow-hidden min-w-[320px]">

        {/* Órdenes en Espera */}
        <section className="flex-1 flex flex-col border-b-2 border-[#FF007F] overflow-hidden">
          <div className="bg-[#FF007F] text-black p-2 text-[10px] font-black uppercase tracking-[0.2em] text-center">
            Pending_Payloads
          </div>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar">
            {pendingDeliveries.map(p => (
              <button
                key={p.id}
                onClick={() => setShowAssignmentFor(p)}
                className={`text-left p-4 border-2 transition-all ${showAssignmentFor?.id === p.id ? 'border-white bg-[#FF007F]/20' : 'border-zinc-800 hover:border-[#FF007F] bg-zinc-950'}`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white text-sm font-black">{p.order_id}</span>
                  <span className="text-[9px] text-[#FF007F] font-mono">
                    {mounted ? new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--:--:--'}
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="text-[10px] text-zinc-400 uppercase truncate">
                    <span className="text-[#FF007F] mr-1">FROM:</span> {p.snapshot?.seller_name}
                  </div>
                  <div className="text-[10px] text-zinc-400 uppercase truncate">
                    <span className="text-white mr-1">TO:</span> {p.snapshot?.buyer_address}
                  </div>
                </div>
              </button>
            ))}
            {pendingDeliveries.length === 0 && (
              <div className="h-full flex items-center justify-center text-zinc-800 text-[10px] font-black uppercase tracking-[0.4em]">Empty_Queue</div>
            )}
          </div>
        </section>

        {/* Flota en Misión */}
        <section className="flex-1 flex flex-col border-b-2 border-[#FF007F] overflow-hidden">
          <div className="bg-white text-black p-2 text-[10px] font-black uppercase tracking-[0.2em] text-center">
            Active_Operations
          </div>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 custom-scrollbar bg-zinc-950">
            {localActiveMissions.map(m => {
              let progress = 25;
              if (m.status === 'PICKED_UP') progress = 50;
              if (m.status === 'OUT_FOR_DELIVERY') progress = 75;
              if (m.status === 'DELIVERED') progress = 100;

              const missionColor = m.color_code || '#FF007F';

              return (
                <div key={m.id} className="border-2 p-4 bg-zinc-950" style={{ borderColor: missionColor }}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-white font-black text-xs">{m.order_id}</div>
                    <div className="text-[8px] text-black px-2 py-0.5 font-bold uppercase" style={{ backgroundColor: missionColor }}>{m.status.replace(/_/g, ' ')}</div>
                  </div>

                  <div className="flex gap-1 mb-3">
                    {[25, 50, 75, 100].map((step) => (
                      <div
                        key={step}
                        className="h-1.5 flex-1 border"
                        style={{
                          backgroundColor: progress >= step ? missionColor : '#18181b',
                          borderColor: progress >= step ? missionColor : '#27272a'
                        }}
                      >
                        {progress === step && <div className="h-full w-full bg-white opacity-40 animate-pulse"></div>}
                      </div>
                    ))}
                  </div>

                  <div className="text-[9px] text-zinc-400 mb-2 flex items-center gap-2 border-l-2 pl-2" style={{ borderLeftColor: missionColor }}>
                    LINK: <span className="text-white font-bold">{m.assignments?.[0]?.courier?.name || 'N/A'}</span>
                  </div>

                  {m.confirmation_code && (
                    <div className="text-[9px] text-zinc-400 mb-2 flex items-center gap-2 border-l-2 pl-2" style={{ borderLeftColor: '#F59E0B' }}>
                      CÓDIGO OTP (CLIENTE): <span className="text-yellow-400 font-bold">{m.confirmation_code}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-2">
                    {m.status === 'COURIER_ASSIGNED' && (
                      <button
                        onClick={() => handleStatusChange(m.id, 'PICKED_UP')}
                        className="border-2 font-bold py-2 text-[10px] transition-all uppercase hover:bg-white hover:text-black"
                        style={{ borderColor: missionColor, color: missionColor }}
                      >
                        Payload_Picked
                      </button>
                    )}
                    {m.status === 'PICKED_UP' && (
                      <button
                        onClick={() => handleStatusChange(m.id, 'OUT_FOR_DELIVERY')}
                        className="border-2 font-bold py-2 text-[10px] transition-all uppercase hover:bg-white hover:text-black"
                        style={{ borderColor: missionColor, color: missionColor }}
                      >
                        In_Transit
                      </button>
                    )}
                    {m.status === 'OUT_FOR_DELIVERY' && (
                      <button
                        onClick={() => {
                          setShowOtpFor(m);
                          setOtpCodeInput('');
                        }}
                        className="border-2 font-bold py-2 text-[10px] transition-all uppercase hover:bg-white hover:text-black"
                        style={{ borderColor: missionColor, color: missionColor }}
                      >
                        Confirm_Delivery
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            {localActiveMissions.length === 0 && (
              <div className="h-full flex items-center justify-center text-zinc-800 text-[10px] font-black uppercase tracking-[0.4em]">No_Active</div>
            )}
          </div>
        </section>

        {/* Estatus de Unidades */}
        <section className="h-40 flex flex-col overflow-hidden bg-black">
          <div className="bg-zinc-900 text-zinc-500 p-2 text-[9px] font-black uppercase tracking-[0.2em] text-center">
            System_Telemetry
          </div>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-1.5">
            {couriers.map(c => (
              <div key={c.id} className="flex justify-between items-center text-[9px] border-b border-zinc-900 pb-1">
                <span className="text-zinc-400 font-bold tracking-tighter">{c.name.toUpperCase()}</span>
                <span className={`px-2 font-black ${c.status === 'AVAILABLE' ? 'text-green-500' : c.status === 'OFFLINE' ? 'text-red-500' : 'text-[#FF007F]'}`}>
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #000;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #FF007F;
        }
        @keyframes dash {
          to {
            stroke-dashoffset: -1000;
          }
        }
      `}</style>
    </div>
  );
}
