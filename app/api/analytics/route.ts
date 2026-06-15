import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // 1. Obtener todos los envíos con sus snapshots e históricos de asignaciones
    const deliveries = await prisma.delivery.findMany({
      include: {
        snapshot: true,
        assignments: {
          include: {
            courier: true
          }
        }
      }
    });

    // 2. Obtener todos los repartidores (couriers) con sus asignaciones
    const couriers = await prisma.courier.findMany({
      include: {
        assignments: {
          include: {
            delivery: true
          }
        }
      }
    });

    // ==========================================
    // CÁLCULO: Tasa de éxito de entrega
    // ==========================================
    const totalDeliveries = deliveries.length;
    let deliveredCount = 0;
    let failedCount = 0;
    let cancelledCount = 0;
    let activeCount = 0;

    deliveries.forEach(d => {
      if (d.status === 'DELIVERED') {
        deliveredCount++;
      } else if (d.status === 'DELIVERY_FAILED') {
        failedCount++;
      } else if (d.status === 'CANCELLED_SUCCESSFULLY') {
        cancelledCount++;
      } else {
        activeCount++;
      }
    });

    const finishedCount = deliveredCount + failedCount + cancelledCount;
    const successRate = finishedCount > 0 ? Number((deliveredCount / finishedCount).toFixed(4)) : 0;

    // ==========================================
    // CÁLCULO: Entregas por tipo de vehículo
    // ==========================================
    const totalByVehicle: Record<string, number> = {};
    const deliveredByVehicle: Record<string, number> = {};

    deliveries.forEach(d => {
      // Buscar la asignación de courier activa o resuelta
      const activeAssignment = d.assignments.find(a => a.status === 'ASSIGNED');
      if (activeAssignment && activeAssignment.courier) {
        const vehicleType = activeAssignment.courier.vehicle_type || 'Desconocido';
        
        totalByVehicle[vehicleType] = (totalByVehicle[vehicleType] || 0) + 1;
        if (d.status === 'DELIVERED') {
          deliveredByVehicle[vehicleType] = (deliveredByVehicle[vehicleType] || 0) + 1;
        }
      }
    });

    // ==========================================
    // CÁLCULO: Productividad individual de repartidores
    // ==========================================
    const courierProductivity = couriers.map(c => {
      const totalAssigned = c.assignments.length;
      const totalDelivered = c.assignments.filter(a => a.delivery && a.delivery.status === 'DELIVERED').length;
      const courierSuccessRate = totalAssigned > 0 ? Number((totalDelivered / totalAssigned).toFixed(4)) : 0;

      return {
        id: c.id,
        name: c.name,
        vehicle_type: c.vehicle_type,
        status: c.status,
        clerk_id: c.clerk_id,
        total_assigned: totalAssigned,
        total_delivered: totalDelivered,
        success_rate: courierSuccessRate
      };
    });

    // ==========================================
    // CÁLCULO: Estado de actividad de la flota
    // ==========================================
    const courierActivityStatus = {
      AVAILABLE: 0,
      ASSIGNED: 0,
      OFFLINE: 0
    };

    couriers.forEach(c => {
      if (c.status in courierActivityStatus) {
        courierActivityStatus[c.status as keyof typeof courierActivityStatus]++;
      } else {
        // En caso de estados inesperados, contar offline por defecto
        courierActivityStatus.OFFLINE++;
      }
    });

    // ==========================================
    // CÁLCULO: Distancia de envío (Euclidiana)
    // ==========================================
    let totalDistance = 0;
    let maxDistance = 0;
    let minDistance = Infinity;
    let distanceCalculatedCount = 0;
    const individualDistances: Array<{ order_id: string; distance: number; status: string }> = [];

    deliveries.forEach(d => {
      if (d.snapshot) {
        const dx = d.snapshot.buyer_x - d.snapshot.seller_x;
        const dy = d.snapshot.buyer_y - d.snapshot.seller_y;
        const dist = Number(Math.sqrt(dx * dx + dy * dy).toFixed(2));

        totalDistance += dist;
        if (dist > maxDistance) maxDistance = dist;
        if (dist < minDistance) minDistance = dist;
        distanceCalculatedCount++;

        individualDistances.push({
          order_id: d.order_id,
          distance: dist,
          status: d.status
        });
      }
    });

    const averageDistance = distanceCalculatedCount > 0 
      ? Number((totalDistance / distanceCalculatedCount).toFixed(2)) 
      : 0;
    const actualMinDistance = distanceCalculatedCount > 0 ? minDistance : 0;

    // ==========================================
    // CÁLCULO: Zonas de alta demanda (buyer_address)
    // ==========================================
    const demandByAddress: Record<string, number> = {};
    deliveries.forEach(d => {
      if (d.snapshot && d.snapshot.buyer_address) {
        const addr = d.snapshot.buyer_address.trim().toUpperCase();
        demandByAddress[addr] = (demandByAddress[addr] || 0) + 1;
      }
    });

    const highDemandZones = Object.entries(demandByAddress)
      .map(([buyer_address, total_orders]) => ({
        buyer_address,
        total_orders
      }))
      .sort((a, b) => b.total_orders - a.total_orders);

    // ==========================================
    // RESPUESTA DE ANALÍTICAS UNIFICADA
    // ==========================================
    const payload = {
      success_rate: {
        total: totalDeliveries,
        delivered: deliveredCount,
        failed: failedCount,
        cancelled: cancelledCount,
        active: activeCount,
        finished: finishedCount,
        rate: successRate
      },
      deliveries_by_vehicle: {
        total_assigned: totalByVehicle,
        delivered: deliveredByVehicle
      },
      courier_productivity: courierProductivity,
      courier_activity_status: courierActivityStatus,
      delivery_distances: {
        average_distance: averageDistance,
        max_distance: maxDistance,
        min_distance: actualMinDistance,
        total_distance: Number(totalDistance.toFixed(2)),
        individual_deliveries: individualDistances
      },
      high_demand_zones: highDemandZones
    };

    return NextResponse.json(payload, { status: 200 });

  } catch (error: any) {
    const errorResponse = { error: error.message || 'Error interno al procesar analíticas' };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
