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
    "id": "659e27e9-cbd6-44d9-91d3-d05e0a527872",
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
    "id": "22250a23-0526-4864-ab6c-8c26127b365e",
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
    "id": "bb14d2fd-8e8a-420a-9559-4f029fd448a5",
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
    "id": "fd07d3ca-6453-4c2b-b9bf-e95412daf81e",
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
    "id": "7aad56f0-1aab-425a-97c3-e699efc18832",
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
    "id": "17e2018a-087d-4b96-8b7f-a7f48bcbcec9",
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
    "id": "f2af9058-7726-4cdb-aaf8-d4cae6d9fdfc",
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
    "id": "514b603b-93d3-4492-8d6b-8d68aa641ac6",
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
    "id": "4c82a74f-7a9d-471e-805a-813421e5a734",
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
    "id": "6461d53d-d3e3-496c-becc-638250466999",
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
    "id": "787e2e14-a851-454c-b774-1f5a9f815c91",
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
    "id": "e5fa3da6-7524-4932-ba1d-11f592f04340",
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
    "id": "ffd68d0e-fc4a-4359-a3da-4275e1fe1b77",
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
    "id": "9c563ba1-3b28-4b5f-83df-73e24517e9ed",
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
    "id": "c7286919-ad1b-4ae7-be88-3deb29dda182",
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
    "id": "7c639e18-a8a6-4656-a758-135d81d8c875",
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
    "id": "529a42d9-61c3-47e9-9c70-0017b9c1101f",
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
    "id": "d4122dc0-fab4-4d7b-a24c-7eaacdc2a579",
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
    "id": "3d5f5ea6-3a09-4e87-b738-0f3772968f8a",
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
    "id": "072586f5-79e9-4cbe-a40d-e827fc625543",
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
    "id": "dded9932-796f-4b02-bc7b-70e1c4cfde6c",
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
    "id": "bc3ed885-7066-43fd-ade9-dbef83891003",
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
    "id": "58a686ec-d068-434f-817e-93ca59f5b118",
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
    "id": "850445e9-65fb-4d4c-bfcd-a41961084dab",
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
    "id": "654ebe66-fb0b-4548-87f9-0bc8972c773b",
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
    "id": "e4c0b961-8a27-4455-adac-750aeb7970d2",
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
    "id": "9e899e79-4d4c-48b5-8c8f-c7423536ceb1",
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
    "id": "88a8e96f-1987-4bc1-a040-472cbfb4186f",
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
    "id": "b523b36e-5684-4dad-b51a-34d0c5edfec5",
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
    "id": "e3263f37-e8a9-40d9-af37-634c02479191",
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
    "id": "793d8488-8812-465e-829a-e33f58a5f27b",
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
    "id": "ce062b7b-a259-4fb1-b0c0-79c7e92c9f89",
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
    "id": "d9629637-39ef-46a1-b20f-4a2a56ef30e5",
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
    "id": "f49d3d45-1f62-400a-b9b0-e346ac539bec",
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
    "id": "c3b95309-bf5b-4012-9fe4-e1a64beea607",
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
    "id": "f257f4fc-b1fe-4bfc-bc4c-9a35094b9512",
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
    "id": "261514da-03ad-40e3-8bf9-e1bd36b23ab8",
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
    "id": "86c73318-2e0f-497b-8363-2007e260bbda",
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
    "id": "c41d0ddf-a3b3-46b2-b2b7-631d3c165828",
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
    "id": "8bd43487-666f-48c9-be94-595aae4678ed",
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
    "id": "707c4eab-7b14-4c57-ac73-a8ad8a80a281",
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
    "id": "63e4ef2b-ff43-4eb6-9521-22accf8fd271",
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
    "id": "61c18869-8a95-4b0d-bae7-bc2fc763549a",
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
    "id": "95d2b014-588d-4ea0-9456-6f22fc07e55e",
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
    "id": "02a1a9f5-f6fa-450f-a220-1e9a5629869b",
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
