import { DeliveryStatus, AvailabilityStatus, AssignmentStatus, EventSource, TrackingSource } from '@prisma/client'
import 'dotenv/config'
import { prisma } from '../lib/prisma'

async function main() {
  console.log('==================================================')
  console.log('⚡ INICIANDO PURGADO DE BASE DE DATOS SUPABASE...')
  console.log('==================================================')

  // Eliminar en orden para evitar violaciones de clave foránea
  const logsCount = await prisma.travelerLog.deleteMany()
  console.log(`✔ Bitácora TravelerLog vaciada: ${logsCount.count} registros eliminados.`)

  const pointsCount = await prisma.deliveryTrackingPoint.deleteMany()
  console.log(`✔ Puntos de tracking eliminados: ${pointsCount.count} registros eliminados.`)

  const eventsCount = await prisma.deliveryStatusEvent.deleteMany()
  console.log(`✔ Eventos de entrega eliminados: ${eventsCount.count} registros eliminados.`)

  const assignmentsCount = await prisma.deliveryAssignment.deleteMany()
  console.log(`✔ Asignaciones de flota eliminadas: ${assignmentsCount.count} registros eliminados.`)

  const snapshotsCount = await prisma.deliveryContextSnapshot.deleteMany()
  console.log(`✔ Snapshots de contexto de entrega eliminados: ${snapshotsCount.count} registros eliminados.`)

  const deliveriesCount = await prisma.delivery.deleteMany()
  console.log(`✔ Misiones de entrega eliminadas: ${deliveriesCount.count} registros eliminados.`)

  const couriersCount = await prisma.courier.deleteMany()
  console.log(`✔ Flota de drones (Couriers) eliminada: ${couriersCount.count} registros eliminados.`)

  console.log('\n==================================================')
  console.log('🚀 INICIANDO INSERCIÓN DE DATOS TÁCTICOS MOCK...')
  console.log('==================================================')

  // 1. Crear la Flota de 6 Couriers (Drones / Vehículos)
  console.log('🛰 Creando flota de drones y couriers...')
  const c1 = await prisma.courier.create({
    data: {
      name: 'DRON FENIX-01',
      phone: '+54 291 555-0101',
      vehicle_type: 'Drone',
      status: AvailabilityStatus.AVAILABLE,
      last_x: 2500,
      last_y: 2800,
    }
  })

  const c2 = await prisma.courier.create({
    data: {
      name: 'DRON CENTINELA-02',
      phone: '+54 291 555-0102',
      vehicle_type: 'Drone',
      status: AvailabilityStatus.ASSIGNED,
      last_x: 7500,
      last_y: 4200,
    }
  })

  const c3 = await prisma.courier.create({
    data: {
      name: 'MOTO HALCON-03',
      phone: '+54 291 555-0103',
      vehicle_type: 'Moto',
      status: AvailabilityStatus.ASSIGNED,
      last_x: 5000,
      last_y: 5000,
    }
  })

  const c4 = await prisma.courier.create({
    data: {
      name: 'BICI ECO-04',
      phone: '+54 291 555-0104',
      vehicle_type: 'Bicicleta',
      status: AvailabilityStatus.OFFLINE,
      last_x: 4800,
      last_y: 6100,
    }
  })

  const c5 = await prisma.courier.create({
    data: {
      name: 'DRON RAPTOR-05',
      phone: '+54 291 555-0105',
      vehicle_type: 'Drone',
      status: AvailabilityStatus.OFFLINE,
      last_x: 1200,
      last_y: 8900,
    }
  })

  const c6 = await prisma.courier.create({
    data: {
      name: 'DRON VIPER-06',
      phone: '+54 291 555-0106',
      vehicle_type: 'Drone',
      status: AvailabilityStatus.AVAILABLE,
      last_x: 8200,
      last_y: 1900,
    }
  })

  console.log('✔ Flota de drones insertada con éxito.')

  // 2. Crear las 8 Misiones de Entrega (en diferentes estados)
  console.log('\n📦 Creando misiones de entrega distribuidas en Bahía Blanca...')

  // Orden 1: Pendiente de Asignación 1
  const d1 = await prisma.delivery.create({
    data: {
      order_id: 'ORD-9821',
      status: DeliveryStatus.ACCEPTED_FOR_ASSIGNMENT,
      color_code: '#FF007F',
      confirmation_code: '1234',
      snapshot: {
        create: {
          seller_id: 'SEL-001',
          seller_name: 'PIZZERÍA DI NAPOLI',
          seller_address: 'Av. Alem 1420',
          seller_x: 3500,
          seller_y: 4800,
          buyer_id: 'BUY-201',
          buyer_name: 'ALICIA GOMEZ',
          buyer_phone: '291-412-3456',
          buyer_address: "O'Higgins 345",
          buyer_x: 5500,
          buyer_y: 7200,
        }
      },
      events: {
        create: {
          status: DeliveryStatus.ACCEPTED_FOR_ASSIGNMENT,
          source: EventSource.PAYMENTS,
          reason: 'Pago acreditado, solicitando envío'
        }
      }
    }
  })

  // Orden 2: Pendiente de Asignación 2
  const d2 = await prisma.delivery.create({
    data: {
      order_id: 'ORD-4402',
      status: DeliveryStatus.ACCEPTED_FOR_ASSIGNMENT,
      color_code: '#FF5E00',
      confirmation_code: '5678',
      snapshot: {
        create: {
          seller_id: 'SEL-002',
          seller_name: 'HAMBURGUESERÍA BRUTAL',
          seller_address: 'Sarmiento 890',
          seller_x: 6200,
          seller_y: 3100,
          buyer_id: 'BUY-202',
          buyer_name: 'ESTEBAN QUITO',
          buyer_phone: '291-477-9911',
          buyer_address: 'Zapiola 112',
          buyer_x: 1800,
          buyer_y: 5500,
        }
      },
      events: {
        create: {
          status: DeliveryStatus.ACCEPTED_FOR_ASSIGNMENT,
          source: EventSource.PAYMENTS,
          reason: 'Pago acreditado, solicitando envío'
        }
      }
    }
  })

  // Orden 3: Dron Asignado (En viaje a origen)
  const d3 = await prisma.delivery.create({
    data: {
      order_id: 'ORD-8711',
      status: DeliveryStatus.COURIER_ASSIGNED,
      color_code: '#10B981',
      confirmation_code: '2468',
      snapshot: {
        create: {
          seller_id: 'SEL-003',
          seller_name: 'SUSHI SHOGUN',
          seller_address: 'Mitre 450',
          seller_x: 2200,
          seller_y: 6400,
          buyer_id: 'BUY-203',
          buyer_name: 'CLARA FUENTES',
          buyer_phone: '291-499-8877',
          buyer_address: 'Caronti 89',
          buyer_x: 4300,
          buyer_y: 2100,
        }
      },
      events: {
        createMany: {
          data: [
            { status: DeliveryStatus.ACCEPTED_FOR_ASSIGNMENT, source: EventSource.PAYMENTS, reason: 'Pedido listo en cocina' },
            { status: DeliveryStatus.COURIER_ASSIGNED, source: EventSource.SYSTEM, reason: 'Dron asignado desde consola de despacho' }
          ]
        }
      },
      assignments: {
        create: {
          courier_id: c2.id,
          status: AssignmentStatus.ASSIGNED,
        }
      }
    }
  })

  // Orden 4: Recogida en Local
  const d4 = await prisma.delivery.create({
    data: {
      order_id: 'ORD-5192',
      status: DeliveryStatus.PICKED_UP,
      color_code: '#EAB308',
      confirmation_code: '1357',
      snapshot: {
        create: {
          seller_id: 'SEL-004',
          seller_name: 'EMPANADAS DON GOMEZ',
          seller_address: 'Belgrano 1200',
          seller_x: 7800,
          seller_y: 5200,
          buyer_id: 'BUY-204',
          buyer_name: 'ROBERTO DIAZ',
          buyer_phone: '291-433-2211',
          buyer_address: 'Chiclana 2030',
          buyer_x: 9100,
          buyer_y: 8400,
        }
      },
      events: {
        createMany: {
          data: [
            { status: DeliveryStatus.ACCEPTED_FOR_ASSIGNMENT, source: EventSource.PAYMENTS, reason: 'Pedido pagado' },
            { status: DeliveryStatus.COURIER_ASSIGNED, source: EventSource.SYSTEM, reason: 'Moto de reparto asignada' },
            { status: DeliveryStatus.PICKED_UP, source: EventSource.DELIVERY, reason: 'Carga asegurada físicamente en el local' }
          ]
        }
      },
      assignments: {
        create: {
          courier_id: c3.id,
          status: AssignmentStatus.ASSIGNED,
        }
      }
    }
  })

  // Orden 5: En Tránsito a Destino (Con código OTP listo para confirmación)
  const d5 = await prisma.delivery.create({
    data: {
      order_id: 'ORD-3321',
      status: DeliveryStatus.OUT_FOR_DELIVERY,
      color_code: '#3B82F6',
      confirmation_code: '4819',
      snapshot: {
        create: {
          seller_id: 'SEL-005',
          seller_name: 'CAFÉ CENTRAL',
          seller_address: 'Estomba 21',
          seller_x: 4800,
          seller_y: 4500,
          buyer_id: 'BUY-205',
          buyer_name: 'SANTIAGO LOPEZ',
          buyer_phone: '291-411-0022',
          buyer_address: 'Urquiza 550',
          buyer_x: 2900,
          buyer_y: 8100,
        }
      },
      events: {
        createMany: {
          data: [
            { status: DeliveryStatus.ACCEPTED_FOR_ASSIGNMENT, source: EventSource.PAYMENTS, reason: 'Pedido pagado' },
            { status: DeliveryStatus.COURIER_ASSIGNED, source: EventSource.SYSTEM, reason: 'Dron vinculado' },
            { status: DeliveryStatus.PICKED_UP, source: EventSource.DELIVERY, reason: 'Carga recogida en cafetería' },
            { status: DeliveryStatus.OUT_FOR_DELIVERY, source: EventSource.DELIVERY, reason: 'Dron despegó, rumbo de navegación trazado' }
          ]
        }
      },
      assignments: {
        create: {
          courier_id: c1.id,
          status: AssignmentStatus.ASSIGNED,
        }
      }
    }
  })

  // Orden 6: Entregada con Éxito (Histórica)
  const d6 = await prisma.delivery.create({
    data: {
      order_id: 'ORD-7740',
      status: DeliveryStatus.DELIVERED,
      color_code: '#8B5CF6',
      confirmation_code: '9230',
      snapshot: {
        create: {
          seller_id: 'SEL-001',
          seller_name: 'PIZZERÍA DI NAPOLI',
          seller_address: 'Av. Alem 1420',
          seller_x: 3500,
          seller_y: 4800,
          buyer_id: 'BUY-206',
          buyer_name: 'MARINA SOLER',
          buyer_phone: '291-482-1111',
          buyer_address: 'Soler 680',
          buyer_x: 7100,
          buyer_y: 6200,
        }
      },
      events: {
        createMany: {
          data: [
            { status: DeliveryStatus.ACCEPTED_FOR_ASSIGNMENT, source: EventSource.PAYMENTS, reason: 'Pedido pagado' },
            { status: DeliveryStatus.COURIER_ASSIGNED, source: EventSource.SYSTEM, reason: 'Dron asignado' },
            { status: DeliveryStatus.PICKED_UP, source: EventSource.DELIVERY, reason: 'Carga retirada de local' },
            { status: DeliveryStatus.OUT_FOR_DELIVERY, source: EventSource.DELIVERY, reason: 'Dron en ruta' },
            { status: DeliveryStatus.DELIVERED, source: EventSource.SYSTEM, reason: 'Close operation' }
          ]
        }
      },
      assignments: {
        create: {
          courier_id: c6.id,
          status: AssignmentStatus.ASSIGNED,
          assigned_at: new Date(Date.now() - 3600000), // Hace 1 hora
          resolved_at: new Date(Date.now() - 1800000), // Hace 30 min
        }
      }
    }
  })

  // Orden 7: Cancelada exitosamente (Histórica)
  const d7 = await prisma.delivery.create({
    data: {
      order_id: 'ORD-1234',
      status: DeliveryStatus.CANCELLED_SUCCESSFULLY,
      color_code: '#EF4444',
      snapshot: {
        create: {
          seller_id: 'SEL-007',
          seller_name: 'BURGER BAR',
          seller_address: 'Av. Alem 22',
          seller_x: 5200,
          seller_y: 5300,
          buyer_id: 'BUY-207',
          buyer_name: 'TOMAS PEREZ',
          buyer_phone: '291-455-8888',
          buyer_address: 'Las Heras 410',
          buyer_x: 6400,
          buyer_y: 2800,
        }
      },
      events: {
        createMany: {
          data: [
            { status: DeliveryStatus.ACCEPTED_FOR_ASSIGNMENT, source: EventSource.PAYMENTS, reason: 'Pedido pagado' },
            { status: DeliveryStatus.CANCELLED_SUCCESSFULLY, source: EventSource.SYSTEM, reason: 'Misión abortada por solicitud de cancelación del cliente' }
          ]
        }
      }
    }
  })

  // Orden 8: Fallida (Histórica)
  const d8 = await prisma.delivery.create({
    data: {
      order_id: 'ORD-5566',
      status: DeliveryStatus.DELIVERY_FAILED,
      color_code: '#EC4899',
      snapshot: {
        create: {
          seller_id: 'SEL-004',
          seller_name: 'EMPANADAS DON GOMEZ',
          seller_address: 'Belgrano 1200',
          seller_x: 7800,
          seller_y: 5200,
          buyer_id: 'BUY-208',
          buyer_name: 'JUAN HERRERA',
          buyer_phone: '291-433-7777',
          buyer_address: 'San Martin 1500',
          buyer_x: 8200,
          buyer_y: 7900,
        }
      },
      events: {
        createMany: {
          data: [
            { status: DeliveryStatus.ACCEPTED_FOR_ASSIGNMENT, source: EventSource.PAYMENTS, reason: 'Pedido pagado' },
            { status: DeliveryStatus.COURIER_ASSIGNED, source: EventSource.SYSTEM, reason: 'Moto de reparto asignada' },
            { status: DeliveryStatus.PICKED_UP, source: EventSource.DELIVERY, reason: 'Carga recogida en el local' },
            { status: DeliveryStatus.DELIVERY_FAILED, source: EventSource.SYSTEM, reason: 'Avería mecánica o cliente ausente' }
          ]
        }
      }
    }
  })

  console.log('✔ Misiones e históricos de entregas insertados con éxito.')

  // 3. Crear registros de Auditoría en la Bitácora (TravelerLog) para pre-poblar el Cyber Deck
  console.log('\n🖥 Creando bitácora de red TravelerLog para auditorías tácticas...')
  await prisma.travelerLog.createMany({
    data: [
      {
        direction: 'INBOUND',
        endpoint: '/api/delivery-requests',
        method: 'POST',
        request_payload: { order_id: 'ORD-9821', seller_name: 'PIZZERÍA DI NAPOLI', buyer_name: 'ALICIA GOMEZ' },
        response_payload: { success: true, message: 'Solicitud aceptada para asignación' },
        status_code: 200,
        created_at: new Date(Date.now() - 7200000)
      },
      {
        direction: 'INBOUND',
        endpoint: '/api/delivery-requests',
        method: 'POST',
        request_payload: { order_id: 'ORD-4402', seller_name: 'HAMBURGUESERÍA BRUTAL', buyer_name: 'ESTEBAN QUITO' },
        response_payload: { success: true, message: 'Solicitud aceptada para asignación' },
        status_code: 200,
        created_at: new Date(Date.now() - 6600000)
      },
      {
        direction: 'INBOUND',
        endpoint: '/api/deliveries/pending',
        method: 'GET',
        request_payload: {},
        response_payload: [
          { id: d1.id, order_id: 'ORD-9821', status: 'ACCEPTED_FOR_ASSIGNMENT' },
          { id: d2.id, order_id: 'ORD-4402', status: 'ACCEPTED_FOR_ASSIGNMENT' }
        ],
        status_code: 200,
        created_at: new Date(Date.now() - 5400000)
      },
      {
        direction: 'OUTBOUND',
        endpoint: '/buyer/order/ORD-8711/confirmation-code',
        method: 'POST',
        request_payload: { order_id: 'ORD-8711', tracking_enabled: true },
        response_payload: { status: 'OK', message: 'Fórmula de encriptación enviada a Buyer App' },
        status_code: 200,
        created_at: new Date(Date.now() - 4800000)
      },
      {
        direction: 'INBOUND',
        endpoint: `/api/deliveries/${d3.id}/tracking`,
        method: 'GET',
        request_payload: {},
        response_payload: { status: 'COURIER_ASSIGNED', lat: -38.7248, lng: -62.3021 },
        status_code: 200,
        created_at: new Date(Date.now() - 3600000)
      },
      {
        direction: 'INBOUND',
        endpoint: `/api/deliveries/${d4.id}/tracking`,
        method: 'GET',
        request_payload: {},
        response_payload: { status: 'PICKED_UP', lat: -38.7188, lng: -62.2452 },
        status_code: 200,
        created_at: new Date(Date.now() - 2400000)
      },
      {
        direction: 'OUTBOUND',
        endpoint: '/buyer/order/ORD-3321/confirmation-code',
        method: 'POST',
        request_payload: { order_id: 'ORD-3321', confirmation_code: '4819' },
        response_payload: { status: 'OK', message: 'Código OTP entregado a dispositivo comprador' },
        status_code: 200,
        created_at: new Date(Date.now() - 1800000)
      },
      {
        direction: 'INBOUND',
        endpoint: `/api/deliveries/${d5.id}/tracking`,
        method: 'GET',
        request_payload: {},
        response_payload: { status: 'OUT_FOR_DELIVERY', lat: -38.7051, lng: -62.2984 },
        status_code: 200,
        created_at: new Date(Date.now() - 900000)
      },
      {
        direction: 'INBOUND',
        endpoint: `/api/deliveries/${d6.id}/status`,
        method: 'POST',
        request_payload: { status: 'DELIVERED', code: '9230' },
        response_payload: { success: true, message: 'Código OTP correcto. Operación cerrada.' },
        status_code: 200,
        created_at: new Date(Date.now() - 300000)
      }
    ]
  })

  console.log('✔ Auditoría TravelerLog inicializada.')

  console.log('\n==================================================')
  console.log('🎉 BASE DE DATOS TOTALMENTE CONFIGURADA Y EN ORDEN!')
  console.log('==================================================')
}

main()
  .catch((e) => {
    console.error('❌ ERROR AL PRECARGAR DATOS:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
