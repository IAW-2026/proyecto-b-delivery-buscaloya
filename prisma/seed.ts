import { DeliveryStatus, AvailabilityStatus, AssignmentStatus, EventSource, TrackingSource } from '@prisma/client'
import 'dotenv/config'
import { prisma } from '../lib/prisma'

// Función auxiliar para buscar el Clerk ID del usuario ficticio
async function getClerkUserIdByEmail(email: string): Promise<string | null> {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) return null;
  try {
    const res = await fetch(`https://api.clerk.com/v1/users?email_address=${encodeURIComponent(email)}`, {
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json'
      }
    });
    if (res.ok) {
      const users = await res.json() as any[];
      if (users && users.length > 0) return users[0].id;
    }
  } catch (e) {}
  return null;
}

async function main() {
  console.log('⚡ LIMPIANDO BASE DE DATOS DE DRONES...');
  await prisma.travelerLog.deleteMany();
  await prisma.deliveryTrackingPoint.deleteMany();
  await prisma.deliveryStatusEvent.deleteMany();
  await prisma.deliveryAssignment.deleteMany();
  await prisma.deliveryContextSnapshot.deleteMany();
  await prisma.delivery.deleteMany();
  await prisma.courier.deleteMany();

  console.log('🛰 CREANDO COURIERS E INICIALIZANDO CLERK...');
  const deliveryClerkId = await getClerkUserIdByEmail('delivery+clerk_test@iaw.com');
  const adminClerkId = await getClerkUserIdByEmail('admin+clerk_test@iaw.com');

  const couriersData = [
  {
    "name": "DRON FENIX-01",
    "phone": "+54 291 555-0101",
    "vehicle": "Drone",
    "status": "AVAILABLE",
    "last_x": 2500,
    "last_y": 2800
  },
  {
    "name": "DRON CENTINELA-02",
    "phone": "+54 291 555-0102",
    "vehicle": "Drone",
    "status": "ASSIGNED",
    "last_x": 7500,
    "last_y": 4200
  },
  {
    "name": "MOTO HALCON-03",
    "phone": "+54 291 555-0103",
    "vehicle": "Moto",
    "status": "ASSIGNED",
    "last_x": 5000,
    "last_y": 5000
  },
  {
    "name": "BICI ECO-04",
    "phone": "+54 291 555-0104",
    "vehicle": "Bicicleta",
    "status": "OFFLINE",
    "last_x": 4800,
    "last_y": 6100
  },
  {
    "name": "DRON RAPTOR-05",
    "phone": "+54 291 555-0105",
    "vehicle": "Drone",
    "status": "OFFLINE",
    "last_x": 1200,
    "last_y": 8900
  },
  {
    "name": "DRON VIPER-06",
    "phone": "+54 291 555-0106",
    "vehicle": "Drone",
    "status": "AVAILABLE",
    "last_x": 8200,
    "last_y": 1900
  }
];
  const couriers = [];
  for (const c of couriersData) {
    const clerk_id = c.name.includes('FENIX') || c.name.includes('CENTINELA') || c.name.includes('HALCON') ? deliveryClerkId : adminClerkId;
    const dbCourier = await prisma.courier.create({
      data: {
        name: c.name,
        phone: c.phone,
        vehicle_type: c.vehicle,
        status: AvailabilityStatus[c.status as keyof typeof AvailabilityStatus],
        last_x: c.last_x,
        last_y: c.last_y,
        clerk_id: clerk_id || null
      }
    });
    couriers.push(dbCourier);
  }

  console.log('📦 CREANDO ENTREGAS Y HISTORIALES COHERENTES...');
  const deliveries = [
  {
    "id": "71a3fcd6-5692-4c48-bfc5-67155f83408c",
    "order_id": "123fe899-d6a9-4d63-806c-0dcf5acf0caa",
    "status": "COURIER_ASSIGNED",
    "color_code": "#10B981",
    "confirmation_code": "9108",
    "created_at": "2026-06-26T18:30:26.930Z",
    "updated_at": "2026-06-26T19:00:26.930Z",
    "snapshot": {
      "seller_id": "store_libreria_estudiantil",
      "seller_name": "Librería Estudiantil",
      "seller_address": "Alem 1100, Bahía Blanca",
      "seller_x": 5364,
      "seller_y": 7286,
      "buyer_id": "mock_user_1782571170100_33",
      "buyer_name": "Usuario de Prueba 33",
      "buyer_phone": "+54 291 3386184",
      "buyer_address": "Holdich 450",
      "buyer_x": 1909,
      "buyer_y": 4143,
      "created_at": "2026-06-26T18:30:26.930Z"
    },
    "assignedCourierIdx": 0,
    "genStatus": "COURIER_ASSIGNED"
  },
  {
    "id": "b6ed742b-c317-4c24-bd71-2a74ceee1056",
    "order_id": "1501fc2d-f8ba-4cdb-a2c2-2902f4805d6e",
    "status": "DELIVERED",
    "color_code": "#3B82F6",
    "confirmation_code": "4714",
    "created_at": "2026-06-28T18:30:26.932Z",
    "updated_at": "2026-06-28T19:00:26.932Z",
    "snapshot": {
      "seller_id": "store_farmacia_centro",
      "seller_name": "Farmacia del Centro",
      "seller_address": "O'Higgins 50, Bahía Blanca",
      "seller_x": 4455,
      "seller_y": 3714,
      "buyer_id": "mock_user_1782571125876_12",
      "buyer_name": "Usuario de Prueba 12",
      "buyer_phone": "+54 291 6719432",
      "buyer_address": "Las Heras 450",
      "buyer_x": 5727,
      "buyer_y": 4571,
      "created_at": "2026-06-28T18:30:26.932Z"
    },
    "assignedCourierIdx": 1,
    "genStatus": "DELIVERED"
  },
  {
    "id": "3176cb17-c375-4152-b5a6-a379f1435acc",
    "order_id": "1589a989-000d-44cd-acc0-49933fafd468",
    "status": "COURIER_ASSIGNED",
    "color_code": "#10B981",
    "confirmation_code": "5245",
    "created_at": "2026-06-28T18:30:26.930Z",
    "updated_at": "2026-06-28T19:00:26.930Z",
    "snapshot": {
      "seller_id": "store_supermercado_todo",
      "seller_name": "Super Todo",
      "seller_address": "Sarmiento 400, Bahía Blanca",
      "seller_x": 4091,
      "seller_y": 5286,
      "buyer_id": "mock_user_1782571155347_26",
      "buyer_name": "Usuario de Prueba 26",
      "buyer_phone": "+54 291 4450571",
      "buyer_address": "General Paz 150",
      "buyer_x": 7000,
      "buyer_y": 3429,
      "created_at": "2026-06-28T18:30:26.930Z"
    },
    "assignedCourierIdx": 2,
    "genStatus": "COURIER_ASSIGNED"
  },
  {
    "id": "c73a8908-6a8c-4116-963b-09bb51a27639",
    "order_id": "161f8133-449a-4df3-ab99-1ccf7eb1ab68",
    "status": "COURIER_ASSIGNED",
    "color_code": "#3B82F6",
    "confirmation_code": "5063",
    "created_at": "2026-06-25T18:30:26.930Z",
    "updated_at": "2026-06-25T19:00:26.930Z",
    "snapshot": {
      "seller_id": "store_tecnologia_sur",
      "seller_name": "TecnoSur",
      "seller_address": "Chiclana 200, Bahía Blanca",
      "seller_x": 4636,
      "seller_y": 4429,
      "buyer_id": "mock_user_1782571183506_39",
      "buyer_name": "Usuario de Prueba 39",
      "buyer_phone": "+54 291 9854587",
      "buyer_address": "Gorriti 400",
      "buyer_x": 4091,
      "buyer_y": 6571,
      "created_at": "2026-06-25T18:30:26.930Z"
    },
    "assignedCourierIdx": 0,
    "genStatus": "COURIER_ASSIGNED"
  },
  {
    "id": "f2a26ed7-41e5-442d-ac42-2de93d0c55e1",
    "order_id": "16410813-553c-4ff0-bb72-c47a36d38aa8",
    "status": "OUT_FOR_DELIVERY",
    "color_code": "#10B981",
    "confirmation_code": "2499",
    "created_at": "2026-06-24T18:30:26.931Z",
    "updated_at": "2026-06-24T19:00:26.931Z",
    "snapshot": {
      "seller_id": "store_farmacia_centro",
      "seller_name": "Farmacia del Centro",
      "seller_address": "O'Higgins 50, Bahía Blanca",
      "seller_x": 4455,
      "seller_y": 3714,
      "buyer_id": "mock_user_1782571183506_39",
      "buyer_name": "Usuario de Prueba 39",
      "buyer_phone": "+54 291 9854587",
      "buyer_address": "Gorriti 400",
      "buyer_x": 4091,
      "buyer_y": 6571,
      "created_at": "2026-06-24T18:30:26.931Z"
    },
    "assignedCourierIdx": 1,
    "genStatus": "OUT_FOR_DELIVERY"
  },
  {
    "id": "3129e740-3243-4166-a24f-9029adf841d3",
    "order_id": "23c9d87f-d4b6-45d9-b842-bbbb92d3bc12",
    "status": "DELIVERY_FAILED",
    "color_code": "#3B82F6",
    "confirmation_code": "1562",
    "created_at": "2026-06-26T18:30:26.933Z",
    "updated_at": "2026-06-26T19:00:26.933Z",
    "snapshot": {
      "seller_id": "store_pizzeria_roma",
      "seller_name": "Pizzería Roma",
      "seller_address": "Alsina 300, Bahía Blanca",
      "seller_x": 4636,
      "seller_y": 3857,
      "buyer_id": "mock_user_1782571179820_37",
      "buyer_name": "Usuario de Prueba 37",
      "buyer_phone": "+54 291 9725858",
      "buyer_address": "Vieytes 500",
      "buyer_x": 3000,
      "buyer_y": 5857,
      "created_at": "2026-06-26T18:30:26.933Z"
    },
    "assignedCourierIdx": 2,
    "genStatus": "DELIVERY_FAILED"
  },
  {
    "id": "c7010305-456c-4e91-9633-96890a7f15f6",
    "order_id": "2c303175-5836-48a8-818b-f449917c9f94",
    "status": "DELIVERED",
    "color_code": "#10B981",
    "confirmation_code": "9126",
    "created_at": "2026-06-27T18:30:26.931Z",
    "updated_at": "2026-06-27T19:00:26.931Z",
    "snapshot": {
      "seller_id": "store_tecnologia_sur",
      "seller_name": "TecnoSur",
      "seller_address": "Chiclana 200, Bahía Blanca",
      "seller_x": 4636,
      "seller_y": 4429,
      "buyer_id": "mock_user_1782571155347_26",
      "buyer_name": "Usuario de Prueba 26",
      "buyer_phone": "+54 291 4450571",
      "buyer_address": "General Paz 150",
      "buyer_x": 7000,
      "buyer_y": 3429,
      "created_at": "2026-06-27T18:30:26.931Z"
    },
    "assignedCourierIdx": 0,
    "genStatus": "DELIVERED"
  },
  {
    "id": "970100ab-221a-44a3-a220-c8264a5a180f",
    "order_id": "30494f43-750e-4fcb-89df-55536b5c51a4",
    "status": "OUT_FOR_DELIVERY",
    "color_code": "#3B82F6",
    "confirmation_code": "4171",
    "created_at": "2026-06-24T18:30:26.931Z",
    "updated_at": "2026-06-24T19:00:26.931Z",
    "snapshot": {
      "seller_id": "store_farmacia_centro",
      "seller_name": "Farmacia del Centro",
      "seller_address": "O'Higgins 50, Bahía Blanca",
      "seller_x": 4455,
      "seller_y": 3714,
      "buyer_id": "mock_user_1782571186374_40",
      "buyer_name": "Usuario de Prueba 40",
      "buyer_phone": "+54 291 7385631",
      "buyer_address": "Borges 150",
      "buyer_x": 4636,
      "buyer_y": 7000,
      "created_at": "2026-06-24T18:30:26.931Z"
    },
    "assignedCourierIdx": 1,
    "genStatus": "OUT_FOR_DELIVERY"
  },
  {
    "id": "c99e66a4-e6c9-4554-9f94-27c0727f6a13",
    "order_id": "35137a4f-fb2a-4c3b-9666-66f917040ce3",
    "status": "CANCELLED_SUCCESSFULLY",
    "color_code": "#10B981",
    "confirmation_code": "6720",
    "created_at": "2026-06-26T18:30:26.932Z",
    "updated_at": "2026-06-26T19:00:26.932Z",
    "snapshot": {
      "seller_id": "store_farmacia_centro",
      "seller_name": "Farmacia del Centro",
      "seller_address": "O'Higgins 50, Bahía Blanca",
      "seller_x": 4455,
      "seller_y": 3714,
      "buyer_id": "mock_user_1782571176134_35",
      "buyer_name": "Usuario de Prueba 35",
      "buyer_phone": "+54 291 4800010",
      "buyer_address": "Castelli 350",
      "buyer_x": 2091,
      "buyer_y": 5000,
      "created_at": "2026-06-26T18:30:26.932Z"
    },
    "assignedCourierIdx": -1,
    "genStatus": "CANCELLED_SUCCESSFULLY"
  },
  {
    "id": "a3c843bc-b616-4cf4-ba6b-550ba50795b3",
    "order_id": "48a2735f-cb72-4531-8953-5a689c15fd0f",
    "status": "DELIVERED",
    "color_code": "#3B82F6",
    "confirmation_code": "6116",
    "created_at": "2026-06-24T18:30:26.932Z",
    "updated_at": "2026-06-24T19:00:26.932Z",
    "snapshot": {
      "seller_id": "store_libreria_estudiantil",
      "seller_name": "Librería Estudiantil",
      "seller_address": "Alem 1100, Bahía Blanca",
      "seller_x": 5364,
      "seller_y": 7286,
      "buyer_id": "mock_user_1782571097763_1",
      "buyer_name": "Usuario de Prueba 1",
      "buyer_phone": "+54 291 6785441",
      "buyer_address": "Alsina 150",
      "buyer_x": 4564,
      "buyer_y": 3714,
      "created_at": "2026-06-24T18:30:26.932Z"
    },
    "assignedCourierIdx": 0,
    "genStatus": "DELIVERED"
  },
  {
    "id": "dc5301e3-815b-4725-8561-2ecaf36a75ae",
    "order_id": "518cc912-45fa-42e6-969f-ac5bf5c8b56e",
    "status": "ACCEPTED_FOR_ASSIGNMENT",
    "color_code": "#10B981",
    "confirmation_code": "9160",
    "created_at": "2026-06-26T18:30:26.930Z",
    "updated_at": "2026-06-26T19:00:26.930Z",
    "snapshot": {
      "seller_id": "store_libreria_estudiantil",
      "seller_name": "Librería Estudiantil",
      "seller_address": "Alem 1100, Bahía Blanca",
      "seller_x": 5364,
      "seller_y": 7286,
      "buyer_id": "mock_user_1782571097763_1",
      "buyer_name": "Usuario de Prueba 1",
      "buyer_phone": "+54 291 6785441",
      "buyer_address": "Alsina 150",
      "buyer_x": 4564,
      "buyer_y": 3714,
      "created_at": "2026-06-26T18:30:26.930Z"
    },
    "assignedCourierIdx": -1,
    "genStatus": "ACCEPTED_FOR_ASSIGNMENT"
  },
  {
    "id": "46165f40-509f-424e-99ba-9018dae7c903",
    "order_id": "528974d8-56ce-4a01-8206-fcb70ed097d4",
    "status": "DELIVERED",
    "color_code": "#3B82F6",
    "confirmation_code": "6208",
    "created_at": "2026-06-27T18:30:26.932Z",
    "updated_at": "2026-06-27T19:00:26.932Z",
    "snapshot": {
      "seller_id": "store_farmacia_centro",
      "seller_name": "Farmacia del Centro",
      "seller_address": "O'Higgins 50, Bahía Blanca",
      "seller_x": 4455,
      "seller_y": 3714,
      "buyer_id": "mock_user_1782571186374_40",
      "buyer_name": "Usuario de Prueba 40",
      "buyer_phone": "+54 291 7385631",
      "buyer_address": "Borges 150",
      "buyer_x": 4636,
      "buyer_y": 7000,
      "created_at": "2026-06-27T18:30:26.932Z"
    },
    "assignedCourierIdx": 2,
    "genStatus": "DELIVERED"
  },
  {
    "id": "9e48040b-3333-4a56-9337-b44bd80671db",
    "order_id": "545cef0a-a6f7-43cd-8229-b9fa97989181",
    "status": "DELIVERED",
    "color_code": "#10B981",
    "confirmation_code": "8519",
    "created_at": "2026-06-25T18:30:26.931Z",
    "updated_at": "2026-06-25T19:00:26.931Z",
    "snapshot": {
      "seller_id": "store_tecnologia_sur",
      "seller_name": "TecnoSur",
      "seller_address": "Chiclana 200, Bahía Blanca",
      "seller_x": 4636,
      "seller_y": 4429,
      "buyer_id": "mock_user_1782571149203_23",
      "buyer_name": "Usuario de Prueba 23",
      "buyer_phone": "+54 291 1963494",
      "buyer_address": "Corrientes 300",
      "buyer_x": 6818,
      "buyer_y": 4286,
      "created_at": "2026-06-25T18:30:26.931Z"
    },
    "assignedCourierIdx": 0,
    "genStatus": "DELIVERED"
  },
  {
    "id": "89f53e99-d8c1-467d-aa80-1eee0c6e1919",
    "order_id": "619de708-2e9d-4b54-bd45-342908c9ace6",
    "status": "ACCEPTED_FOR_ASSIGNMENT",
    "color_code": "#3B82F6",
    "confirmation_code": "4582",
    "created_at": "2026-06-24T18:30:26.930Z",
    "updated_at": "2026-06-24T19:00:26.930Z",
    "snapshot": {
      "seller_id": "store_libreria_estudiantil",
      "seller_name": "Librería Estudiantil",
      "seller_address": "Alem 1100, Bahía Blanca",
      "seller_x": 5364,
      "seller_y": 7286,
      "buyer_id": "mock_user_1782571101587_2",
      "buyer_name": "Usuario de Prueba 2",
      "buyer_phone": "+54 291 2155479",
      "buyer_address": "Chiclana 400",
      "buyer_x": 4600,
      "buyer_y": 4400,
      "created_at": "2026-06-24T18:30:26.930Z"
    },
    "assignedCourierIdx": -1,
    "genStatus": "ACCEPTED_FOR_ASSIGNMENT"
  },
  {
    "id": "280f610c-4da2-4c03-a01c-f4b07be739f1",
    "order_id": "66e8a22e-081c-485f-b2c6-5ef81ba682ae",
    "status": "PICKED_UP",
    "color_code": "#10B981",
    "confirmation_code": "2098",
    "created_at": "2026-06-24T18:30:26.930Z",
    "updated_at": "2026-06-24T19:00:26.930Z",
    "snapshot": {
      "seller_id": "store_tecnologia_sur",
      "seller_name": "TecnoSur",
      "seller_address": "Chiclana 200, Bahía Blanca",
      "seller_x": 4636,
      "seller_y": 4429,
      "buyer_id": "mock_user_1782571147156_22",
      "buyer_name": "Usuario de Prueba 22",
      "buyer_phone": "+54 291 1243636",
      "buyer_address": "Brandsen 150",
      "buyer_x": 6455,
      "buyer_y": 4000,
      "created_at": "2026-06-24T18:30:26.930Z"
    },
    "assignedCourierIdx": 2,
    "genStatus": "PICKED_UP"
  },
  {
    "id": "2d621998-fc94-4781-8933-790b0b995365",
    "order_id": "6b51eeeb-78ca-476e-abe0-cbed475da66c",
    "status": "PICKED_UP",
    "color_code": "#3B82F6",
    "confirmation_code": "2944",
    "created_at": "2026-06-24T18:30:26.931Z",
    "updated_at": "2026-06-24T19:00:26.931Z",
    "snapshot": {
      "seller_id": "store_farmacia_centro",
      "seller_name": "Farmacia del Centro",
      "seller_address": "O'Higgins 50, Bahía Blanca",
      "seller_x": 4455,
      "seller_y": 3714,
      "buyer_id": "mock_user_1782571127392_13",
      "buyer_name": "Usuario de Prueba 13",
      "buyer_phone": "+54 291 4949600",
      "buyer_address": "Lamadrid 150",
      "buyer_x": 5364,
      "buyer_y": 4429,
      "created_at": "2026-06-24T18:30:26.931Z"
    },
    "assignedCourierIdx": 0,
    "genStatus": "PICKED_UP"
  },
  {
    "id": "4e07af20-d607-45ff-bad8-81223ef3c615",
    "order_id": "6c231159-f471-49f9-b9cc-7a404a204297",
    "status": "DELIVERED",
    "color_code": "#10B981",
    "confirmation_code": "1007",
    "created_at": "2026-06-24T18:30:26.931Z",
    "updated_at": "2026-06-24T19:00:26.931Z",
    "snapshot": {
      "seller_id": "store_pizzeria_roma",
      "seller_name": "Pizzería Roma",
      "seller_address": "Alsina 300, Bahía Blanca",
      "seller_x": 4636,
      "seller_y": 3857,
      "buyer_id": "mock_user_1782571179820_37",
      "buyer_name": "Usuario de Prueba 37",
      "buyer_phone": "+54 291 9725858",
      "buyer_address": "Vieytes 500",
      "buyer_x": 3000,
      "buyer_y": 5857,
      "created_at": "2026-06-24T18:30:26.931Z"
    },
    "assignedCourierIdx": 1,
    "genStatus": "DELIVERED"
  },
  {
    "id": "2acc4709-8af3-4250-b86f-f4eb86127f1b",
    "order_id": "6e1db3a9-fc17-4b57-ad7a-b6dba277eb98",
    "status": "ACCEPTED_FOR_ASSIGNMENT",
    "color_code": "#3B82F6",
    "confirmation_code": "5214",
    "created_at": "2026-06-27T18:30:26.930Z",
    "updated_at": "2026-06-27T19:00:26.930Z",
    "snapshot": {
      "seller_id": "store_pizzeria_roma",
      "seller_name": "Pizzería Roma",
      "seller_address": "Alsina 300, Bahía Blanca",
      "seller_x": 4636,
      "seller_y": 3857,
      "buyer_id": "mock_user_1782571131693_15",
      "buyer_name": "Usuario de Prueba 15",
      "buyer_phone": "+54 291 9931050",
      "buyer_address": "Sarmiento 250",
      "buyer_x": 4273,
      "buyer_y": 5286,
      "created_at": "2026-06-27T18:30:26.930Z"
    },
    "assignedCourierIdx": -1,
    "genStatus": "ACCEPTED_FOR_ASSIGNMENT"
  },
  {
    "id": "efb53700-9d2e-4e0a-98f3-122b38a7afb7",
    "order_id": "70d171e3-d938-43b1-aa14-45d316d598b7",
    "status": "ACCEPTED_FOR_ASSIGNMENT",
    "color_code": "#10B981",
    "confirmation_code": "9385",
    "created_at": "2026-06-28T18:30:26.930Z",
    "updated_at": "2026-06-28T19:00:26.930Z",
    "snapshot": {
      "seller_id": "store_pizzeria_roma",
      "seller_name": "Pizzería Roma",
      "seller_address": "Alsina 300, Bahía Blanca",
      "seller_x": 4636,
      "seller_y": 3857,
      "buyer_id": "mock_user_1782571151866_24",
      "buyer_name": "Usuario de Prueba 24",
      "buyer_phone": "+54 291 3010660",
      "buyer_address": "Lavalle 400",
      "buyer_x": 7182,
      "buyer_y": 4714,
      "created_at": "2026-06-28T18:30:26.930Z"
    },
    "assignedCourierIdx": -1,
    "genStatus": "ACCEPTED_FOR_ASSIGNMENT"
  },
  {
    "id": "1903523b-005c-4255-951d-2d366fe80801",
    "order_id": "7133defa-a370-4a9d-aabb-8d5a7a2efaa9",
    "status": "CANCELLED_SUCCESSFULLY",
    "color_code": "#3B82F6",
    "confirmation_code": "3705",
    "created_at": "2026-06-24T18:30:26.932Z",
    "updated_at": "2026-06-24T19:00:26.932Z",
    "snapshot": {
      "seller_id": "store_tecnologia_sur",
      "seller_name": "TecnoSur",
      "seller_address": "Chiclana 200, Bahía Blanca",
      "seller_x": 4636,
      "seller_y": 4429,
      "buyer_id": "mock_user_1782571155347_26",
      "buyer_name": "Usuario de Prueba 26",
      "buyer_phone": "+54 291 4450571",
      "buyer_address": "General Paz 150",
      "buyer_x": 7000,
      "buyer_y": 3429,
      "created_at": "2026-06-24T18:30:26.932Z"
    },
    "assignedCourierIdx": -1,
    "genStatus": "CANCELLED_SUCCESSFULLY"
  },
  {
    "id": "6ef3cba5-1f3a-4936-829c-bc6c5e250442",
    "order_id": "74c09d0f-6798-44b8-88ed-71ea7c4590ba",
    "status": "PICKED_UP",
    "color_code": "#10B981",
    "confirmation_code": "5176",
    "created_at": "2026-06-26T18:30:26.930Z",
    "updated_at": "2026-06-26T19:00:26.930Z",
    "snapshot": {
      "seller_id": "store_farmacia_centro",
      "seller_name": "Farmacia del Centro",
      "seller_address": "O'Higgins 50, Bahía Blanca",
      "seller_x": 4455,
      "seller_y": 3714,
      "buyer_id": "mock_user_1782571120844_10",
      "buyer_name": "Usuario de Prueba 10",
      "buyer_phone": "+54 291 3075277",
      "buyer_address": "Donado 200",
      "buyer_x": 5545,
      "buyer_y": 3429,
      "created_at": "2026-06-26T18:30:26.930Z"
    },
    "assignedCourierIdx": 2,
    "genStatus": "PICKED_UP"
  },
  {
    "id": "44fb896d-e7d8-4a75-b1ba-48a5ca6083b0",
    "order_id": "758ab2ce-5013-40b1-a883-019704830abf",
    "status": "CANCELLED_SUCCESSFULLY",
    "color_code": "#3B82F6",
    "confirmation_code": "3305",
    "created_at": "2026-06-25T18:30:26.932Z",
    "updated_at": "2026-06-25T19:00:26.932Z",
    "snapshot": {
      "seller_id": "store_libreria_estudiantil",
      "seller_name": "Librería Estudiantil",
      "seller_address": "Alem 1100, Bahía Blanca",
      "seller_x": 5364,
      "seller_y": 7286,
      "buyer_id": "mock_user_1782571198357_45",
      "buyer_name": "Usuario de Prueba 45",
      "buyer_phone": "+54 291 1259179",
      "buyer_address": "O'Higgins 150",
      "buyer_x": 4636,
      "buyer_y": 3429,
      "created_at": "2026-06-25T18:30:26.932Z"
    },
    "assignedCourierIdx": -1,
    "genStatus": "CANCELLED_SUCCESSFULLY"
  },
  {
    "id": "bdffe3ee-e388-4dae-8b86-d8ccb53b45d5",
    "order_id": "82dcbaea-0c2f-44ca-8284-582092de95dd",
    "status": "COURIER_ASSIGNED",
    "color_code": "#10B981",
    "confirmation_code": "2997",
    "created_at": "2026-06-26T18:30:26.930Z",
    "updated_at": "2026-06-26T19:00:26.930Z",
    "snapshot": {
      "seller_id": "store_libreria_estudiantil",
      "seller_name": "Librería Estudiantil",
      "seller_address": "Alem 1100, Bahía Blanca",
      "seller_x": 5364,
      "seller_y": 7286,
      "buyer_id": "mock_user_1782571097763_1",
      "buyer_name": "Usuario de Prueba 1",
      "buyer_phone": "+54 291 6785441",
      "buyer_address": "Alsina 150",
      "buyer_x": 4564,
      "buyer_y": 3714,
      "created_at": "2026-06-26T18:30:26.930Z"
    },
    "assignedCourierIdx": 1,
    "genStatus": "COURIER_ASSIGNED"
  },
  {
    "id": "ade644b5-2f90-42b7-98d1-c2e698c67ec3",
    "order_id": "91953f50-7220-46f6-84ec-1372a39f5e91",
    "status": "ACCEPTED_FOR_ASSIGNMENT",
    "color_code": "#3B82F6",
    "confirmation_code": "2876",
    "created_at": "2026-06-25T18:30:26.930Z",
    "updated_at": "2026-06-25T19:00:26.930Z",
    "snapshot": {
      "seller_id": "store_farmacia_centro",
      "seller_name": "Farmacia del Centro",
      "seller_address": "O'Higgins 50, Bahía Blanca",
      "seller_x": 4455,
      "seller_y": 3714,
      "buyer_id": "mock_user_1782571120844_10",
      "buyer_name": "Usuario de Prueba 10",
      "buyer_phone": "+54 291 3075277",
      "buyer_address": "Donado 200",
      "buyer_x": 5545,
      "buyer_y": 3429,
      "created_at": "2026-06-25T18:30:26.930Z"
    },
    "assignedCourierIdx": -1,
    "genStatus": "ACCEPTED_FOR_ASSIGNMENT"
  },
  {
    "id": "91670261-11dd-4d61-b85e-248303660e15",
    "order_id": "98ff56d3-4829-47bf-9f2b-b3aecd6e9ce1",
    "status": "ACCEPTED_FOR_ASSIGNMENT",
    "color_code": "#10B981",
    "confirmation_code": "3286",
    "created_at": "2026-06-24T18:30:26.930Z",
    "updated_at": "2026-06-24T19:00:26.930Z",
    "snapshot": {
      "seller_id": "store_farmacia_centro",
      "seller_name": "Farmacia del Centro",
      "seller_address": "O'Higgins 50, Bahía Blanca",
      "seller_x": 4455,
      "seller_y": 3714,
      "buyer_id": "mock_user_1782571155347_26",
      "buyer_name": "Usuario de Prueba 26",
      "buyer_phone": "+54 291 4450571",
      "buyer_address": "General Paz 150",
      "buyer_x": 7000,
      "buyer_y": 3429,
      "created_at": "2026-06-24T18:30:26.930Z"
    },
    "assignedCourierIdx": -1,
    "genStatus": "ACCEPTED_FOR_ASSIGNMENT"
  },
  {
    "id": "50f1a6c1-b244-4dfe-8c23-1e743d61455f",
    "order_id": "9ab51a78-b22f-4747-870e-ea3eeb2b0653",
    "status": "PICKED_UP",
    "color_code": "#3B82F6",
    "confirmation_code": "5402",
    "created_at": "2026-06-28T18:30:26.930Z",
    "updated_at": "2026-06-28T19:00:26.930Z",
    "snapshot": {
      "seller_id": "store_farmacia_centro",
      "seller_name": "Farmacia del Centro",
      "seller_address": "O'Higgins 50, Bahía Blanca",
      "seller_x": 4455,
      "seller_y": 3714,
      "buyer_id": "mock_user_1782571139274_18",
      "buyer_name": "Usuario de Prueba 18",
      "buyer_phone": "+54 291 1607669",
      "buyer_address": "Urquiza 350",
      "buyer_x": 2818,
      "buyer_y": 5143,
      "created_at": "2026-06-28T18:30:26.930Z"
    },
    "assignedCourierIdx": 1,
    "genStatus": "PICKED_UP"
  },
  {
    "id": "d5bcae10-198f-421f-a633-9c816089f7a0",
    "order_id": "a2a43b41-00f8-4109-bdb2-c95b2bb4231f",
    "status": "DELIVERED",
    "color_code": "#10B981",
    "confirmation_code": "3351",
    "created_at": "2026-06-26T18:30:26.932Z",
    "updated_at": "2026-06-26T19:00:26.932Z",
    "snapshot": {
      "seller_id": "store_tecnologia_sur",
      "seller_name": "TecnoSur",
      "seller_address": "Chiclana 200, Bahía Blanca",
      "seller_x": 4636,
      "seller_y": 4429,
      "buyer_id": "mock_user_1782571163645_30",
      "buyer_name": "Usuario de Prueba 30",
      "buyer_phone": "+54 291 3784487",
      "buyer_address": "Rivadavia 500",
      "buyer_x": 5000,
      "buyer_y": 2571,
      "created_at": "2026-06-26T18:30:26.932Z"
    },
    "assignedCourierIdx": 2,
    "genStatus": "DELIVERED"
  },
  {
    "id": "26577a96-e913-40cf-bedd-ed74becd2ea2",
    "order_id": "a5bbb438-a9a1-4d0f-91bb-bd778f5a5d8a",
    "status": "OUT_FOR_DELIVERY",
    "color_code": "#3B82F6",
    "confirmation_code": "1422",
    "created_at": "2026-06-28T18:30:26.931Z",
    "updated_at": "2026-06-28T19:00:26.931Z",
    "snapshot": {
      "seller_id": "store_farmacia_centro",
      "seller_name": "Farmacia del Centro",
      "seller_address": "O'Higgins 50, Bahía Blanca",
      "seller_x": 4455,
      "seller_y": 3714,
      "buyer_id": "mock_user_1782571205316_48",
      "buyer_name": "Usuario de Prueba 48",
      "buyer_phone": "+54 291 2514430",
      "buyer_address": "Italia 400",
      "buyer_x": 3000,
      "buyer_y": 2000,
      "created_at": "2026-06-28T18:30:26.931Z"
    },
    "assignedCourierIdx": 0,
    "genStatus": "OUT_FOR_DELIVERY"
  },
  {
    "id": "74fba3f2-e2e1-41a9-be35-6a148db1b1aa",
    "order_id": "a9a13582-fc20-4ea6-a347-06f569fd6de9",
    "status": "DELIVERY_FAILED",
    "color_code": "#10B981",
    "confirmation_code": "8845",
    "created_at": "2026-06-27T18:30:26.932Z",
    "updated_at": "2026-06-27T19:00:26.932Z",
    "snapshot": {
      "seller_id": "store_libreria_estudiantil",
      "seller_name": "Librería Estudiantil",
      "seller_address": "Alem 1100, Bahía Blanca",
      "seller_x": 5364,
      "seller_y": 7286,
      "buyer_id": "mock_user_1782571201846_47",
      "buyer_name": "Usuario de Prueba 47",
      "buyer_phone": "+54 291 4590661",
      "buyer_address": "Darregueira 250",
      "buyer_x": 3545,
      "buyer_y": 2286,
      "created_at": "2026-06-27T18:30:26.932Z"
    },
    "assignedCourierIdx": 1,
    "genStatus": "DELIVERY_FAILED"
  },
  {
    "id": "6e1e86db-57d2-465b-97c6-8709f494aeef",
    "order_id": "c6b356df-f712-45f3-be0e-b02412853a02",
    "status": "DELIVERY_FAILED",
    "color_code": "#3B82F6",
    "confirmation_code": "3934",
    "created_at": "2026-06-24T18:30:26.932Z",
    "updated_at": "2026-06-24T19:00:26.932Z",
    "snapshot": {
      "seller_id": "store_pizzeria_roma",
      "seller_name": "Pizzería Roma",
      "seller_address": "Alsina 300, Bahía Blanca",
      "seller_x": 4636,
      "seller_y": 3857,
      "buyer_id": "mock_user_1782571159647_28",
      "buyer_name": "Usuario de Prueba 28",
      "buyer_phone": "+54 291 6433230",
      "buyer_address": "Saavedra 450",
      "buyer_x": 6273,
      "buyer_y": 2714,
      "created_at": "2026-06-24T18:30:26.932Z"
    },
    "assignedCourierIdx": 2,
    "genStatus": "DELIVERY_FAILED"
  },
  {
    "id": "9968cc15-6964-4150-a6af-335783138a85",
    "order_id": "cba684b5-f1c1-4ba2-b897-1f07d18c2363",
    "status": "ACCEPTED_FOR_ASSIGNMENT",
    "color_code": "#10B981",
    "confirmation_code": "2584",
    "created_at": "2026-06-27T18:30:26.930Z",
    "updated_at": "2026-06-27T19:00:26.930Z",
    "snapshot": {
      "seller_id": "store_supermercado_todo",
      "seller_name": "Super Todo",
      "seller_address": "Sarmiento 400, Bahía Blanca",
      "seller_x": 4091,
      "seller_y": 5286,
      "buyer_id": "mock_user_1782571115720_8",
      "buyer_name": "Usuario de Prueba 8",
      "buyer_phone": "+54 291 6932219",
      "buyer_address": "Soler 250",
      "buyer_x": 5000,
      "buyer_y": 3286,
      "created_at": "2026-06-27T18:30:26.930Z"
    },
    "assignedCourierIdx": -1,
    "genStatus": "ACCEPTED_FOR_ASSIGNMENT"
  },
  {
    "id": "785fe1c3-57c9-427c-b069-86177be56231",
    "order_id": "d8f4b38a-168d-46c4-833a-7675cacb29f5",
    "status": "CANCELLED_SUCCESSFULLY",
    "color_code": "#3B82F6",
    "confirmation_code": "7652",
    "created_at": "2026-06-28T18:30:26.932Z",
    "updated_at": "2026-06-28T19:00:26.932Z",
    "snapshot": {
      "seller_id": "store_pizzeria_roma",
      "seller_name": "Pizzería Roma",
      "seller_address": "Alsina 300, Bahía Blanca",
      "seller_x": 4636,
      "seller_y": 3857,
      "buyer_id": "mock_user_1782571199786_46",
      "buyer_name": "Usuario de Prueba 46",
      "buyer_phone": "+54 291 5282658",
      "buyer_address": "Beruti 500",
      "buyer_x": 4091,
      "buyer_y": 2857,
      "created_at": "2026-06-28T18:30:26.932Z"
    },
    "assignedCourierIdx": -1,
    "genStatus": "CANCELLED_SUCCESSFULLY"
  },
  {
    "id": "a41b1e51-a4ab-4128-8e33-b00b4f608ceb",
    "order_id": "d941f369-7184-47e1-9b54-ee7dbb709aca",
    "status": "ACCEPTED_FOR_ASSIGNMENT",
    "color_code": "#10B981",
    "confirmation_code": "1499",
    "created_at": "2026-06-27T18:30:26.930Z",
    "updated_at": "2026-06-27T19:00:26.930Z",
    "snapshot": {
      "seller_id": "store_pizzeria_roma",
      "seller_name": "Pizzería Roma",
      "seller_address": "Alsina 300, Bahía Blanca",
      "seller_x": 4636,
      "seller_y": 3857,
      "buyer_id": "mock_user_1782571181663_38",
      "buyer_name": "Usuario de Prueba 38",
      "buyer_phone": "+54 291 5679184",
      "buyer_address": "Bravard 250",
      "buyer_x": 3545,
      "buyer_y": 6286,
      "created_at": "2026-06-27T18:30:26.930Z"
    },
    "assignedCourierIdx": -1,
    "genStatus": "ACCEPTED_FOR_ASSIGNMENT"
  },
  {
    "id": "8c6ced11-4698-48cb-b4fd-52557d50fc22",
    "order_id": "da7bdb96-8105-4814-ac79-c6cb3ce4eda6",
    "status": "DELIVERED",
    "color_code": "#3B82F6",
    "confirmation_code": "1665",
    "created_at": "2026-06-27T18:30:26.931Z",
    "updated_at": "2026-06-27T19:00:26.931Z",
    "snapshot": {
      "seller_id": "store_supermercado_todo",
      "seller_name": "Super Todo",
      "seller_address": "Sarmiento 400, Bahía Blanca",
      "seller_x": 4091,
      "seller_y": 5286,
      "buyer_id": "mock_user_1782571130055_14",
      "buyer_name": "Usuario de Prueba 14",
      "buyer_phone": "+54 291 6894446",
      "buyer_address": "Alvarado 300",
      "buyer_x": 4818,
      "buyer_y": 4857,
      "created_at": "2026-06-27T18:30:26.931Z"
    },
    "assignedCourierIdx": 0,
    "genStatus": "DELIVERED"
  },
  {
    "id": "ecff43ac-59d2-4e12-9843-8ca1d2969425",
    "order_id": "da8c4eb5-91a8-4365-ab79-dbcd331cf067",
    "status": "DELIVERED",
    "color_code": "#10B981",
    "confirmation_code": "9182",
    "created_at": "2026-06-25T18:30:26.932Z",
    "updated_at": "2026-06-25T19:00:26.932Z",
    "snapshot": {
      "seller_id": "store_tecnologia_sur",
      "seller_name": "TecnoSur",
      "seller_address": "Chiclana 200, Bahía Blanca",
      "seller_x": 4636,
      "seller_y": 4429,
      "buyer_id": "mock_user_1782571207366_49",
      "buyer_name": "Usuario de Prueba 49",
      "buyer_phone": "+54 291 4204057",
      "buyer_address": "Thompson 150",
      "buyer_x": 2455,
      "buyer_y": 1714,
      "created_at": "2026-06-25T18:30:26.932Z"
    },
    "assignedCourierIdx": 1,
    "genStatus": "DELIVERED"
  },
  {
    "id": "fc72ffaa-f325-472f-a9f9-09bfbfbb0cc5",
    "order_id": "daebefcf-6414-49ca-9907-058c1dfb8fce",
    "status": "ACCEPTED_FOR_ASSIGNMENT",
    "color_code": "#3B82F6",
    "confirmation_code": "9141",
    "created_at": "2026-06-25T18:30:26.930Z",
    "updated_at": "2026-06-25T19:00:26.930Z",
    "snapshot": {
      "seller_id": "store_pizzeria_roma",
      "seller_name": "Pizzería Roma",
      "seller_address": "Alsina 300, Bahía Blanca",
      "seller_x": 4636,
      "seller_y": 3857,
      "buyer_id": "mock_user_1782571198357_45",
      "buyer_name": "Usuario de Prueba 45",
      "buyer_phone": "+54 291 1259179",
      "buyer_address": "O'Higgins 150",
      "buyer_x": 4636,
      "buyer_y": 3429,
      "created_at": "2026-06-25T18:30:26.930Z"
    },
    "assignedCourierIdx": -1,
    "genStatus": "ACCEPTED_FOR_ASSIGNMENT"
  },
  {
    "id": "f126dea2-d38c-4c0d-a027-4381f8dd256e",
    "order_id": "dcc42ba7-501d-4600-bab4-5e030d7da2b2",
    "status": "OUT_FOR_DELIVERY",
    "color_code": "#10B981",
    "confirmation_code": "5768",
    "created_at": "2026-06-26T18:30:26.931Z",
    "updated_at": "2026-06-26T19:00:26.931Z",
    "snapshot": {
      "seller_id": "store_pizzeria_roma",
      "seller_name": "Pizzería Roma",
      "seller_address": "Alsina 300, Bahía Blanca",
      "seller_x": 4636,
      "seller_y": 3857,
      "buyer_id": "mock_user_1782571207366_49",
      "buyer_name": "Usuario de Prueba 49",
      "buyer_phone": "+54 291 4204057",
      "buyer_address": "Thompson 150",
      "buyer_x": 2455,
      "buyer_y": 1714,
      "created_at": "2026-06-26T18:30:26.931Z"
    },
    "assignedCourierIdx": 0,
    "genStatus": "OUT_FOR_DELIVERY"
  },
  {
    "id": "c0d049ca-12c0-47da-b776-bdaaf9aa311f",
    "order_id": "e03edb3f-ff16-4c89-9fb0-7eff3998813b",
    "status": "ACCEPTED_FOR_ASSIGNMENT",
    "color_code": "#3B82F6",
    "confirmation_code": "5053",
    "created_at": "2026-06-25T18:30:26.930Z",
    "updated_at": "2026-06-25T19:00:26.930Z",
    "snapshot": {
      "seller_id": "store_farmacia_centro",
      "seller_name": "Farmacia del Centro",
      "seller_address": "O'Higgins 50, Bahía Blanca",
      "seller_x": 4455,
      "seller_y": 3714,
      "buyer_id": "mock_user_1782571168454_32",
      "buyer_name": "Usuario de Prueba 32",
      "buyer_phone": "+54 291 7815594",
      "buyer_address": "Paraguay 300",
      "buyer_x": 2273,
      "buyer_y": 3857,
      "created_at": "2026-06-25T18:30:26.930Z"
    },
    "assignedCourierIdx": -1,
    "genStatus": "ACCEPTED_FOR_ASSIGNMENT"
  },
  {
    "id": "d4f3b0f9-be94-4f68-9833-0256caa9e7bb",
    "order_id": "e7cb61bc-bbd4-401c-88bd-8683ef995087",
    "status": "DELIVERED",
    "color_code": "#10B981",
    "confirmation_code": "7371",
    "created_at": "2026-06-28T18:30:26.932Z",
    "updated_at": "2026-06-28T19:00:26.932Z",
    "snapshot": {
      "seller_id": "store_tecnologia_sur",
      "seller_name": "TecnoSur",
      "seller_address": "Chiclana 200, Bahía Blanca",
      "seller_x": 4636,
      "seller_y": 4429,
      "buyer_id": "mock_user_1782571147156_22",
      "buyer_name": "Usuario de Prueba 22",
      "buyer_phone": "+54 291 1243636",
      "buyer_address": "Brandsen 150",
      "buyer_x": 6455,
      "buyer_y": 4000,
      "created_at": "2026-06-28T18:30:26.932Z"
    },
    "assignedCourierIdx": 2,
    "genStatus": "DELIVERED"
  },
  {
    "id": "878cd663-7143-42fe-93db-167506634ba3",
    "order_id": "f0170e83-be7d-4d91-ac8f-653513acc459",
    "status": "COURIER_ASSIGNED",
    "color_code": "#3B82F6",
    "confirmation_code": "1486",
    "created_at": "2026-06-24T18:30:26.930Z",
    "updated_at": "2026-06-24T19:00:26.930Z",
    "snapshot": {
      "seller_id": "store_tecnologia_sur",
      "seller_name": "TecnoSur",
      "seller_address": "Chiclana 200, Bahía Blanca",
      "seller_x": 4636,
      "seller_y": 4429,
      "buyer_id": "mock_user_1782571104200_3",
      "buyer_name": "Usuario de Prueba 3",
      "buyer_phone": "+54 291 3702405",
      "buyer_address": "Av. Alem 1250",
      "buyer_x": 5182,
      "buyer_y": 7514,
      "created_at": "2026-06-24T18:30:26.930Z"
    },
    "assignedCourierIdx": 0,
    "genStatus": "COURIER_ASSIGNED"
  },
  {
    "id": "ea6a16a9-d2ba-4656-a701-1729e6272095",
    "order_id": "f3d24dce-ed93-44be-a70e-f82ddbc84b05",
    "status": "DELIVERED",
    "color_code": "#10B981",
    "confirmation_code": "7295",
    "created_at": "2026-06-27T18:30:26.931Z",
    "updated_at": "2026-06-27T19:00:26.931Z",
    "snapshot": {
      "seller_id": "store_supermercado_todo",
      "seller_name": "Super Todo",
      "seller_address": "Sarmiento 400, Bahía Blanca",
      "seller_x": 4091,
      "seller_y": 5286,
      "buyer_id": "mock_user_1782571183506_39",
      "buyer_name": "Usuario de Prueba 39",
      "buyer_phone": "+54 291 9854587",
      "buyer_address": "Gorriti 400",
      "buyer_x": 4091,
      "buyer_y": 6571,
      "created_at": "2026-06-27T18:30:26.931Z"
    },
    "assignedCourierIdx": 1,
    "genStatus": "DELIVERED"
  },
  {
    "id": "69c7418a-1966-41ef-b037-4e2af1176fac",
    "order_id": "f479cb1d-1e2a-46a7-a133-72863ad17a8d",
    "status": "DELIVERED",
    "color_code": "#3B82F6",
    "confirmation_code": "4354",
    "created_at": "2026-06-28T18:30:26.932Z",
    "updated_at": "2026-06-28T19:00:26.932Z",
    "snapshot": {
      "seller_id": "store_farmacia_centro",
      "seller_name": "Farmacia del Centro",
      "seller_address": "O'Higgins 50, Bahía Blanca",
      "seller_x": 4455,
      "seller_y": 3714,
      "buyer_id": "mock_user_1782571120844_10",
      "buyer_name": "Usuario de Prueba 10",
      "buyer_phone": "+54 291 3075277",
      "buyer_address": "Donado 200",
      "buyer_x": 5545,
      "buyer_y": 3429,
      "created_at": "2026-06-28T18:30:26.932Z"
    },
    "assignedCourierIdx": 2,
    "genStatus": "DELIVERED"
  },
  {
    "id": "7505969e-ba07-4ecf-954b-80469a8cb763",
    "order_id": "f488f426-3591-431a-af07-ae35d62dd2e2",
    "status": "PICKED_UP",
    "color_code": "#10B981",
    "confirmation_code": "4394",
    "created_at": "2026-06-27T18:30:26.930Z",
    "updated_at": "2026-06-27T19:00:26.930Z",
    "snapshot": {
      "seller_id": "store_supermercado_todo",
      "seller_name": "Super Todo",
      "seller_address": "Sarmiento 400, Bahía Blanca",
      "seller_x": 4091,
      "seller_y": 5286,
      "buyer_id": "mock_user_1782571141211_19",
      "buyer_name": "Usuario de Prueba 19",
      "buyer_phone": "+54 291 5057492",
      "buyer_address": "Casanova 600",
      "buyer_x": 3909,
      "buyer_y": 6143,
      "created_at": "2026-06-27T18:30:26.930Z"
    },
    "assignedCourierIdx": 0,
    "genStatus": "PICKED_UP"
  },
  {
    "id": "dc3185c3-f9f9-4a47-9437-6f23637a2495",
    "order_id": "f7193ac4-fcf5-4d5b-b89f-b38e6db0b449",
    "status": "OUT_FOR_DELIVERY",
    "color_code": "#3B82F6",
    "confirmation_code": "2283",
    "created_at": "2026-06-25T18:30:26.931Z",
    "updated_at": "2026-06-25T19:00:26.931Z",
    "snapshot": {
      "seller_id": "store_farmacia_centro",
      "seller_name": "Farmacia del Centro",
      "seller_address": "O'Higgins 50, Bahía Blanca",
      "seller_x": 4455,
      "seller_y": 3714,
      "buyer_id": "mock_user_1782571130055_14",
      "buyer_name": "Usuario de Prueba 14",
      "buyer_phone": "+54 291 6894446",
      "buyer_address": "Alvarado 300",
      "buyer_x": 4818,
      "buyer_y": 4857,
      "created_at": "2026-06-25T18:30:26.931Z"
    },
    "assignedCourierIdx": 1,
    "genStatus": "OUT_FOR_DELIVERY"
  },
  {
    "id": "1fa6edde-090c-4c40-a6c4-54b0649ddcc3",
    "order_id": "faa626df-32ce-43ac-8976-642dbaf75019",
    "status": "DELIVERED",
    "color_code": "#10B981",
    "confirmation_code": "7952",
    "created_at": "2026-06-24T18:30:26.932Z",
    "updated_at": "2026-06-24T19:00:26.932Z",
    "snapshot": {
      "seller_id": "store_supermercado_todo",
      "seller_name": "Super Todo",
      "seller_address": "Sarmiento 400, Bahía Blanca",
      "seller_x": 4091,
      "seller_y": 5286,
      "buyer_id": "mock_user_1782571192722_42",
      "buyer_name": "Usuario de Prueba 42",
      "buyer_phone": "+54 291 5684906",
      "buyer_address": "Cuyo 450",
      "buyer_x": 5727,
      "buyer_y": 7714,
      "created_at": "2026-06-24T18:30:26.932Z"
    },
    "assignedCourierIdx": 2,
    "genStatus": "DELIVERED"
  }
];
  for (const d of deliveries) {
    const dbDelivery = await prisma.delivery.create({
      data: {
        id: d.id,
        order_id: d.order_id,
        status: DeliveryStatus[d.genStatus as keyof typeof DeliveryStatus],
        color_code: d.color_code,
        confirmation_code: d.confirmation_code,
        created_at: new Date(d.created_at),
        updated_at: new Date(d.updated_at),
        snapshot: {
          create: {
            seller_id: d.snapshot.seller_id,
            seller_name: d.snapshot.seller_name,
            seller_address: d.snapshot.seller_address,
            seller_x: d.snapshot.seller_x,
            seller_y: d.snapshot.seller_y,
            buyer_id: d.snapshot.buyer_id,
            buyer_name: d.snapshot.buyer_name,
            buyer_phone: d.snapshot.buyer_phone,
            buyer_address: d.snapshot.buyer_address,
            buyer_x: d.snapshot.buyer_x,
            buyer_y: d.snapshot.buyer_y,
            created_at: new Date(d.snapshot.created_at)
          }
        }
      }
    });

    const events = [];
    events.push({
      delivery_id: dbDelivery.id,
      status: DeliveryStatus.ACCEPTED_FOR_ASSIGNMENT,
      source: EventSource.PAYMENTS,
      reason: 'Pago verificado, solicitando drones.'
    });

    if (d.assignedCourierIdx !== -1) {
      const courier = couriers[d.assignedCourierIdx];
      await prisma.deliveryAssignment.create({
        data: {
          delivery_id: dbDelivery.id,
          courier_id: courier.id,
          status: AssignmentStatus.ASSIGNED
        }
      });
      events.push({
        delivery_id: dbDelivery.id,
        status: DeliveryStatus.COURIER_ASSIGNED,
        source: EventSource.SYSTEM,
        reason: `Courier ${courier.name} asignado automáticamente.`
      });
    }

    if (d.genStatus === 'PICKED_UP' || d.genStatus === 'OUT_FOR_DELIVERY' || d.genStatus === 'DELIVERED') {
      events.push({
        delivery_id: dbDelivery.id,
        status: DeliveryStatus.PICKED_UP,
        source: EventSource.DELIVERY,
        reason: 'Pedido retirado del local comercial.'
      });
    }

    if (d.genStatus === 'OUT_FOR_DELIVERY' || d.genStatus === 'DELIVERED') {
      events.push({
        delivery_id: dbDelivery.id,
        status: DeliveryStatus.OUT_FOR_DELIVERY,
        source: EventSource.DELIVERY,
        reason: 'Dron despegó, rumbo trazado a destino.'
      });
      await prisma.deliveryTrackingPoint.createMany({
        data: [
          { delivery_id: dbDelivery.id, lat: -38.7180, lon: -62.2660, source: TrackingSource.SYSTEM },
          { delivery_id: dbDelivery.id, lat: -38.7150, lon: -62.2640, source: TrackingSource.COURIER_APP }
        ]
      });
    }

    if (d.genStatus === 'DELIVERED') {
      events.push({
        delivery_id: dbDelivery.id,
        status: DeliveryStatus.DELIVERED,
        source: EventSource.SYSTEM,
        reason: 'Entrega confirmada vía código OTP.'
      });
    } else if (d.genStatus === 'CANCELLED_SUCCESSFULLY') {
      events.push({
        delivery_id: dbDelivery.id,
        status: DeliveryStatus.CANCELLED_SUCCESSFULLY,
        source: EventSource.BUYER,
        reason: 'El cliente canceló la orden antes de despacho.'
      });
    } else if (d.genStatus === 'DELIVERY_FAILED') {
      events.push({
        delivery_id: dbDelivery.id,
        status: DeliveryStatus.DELIVERY_FAILED,
        source: EventSource.SYSTEM,
        reason: 'Batería insuficiente o cliente ausente. Dron regresa a base.'
      });
    }

    await prisma.deliveryStatusEvent.createMany({ data: events });
  }

  console.log('🖥 INICIALIZANDO BITÁCORAS TRAVELERLOG...');
  await prisma.travelerLog.createMany({
    data: [
  {
    "direction": "INBOUND",
    "endpoint": "/api/delivery-requests",
    "method": "POST",
    "request_payload": "{\"order_id\":\"123fe899-d6a9-4d63-806c-0dcf5acf0caa\",\"seller_name\":\"Librería Estudiantil\",\"buyer_name\":\"Usuario de Prueba 33\"}",
    "response_payload": "{\"success\":true,\"message\":\"Solicitud aceptada para asignación\"}",
    "status_code": 200,
    "created_at": "2026-06-26T18:30:26.930Z"
  },
  {
    "direction": "INBOUND",
    "endpoint": "/api/delivery-requests",
    "method": "POST",
    "request_payload": "{\"order_id\":\"1501fc2d-f8ba-4cdb-a2c2-2902f4805d6e\",\"seller_name\":\"Farmacia del Centro\",\"buyer_name\":\"Usuario de Prueba 12\"}",
    "response_payload": "{\"success\":true,\"message\":\"Solicitud aceptada para asignación\"}",
    "status_code": 200,
    "created_at": "2026-06-28T18:30:26.932Z"
  },
  {
    "direction": "INBOUND",
    "endpoint": "/api/delivery-requests",
    "method": "POST",
    "request_payload": "{\"order_id\":\"1589a989-000d-44cd-acc0-49933fafd468\",\"seller_name\":\"Super Todo\",\"buyer_name\":\"Usuario de Prueba 26\"}",
    "response_payload": "{\"success\":true,\"message\":\"Solicitud aceptada para asignación\"}",
    "status_code": 200,
    "created_at": "2026-06-28T18:30:26.930Z"
  },
  {
    "direction": "INBOUND",
    "endpoint": "/api/delivery-requests",
    "method": "POST",
    "request_payload": "{\"order_id\":\"161f8133-449a-4df3-ab99-1ccf7eb1ab68\",\"seller_name\":\"TecnoSur\",\"buyer_name\":\"Usuario de Prueba 39\"}",
    "response_payload": "{\"success\":true,\"message\":\"Solicitud aceptada para asignación\"}",
    "status_code": 200,
    "created_at": "2026-06-25T18:30:26.930Z"
  },
  {
    "direction": "INBOUND",
    "endpoint": "/api/delivery-requests",
    "method": "POST",
    "request_payload": "{\"order_id\":\"16410813-553c-4ff0-bb72-c47a36d38aa8\",\"seller_name\":\"Farmacia del Centro\",\"buyer_name\":\"Usuario de Prueba 39\"}",
    "response_payload": "{\"success\":true,\"message\":\"Solicitud aceptada para asignación\"}",
    "status_code": 200,
    "created_at": "2026-06-24T18:30:26.931Z"
  },
  {
    "direction": "INBOUND",
    "endpoint": "/api/delivery-requests",
    "method": "POST",
    "request_payload": "{\"order_id\":\"23c9d87f-d4b6-45d9-b842-bbbb92d3bc12\",\"seller_name\":\"Pizzería Roma\",\"buyer_name\":\"Usuario de Prueba 37\"}",
    "response_payload": "{\"success\":true,\"message\":\"Solicitud aceptada para asignación\"}",
    "status_code": 200,
    "created_at": "2026-06-26T18:30:26.933Z"
  },
  {
    "direction": "INBOUND",
    "endpoint": "/api/delivery-requests",
    "method": "POST",
    "request_payload": "{\"order_id\":\"2c303175-5836-48a8-818b-f449917c9f94\",\"seller_name\":\"TecnoSur\",\"buyer_name\":\"Usuario de Prueba 26\"}",
    "response_payload": "{\"success\":true,\"message\":\"Solicitud aceptada para asignación\"}",
    "status_code": 200,
    "created_at": "2026-06-27T18:30:26.931Z"
  },
  {
    "direction": "INBOUND",
    "endpoint": "/api/delivery-requests",
    "method": "POST",
    "request_payload": "{\"order_id\":\"30494f43-750e-4fcb-89df-55536b5c51a4\",\"seller_name\":\"Farmacia del Centro\",\"buyer_name\":\"Usuario de Prueba 40\"}",
    "response_payload": "{\"success\":true,\"message\":\"Solicitud aceptada para asignación\"}",
    "status_code": 200,
    "created_at": "2026-06-24T18:30:26.931Z"
  },
  {
    "direction": "INBOUND",
    "endpoint": "/api/delivery-requests",
    "method": "POST",
    "request_payload": "{\"order_id\":\"35137a4f-fb2a-4c3b-9666-66f917040ce3\",\"seller_name\":\"Farmacia del Centro\",\"buyer_name\":\"Usuario de Prueba 35\"}",
    "response_payload": "{\"success\":true,\"message\":\"Solicitud aceptada para asignación\"}",
    "status_code": 200,
    "created_at": "2026-06-26T18:30:26.932Z"
  },
  {
    "direction": "INBOUND",
    "endpoint": "/api/delivery-requests",
    "method": "POST",
    "request_payload": "{\"order_id\":\"48a2735f-cb72-4531-8953-5a689c15fd0f\",\"seller_name\":\"Librería Estudiantil\",\"buyer_name\":\"Usuario de Prueba 1\"}",
    "response_payload": "{\"success\":true,\"message\":\"Solicitud aceptada para asignación\"}",
    "status_code": 200,
    "created_at": "2026-06-24T18:30:26.932Z"
  },
  {
    "direction": "INBOUND",
    "endpoint": "/api/delivery-requests",
    "method": "POST",
    "request_payload": "{\"order_id\":\"518cc912-45fa-42e6-969f-ac5bf5c8b56e\",\"seller_name\":\"Librería Estudiantil\",\"buyer_name\":\"Usuario de Prueba 1\"}",
    "response_payload": "{\"success\":true,\"message\":\"Solicitud aceptada para asignación\"}",
    "status_code": 200,
    "created_at": "2026-06-26T18:30:26.930Z"
  },
  {
    "direction": "INBOUND",
    "endpoint": "/api/delivery-requests",
    "method": "POST",
    "request_payload": "{\"order_id\":\"528974d8-56ce-4a01-8206-fcb70ed097d4\",\"seller_name\":\"Farmacia del Centro\",\"buyer_name\":\"Usuario de Prueba 40\"}",
    "response_payload": "{\"success\":true,\"message\":\"Solicitud aceptada para asignación\"}",
    "status_code": 200,
    "created_at": "2026-06-27T18:30:26.932Z"
  },
  {
    "direction": "INBOUND",
    "endpoint": "/api/delivery-requests",
    "method": "POST",
    "request_payload": "{\"order_id\":\"545cef0a-a6f7-43cd-8229-b9fa97989181\",\"seller_name\":\"TecnoSur\",\"buyer_name\":\"Usuario de Prueba 23\"}",
    "response_payload": "{\"success\":true,\"message\":\"Solicitud aceptada para asignación\"}",
    "status_code": 200,
    "created_at": "2026-06-25T18:30:26.931Z"
  },
  {
    "direction": "INBOUND",
    "endpoint": "/api/delivery-requests",
    "method": "POST",
    "request_payload": "{\"order_id\":\"619de708-2e9d-4b54-bd45-342908c9ace6\",\"seller_name\":\"Librería Estudiantil\",\"buyer_name\":\"Usuario de Prueba 2\"}",
    "response_payload": "{\"success\":true,\"message\":\"Solicitud aceptada para asignación\"}",
    "status_code": 200,
    "created_at": "2026-06-24T18:30:26.930Z"
  },
  {
    "direction": "INBOUND",
    "endpoint": "/api/delivery-requests",
    "method": "POST",
    "request_payload": "{\"order_id\":\"66e8a22e-081c-485f-b2c6-5ef81ba682ae\",\"seller_name\":\"TecnoSur\",\"buyer_name\":\"Usuario de Prueba 22\"}",
    "response_payload": "{\"success\":true,\"message\":\"Solicitud aceptada para asignación\"}",
    "status_code": 200,
    "created_at": "2026-06-24T18:30:26.930Z"
  }
].map(log => ({
      ...log,
      request_payload: JSON.parse(log.request_payload),
      response_payload: JSON.parse(log.response_payload),
      created_at: new Date(log.created_at)
    }))
  });

  console.log('🎉 ECOSISTEMA DE DELIVERY SEEDEADO CON CONSISTENCIA!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
