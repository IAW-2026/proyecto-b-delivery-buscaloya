import { DeliveryStatus, AvailabilityStatus } from '@prisma/client'
import 'dotenv/config'
import { prisma } from '../lib/prisma'

async function main() {
  console.log('Seeding database...')

  // 1. Crear couriers
  const courier1 = await prisma.courier.create({
    data: {
      name: 'Carlos Repartidor',
      phone: '1234567890',
      vehicle_type: 'Moto',
      license_plate: 'AB123CD',
      status: AvailabilityStatus.AVAILABLE,
    },
  })

  const courier2 = await prisma.courier.create({
    data: {
      name: 'Maria Bici',
      phone: '0987654321',
      vehicle_type: 'Bicicleta',
      status: AvailabilityStatus.OFFLINE,
    },
  })

  // 2. Crear una delivery mock
  const delivery = await prisma.delivery.create({
    data: {
      order_id: 'ORD-12345',
      status: DeliveryStatus.ACCEPTED_FOR_ASSIGNMENT,
      snapshot: {
        create: {
          seller_id: 'SELL-1',
          seller_name: 'Pizzeria Luigi',
          seller_address: 'Calle Falsa 123',
          seller_x: 4500,
          seller_y: 5200,
          buyer_id: 'BUY-1',
          buyer_name: 'Juan Perez',
          buyer_phone: '555-1234',
          buyer_address: 'Avenida Siempreviva 742',
          buyer_x: 6000,
          buyer_y: 6500,
        }
      }
    }
  })

  console.log('Database seeded!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
