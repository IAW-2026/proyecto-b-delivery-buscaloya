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
        status: AvailabilityStatus[c.status],
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
    "id": "5458e0db-d32f-48c8-a348-8f81d24ca4fc",
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
    "id": "f05305c5-d367-4d0e-bbeb-90e0ed14da84",
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
    "id": "17f62626-d137-48d9-ae45-0a63662130b7",
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
    "id": "85bec544-068c-48e8-8368-9e5f992c77e0",
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
    "id": "c0eaf1a9-ee2a-4657-960c-3d24f2465f0a",
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
    "id": "44ac5a62-f71c-4074-8b66-ff657e4e3f7f",
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
    "id": "3f30edd1-938e-48b7-a2d5-bbcaad00c683",
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
    "id": "b17353a4-9482-4cf8-94ff-4a2c4369307a",
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
    "id": "fe7764bc-9a20-469c-9c7b-b1c3064f4c23",
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
    "id": "a91f123b-7f43-483e-a93c-0a06154359c5",
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
    "id": "41206f86-c968-4979-9aa1-9e1ce6c9da23",
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
    "id": "112082a0-090f-4db5-85ca-c0f73658d8b1",
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
    "id": "d27a4cfb-9912-4479-b12b-725ac834580d",
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
    "id": "911624b0-9afd-47b0-a52c-abcc836c7979",
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
    "id": "f18497e1-5c67-44e5-a1c3-9eb14f71eb39",
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
    "id": "7e5b7d1a-7e8e-43be-9c9e-b9e351360b60",
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
    "id": "fceab950-14d7-4aca-9cde-2fbc00b61b2b",
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
    "id": "c92f171a-79c1-478e-8197-5a7738636005",
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
    "id": "90980d1c-b070-4191-a267-657ddb79e17d",
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
    "id": "d5f08511-b9a9-4c66-92b3-15ca61095b34",
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
    "id": "320b783b-2891-402d-b8c2-1d084b8e4a9a",
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
    "id": "ee7eb1ba-32c6-4f72-8250-5f928683be11",
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
    "id": "5490f448-fe17-4735-8fd7-323dc949bd1f",
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
    "id": "65ed1036-4bed-4f6b-9fb0-8777240b5648",
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
    "id": "336fc114-0077-4573-8fea-8643e751301e",
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
    "id": "1af4835a-c899-451a-951d-730350d7eb23",
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
    "id": "f3de2b9a-01bf-42cf-89ce-7726262d8c16",
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
    "id": "2820195c-ccac-4ac8-8106-c46d15432501",
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
    "id": "476849ee-2654-4b2b-b2d0-f062ffc59b3c",
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
    "id": "348097cd-a405-4d04-8434-b82dc32dc3ee",
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
    "id": "cb03f757-2f28-46b6-aa31-42cbfc710a70",
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
    "id": "90c1bbc7-0847-440f-a016-e665526e1a4f",
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
    "id": "3691f5bc-cedc-489c-8faa-4fbfd5f71150",
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
    "id": "b4f84b9e-b7ee-4f7b-9aea-e7931e93a52b",
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
    "id": "3db2e79b-c1f1-463f-9385-30cfa1290233",
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
    "id": "1a4f8d0e-dd08-482a-9d5b-5d203faf6181",
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
    "id": "600ab18d-70ab-4099-8df1-0e44f80080bb",
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
    "id": "b4d2d7e7-26a0-4a8b-aca0-01103e5965ae",
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
    "id": "7fbc034b-aa55-4f1f-99e4-3d9c34fa9b75",
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
    "id": "f548499d-39f8-404f-8353-aed935c0d00c",
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
    "id": "8b004bd4-6ab3-4ee2-8b37-4d13b630fdd8",
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
    "id": "cc2b8fd4-1e5d-4ced-8492-56d2ced5078c",
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
    "id": "0ffe8adb-586d-4dbd-b848-b2b5f808af94",
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
    "id": "ef191dae-44ea-4b59-9fb9-27eaf8f7bf51",
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
    "id": "2614ed42-fd68-48e9-a264-a2139e4371b8",
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
        status: DeliveryStatus[d.genStatus],
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
