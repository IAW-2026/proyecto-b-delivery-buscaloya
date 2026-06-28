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
    "id": "7fc9f1d0-4757-4046-9474-7659dfd511b9",
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
      "buyer_id": "mock_user_1782571111009_6",
      "buyer_name": "Usuario de Prueba 6",
      "buyer_phone": "+54 291 5624675",
      "buyer_address": "Estomba 350",
      "buyer_x": 3909,
      "buyer_y": 4143,
      "created_at": "2026-06-27T18:30:26.930Z"
    },
    "assignedCourierIdx": -1,
    "genStatus": "ACCEPTED_FOR_ASSIGNMENT"
  },
  {
    "id": "1b285f02-aa2e-4116-954c-019fc72689c5",
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
      "buyer_id": "mock_user_1782571172754_34",
      "buyer_name": "Usuario de Prueba 34",
      "buyer_phone": "+54 291 5254053",
      "buyer_address": "Blandengues 200",
      "buyer_x": 1545,
      "buyer_y": 4571,
      "created_at": "2026-06-25T18:30:26.930Z"
    },
    "assignedCourierIdx": -1,
    "genStatus": "ACCEPTED_FOR_ASSIGNMENT"
  },
  {
    "id": "54f4916f-67de-494b-b43f-686094f5bede",
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
      "buyer_id": "mock_user_1782571195999_44",
      "buyer_name": "Usuario de Prueba 44",
      "buyer_phone": "+54 291 1135108",
      "buyer_address": "Cervantes 350",
      "buyer_x": 6818,
      "buyer_y": 8571,
      "created_at": "2026-06-24T18:30:26.930Z"
    },
    "assignedCourierIdx": -1,
    "genStatus": "ACCEPTED_FOR_ASSIGNMENT"
  },
  {
    "id": "95257a44-d406-47bb-9357-84cd85532e02",
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
      "buyer_id": "mock_user_1782571176134_35",
      "buyer_name": "Usuario de Prueba 35",
      "buyer_phone": "+54 291 4800010",
      "buyer_address": "Castelli 350",
      "buyer_x": 2091,
      "buyer_y": 5000,
      "created_at": "2026-06-25T18:30:26.930Z"
    },
    "assignedCourierIdx": -1,
    "genStatus": "ACCEPTED_FOR_ASSIGNMENT"
  },
  {
    "id": "9c70c6f0-ffdc-401b-8a54-e31afd5d7e18",
    "order_id": "6e1db3a9-fc17-4b57-ad7a-b6dba277eb98",
    "status": "ACCEPTED_FOR_ASSIGNMENT",
    "color_code": "#10B981",
    "confirmation_code": "5214",
    "created_at": "2026-06-27T18:30:26.930Z",
    "updated_at": "2026-06-27T19:00:26.930Z",
    "snapshot": {
      "seller_id": "store_pizzeria_roma",
      "seller_name": "Pizzería Roma",
      "seller_address": "Alsina 300, Bahía Blanca",
      "seller_x": 4636,
      "seller_y": 3857,
      "buyer_id": "mock_user_1782571176134_35",
      "buyer_name": "Usuario de Prueba 35",
      "buyer_phone": "+54 291 4800010",
      "buyer_address": "Castelli 350",
      "buyer_x": 2091,
      "buyer_y": 5000,
      "created_at": "2026-06-27T18:30:26.930Z"
    },
    "assignedCourierIdx": -1,
    "genStatus": "ACCEPTED_FOR_ASSIGNMENT"
  },
  {
    "id": "595fcb7c-3630-4e2e-805f-8ede7ef399ec",
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
      "buyer_id": "mock_user_1782571205316_48",
      "buyer_name": "Usuario de Prueba 48",
      "buyer_phone": "+54 291 2514430",
      "buyer_address": "Italia 400",
      "buyer_x": 3000,
      "buyer_y": 2000,
      "created_at": "2026-06-25T18:30:26.930Z"
    },
    "assignedCourierIdx": -1,
    "genStatus": "ACCEPTED_FOR_ASSIGNMENT"
  },
  {
    "id": "c11c6e3f-bd81-4ae5-9ea9-e2750a972b7b",
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
      "buyer_id": "mock_user_1782571198357_45",
      "buyer_name": "Usuario de Prueba 45",
      "buyer_phone": "+54 291 1259179",
      "buyer_address": "O'Higgins 150",
      "buyer_x": 4636,
      "buyer_y": 3429,
      "created_at": "2026-06-26T18:30:26.930Z"
    },
    "assignedCourierIdx": -1,
    "genStatus": "ACCEPTED_FOR_ASSIGNMENT"
  },
  {
    "id": "65a80a47-6b41-49e0-bd2d-1ac3da2fb076",
    "order_id": "cba684b5-f1c1-4ba2-b897-1f07d18c2363",
    "status": "ACCEPTED_FOR_ASSIGNMENT",
    "color_code": "#3B82F6",
    "confirmation_code": "2584",
    "created_at": "2026-06-27T18:30:26.930Z",
    "updated_at": "2026-06-27T19:00:26.930Z",
    "snapshot": {
      "seller_id": "store_supermercado_todo",
      "seller_name": "Super Todo",
      "seller_address": "Sarmiento 400, Bahía Blanca",
      "seller_x": 4091,
      "seller_y": 5286,
      "buyer_id": "mock_user_1782571189241_41",
      "buyer_name": "Usuario de Prueba 41",
      "buyer_phone": "+54 291 4003208",
      "buyer_address": "Florida 300",
      "buyer_x": 5182,
      "buyer_y": 7286,
      "created_at": "2026-06-27T18:30:26.930Z"
    },
    "assignedCourierIdx": -1,
    "genStatus": "ACCEPTED_FOR_ASSIGNMENT"
  },
  {
    "id": "c5aed305-9551-4ade-94ff-766a0a6cb048",
    "order_id": "619de708-2e9d-4b54-bd45-342908c9ace6",
    "status": "ACCEPTED_FOR_ASSIGNMENT",
    "color_code": "#10B981",
    "confirmation_code": "4582",
    "created_at": "2026-06-24T18:30:26.930Z",
    "updated_at": "2026-06-24T19:00:26.930Z",
    "snapshot": {
      "seller_id": "store_libreria_estudiantil",
      "seller_name": "Librería Estudiantil",
      "seller_address": "Alem 1100, Bahía Blanca",
      "seller_x": 5364,
      "seller_y": 7286,
      "buyer_id": "mock_user_1782571210439_50",
      "buyer_name": "Usuario de Prueba 50",
      "buyer_phone": "+54 291 2519755",
      "buyer_address": "Maldonado 300",
      "buyer_x": 1909,
      "buyer_y": 1429,
      "created_at": "2026-06-24T18:30:26.930Z"
    },
    "assignedCourierIdx": -1,
    "genStatus": "ACCEPTED_FOR_ASSIGNMENT"
  },
  {
    "id": "57ab9ad5-51a8-40c4-8ea8-6740f00d5982",
    "order_id": "70d171e3-d938-43b1-aa14-45d316d598b7",
    "status": "ACCEPTED_FOR_ASSIGNMENT",
    "color_code": "#3B82F6",
    "confirmation_code": "9385",
    "created_at": "2026-06-28T18:30:26.930Z",
    "updated_at": "2026-06-28T19:00:26.930Z",
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
      "created_at": "2026-06-28T18:30:26.930Z"
    },
    "assignedCourierIdx": -1,
    "genStatus": "ACCEPTED_FOR_ASSIGNMENT"
  },
  {
    "id": "d29ccd67-fd8a-47fc-bce9-0ba772fad197",
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
      "buyer_id": "mock_user_1782571106912_4",
      "buyer_name": "Usuario de Prueba 4",
      "buyer_phone": "+54 291 7437090",
      "buyer_address": "San Martín 200",
      "buyer_x": 4091,
      "buyer_y": 3857,
      "created_at": "2026-06-26T18:30:26.930Z"
    },
    "assignedCourierIdx": 1,
    "genStatus": "COURIER_ASSIGNED"
  },
  {
    "id": "ac048616-2fe4-48df-ac28-f1e35cfe6c33",
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
      "buyer_id": "mock_user_1782571161696_29",
      "buyer_name": "Usuario de Prueba 29",
      "buyer_phone": "+54 291 7524996",
      "buyer_address": "Villarino 200",
      "buyer_x": 5727,
      "buyer_y": 2429,
      "created_at": "2026-06-25T18:30:26.930Z"
    },
    "assignedCourierIdx": 2,
    "genStatus": "COURIER_ASSIGNED"
  },
  {
    "id": "e84c17e2-401c-4dac-81a0-e75da2a7e78b",
    "order_id": "f0170e83-be7d-4d91-ac8f-653513acc459",
    "status": "COURIER_ASSIGNED",
    "color_code": "#10B981",
    "confirmation_code": "1486",
    "created_at": "2026-06-24T18:30:26.930Z",
    "updated_at": "2026-06-24T19:00:26.930Z",
    "snapshot": {
      "seller_id": "store_tecnologia_sur",
      "seller_name": "TecnoSur",
      "seller_address": "Chiclana 200, Bahía Blanca",
      "seller_x": 4636,
      "seller_y": 4429,
      "buyer_id": "mock_user_1782571168454_32",
      "buyer_name": "Usuario de Prueba 32",
      "buyer_phone": "+54 291 7815594",
      "buyer_address": "Paraguay 300",
      "buyer_x": 2273,
      "buyer_y": 3857,
      "created_at": "2026-06-24T18:30:26.930Z"
    },
    "assignedCourierIdx": 0,
    "genStatus": "COURIER_ASSIGNED"
  },
  {
    "id": "44668c54-c9da-426b-abf0-dc9a6ff1ceff",
    "order_id": "1589a989-000d-44cd-acc0-49933fafd468",
    "status": "COURIER_ASSIGNED",
    "color_code": "#3B82F6",
    "confirmation_code": "5245",
    "created_at": "2026-06-28T18:30:26.930Z",
    "updated_at": "2026-06-28T19:00:26.930Z",
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
      "created_at": "2026-06-28T18:30:26.930Z"
    },
    "assignedCourierIdx": 1,
    "genStatus": "COURIER_ASSIGNED"
  },
  {
    "id": "9c131965-55f2-4ba9-ba17-4d4414223835",
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
      "buyer_id": "mock_user_1782571183506_39",
      "buyer_name": "Usuario de Prueba 39",
      "buyer_phone": "+54 291 9854587",
      "buyer_address": "Gorriti 400",
      "buyer_x": 4091,
      "buyer_y": 6571,
      "created_at": "2026-06-26T18:30:26.930Z"
    },
    "assignedCourierIdx": 2,
    "genStatus": "COURIER_ASSIGNED"
  },
  {
    "id": "4a2e0ec9-a4d7-449e-b7f4-5bb06660bd78",
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
      "buyer_id": "mock_user_1782571156984_27",
      "buyer_name": "Usuario de Prueba 27",
      "buyer_phone": "+54 291 8348310",
      "buyer_address": "Brown 300",
      "buyer_x": 6636,
      "buyer_y": 3000,
      "created_at": "2026-06-28T18:30:26.930Z"
    },
    "assignedCourierIdx": 0,
    "genStatus": "PICKED_UP"
  },
  {
    "id": "5f33f60b-57df-4c6a-973a-ab76a3f92db9",
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
      "buyer_id": "mock_user_1782571131693_15",
      "buyer_name": "Usuario de Prueba 15",
      "buyer_phone": "+54 291 9931050",
      "buyer_address": "Sarmiento 250",
      "buyer_x": 4273,
      "buyer_y": 5286,
      "created_at": "2026-06-26T18:30:26.930Z"
    },
    "assignedCourierIdx": 1,
    "genStatus": "PICKED_UP"
  },
  {
    "id": "e1b38a06-1c02-4c73-9b08-dd4720a8dc86",
    "order_id": "66e8a22e-081c-485f-b2c6-5ef81ba682ae",
    "status": "PICKED_UP",
    "color_code": "#3B82F6",
    "confirmation_code": "2098",
    "created_at": "2026-06-24T18:30:26.930Z",
    "updated_at": "2026-06-24T19:00:26.930Z",
    "snapshot": {
      "seller_id": "store_tecnologia_sur",
      "seller_name": "TecnoSur",
      "seller_address": "Chiclana 200, Bahía Blanca",
      "seller_x": 4636,
      "seller_y": 4429,
      "buyer_id": "mock_user_1782571135953_17",
      "buyer_name": "Usuario de Prueba 17",
      "buyer_phone": "+54 291 4185627",
      "buyer_address": "Zapiola 500",
      "buyer_x": 3364,
      "buyer_y": 5571,
      "created_at": "2026-06-24T18:30:26.930Z"
    },
    "assignedCourierIdx": 2,
    "genStatus": "PICKED_UP"
  },
  {
    "id": "2b98b7ca-8627-4ee7-b637-0b7268c615cb",
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
      "buyer_id": "mock_user_1782571101587_2",
      "buyer_name": "Usuario de Prueba 2",
      "buyer_phone": "+54 291 2155479",
      "buyer_address": "Chiclana 400",
      "buyer_x": 4600,
      "buyer_y": 4400,
      "created_at": "2026-06-27T18:30:26.930Z"
    },
    "assignedCourierIdx": 0,
    "genStatus": "PICKED_UP"
  },
  {
    "id": "08be32a5-15f3-4b4b-9e3d-6da468fe94c0",
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
      "buyer_id": "mock_user_1782571111009_6",
      "buyer_name": "Usuario de Prueba 6",
      "buyer_phone": "+54 291 5624675",
      "buyer_address": "Estomba 350",
      "buyer_x": 3909,
      "buyer_y": 4143,
      "created_at": "2026-06-24T18:30:26.931Z"
    },
    "assignedCourierIdx": 1,
    "genStatus": "PICKED_UP"
  },
  {
    "id": "5cf4d771-ae9c-437e-80e7-6d13f36b0060",
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
      "buyer_id": "mock_user_1782571156984_27",
      "buyer_name": "Usuario de Prueba 27",
      "buyer_phone": "+54 291 8348310",
      "buyer_address": "Brown 300",
      "buyer_x": 6636,
      "buyer_y": 3000,
      "created_at": "2026-06-26T18:30:26.931Z"
    },
    "assignedCourierIdx": 2,
    "genStatus": "OUT_FOR_DELIVERY"
  },
  {
    "id": "70de42c4-e1e9-42d8-8818-22c23ae14334",
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
      "buyer_id": "mock_user_1782571151866_24",
      "buyer_name": "Usuario de Prueba 24",
      "buyer_phone": "+54 291 3010660",
      "buyer_address": "Lavalle 400",
      "buyer_x": 7182,
      "buyer_y": 4714,
      "created_at": "2026-06-24T18:30:26.931Z"
    },
    "assignedCourierIdx": 0,
    "genStatus": "OUT_FOR_DELIVERY"
  },
  {
    "id": "6db562be-0b4e-488d-bf07-2b29ae231933",
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
      "buyer_id": "mock_user_1782571153709_25",
      "buyer_name": "Usuario de Prueba 25",
      "buyer_phone": "+54 291 8424781",
      "buyer_address": "Dorrego 250",
      "buyer_x": 7545,
      "buyer_y": 3714,
      "created_at": "2026-06-24T18:30:26.931Z"
    },
    "assignedCourierIdx": 1,
    "genStatus": "OUT_FOR_DELIVERY"
  },
  {
    "id": "4d17c0ae-f9cd-482b-ac28-8df0aeca0326",
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
      "buyer_id": "mock_user_1782571147156_22",
      "buyer_name": "Usuario de Prueba 22",
      "buyer_phone": "+54 291 1243636",
      "buyer_address": "Brandsen 150",
      "buyer_x": 6455,
      "buyer_y": 4000,
      "created_at": "2026-06-25T18:30:26.931Z"
    },
    "assignedCourierIdx": 2,
    "genStatus": "OUT_FOR_DELIVERY"
  },
  {
    "id": "5bc24ed3-4f5f-40dc-8b5e-b7f4fd4fad07",
    "order_id": "a5bbb438-a9a1-4d0f-91bb-bd778f5a5d8a",
    "status": "OUT_FOR_DELIVERY",
    "color_code": "#10B981",
    "confirmation_code": "1422",
    "created_at": "2026-06-28T18:30:26.931Z",
    "updated_at": "2026-06-28T19:00:26.931Z",
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
      "created_at": "2026-06-28T18:30:26.931Z"
    },
    "assignedCourierIdx": 0,
    "genStatus": "OUT_FOR_DELIVERY"
  },
  {
    "id": "28f5e987-47b4-4a6b-ae56-834fab46b06c",
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
      "buyer_id": "mock_user_1782571192722_42",
      "buyer_name": "Usuario de Prueba 42",
      "buyer_phone": "+54 291 5684906",
      "buyer_address": "Cuyo 450",
      "buyer_x": 5727,
      "buyer_y": 7714,
      "created_at": "2026-06-27T18:30:26.931Z"
    },
    "assignedCourierIdx": 1,
    "genStatus": "DELIVERED"
  },
  {
    "id": "61377519-a33b-4d40-94a1-932969e5c146",
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
      "buyer_id": "mock_user_1782571189241_41",
      "buyer_name": "Usuario de Prueba 41",
      "buyer_phone": "+54 291 4003208",
      "buyer_address": "Florida 300",
      "buyer_x": 5182,
      "buyer_y": 7286,
      "created_at": "2026-06-24T18:30:26.931Z"
    },
    "assignedCourierIdx": 2,
    "genStatus": "DELIVERED"
  },
  {
    "id": "01cf633f-2d9d-409f-bddf-f85f5066109b",
    "order_id": "2c303175-5836-48a8-818b-f449917c9f94",
    "status": "DELIVERED",
    "color_code": "#3B82F6",
    "confirmation_code": "9126",
    "created_at": "2026-06-27T18:30:26.931Z",
    "updated_at": "2026-06-27T19:00:26.931Z",
    "snapshot": {
      "seller_id": "store_tecnologia_sur",
      "seller_name": "TecnoSur",
      "seller_address": "Chiclana 200, Bahía Blanca",
      "seller_x": 4636,
      "seller_y": 4429,
      "buyer_id": "mock_user_1782571124305_11",
      "buyer_name": "Usuario de Prueba 11",
      "buyer_phone": "+54 291 4165335",
      "buyer_address": "Fitz Roy 300",
      "buyer_x": 5909,
      "buyer_y": 3143,
      "created_at": "2026-06-27T18:30:26.931Z"
    },
    "assignedCourierIdx": 0,
    "genStatus": "DELIVERED"
  },
  {
    "id": "dcdb536f-0727-43ac-ab3d-483574ab6d29",
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
      "buyer_id": "mock_user_1782571165279_31",
      "buyer_name": "Usuario de Prueba 31",
      "buyer_phone": "+54 291 5634171",
      "buyer_address": "Caronti 150",
      "buyer_x": 2636,
      "buyer_y": 3571,
      "created_at": "2026-06-27T18:30:26.931Z"
    },
    "assignedCourierIdx": 1,
    "genStatus": "DELIVERED"
  },
  {
    "id": "fba1e901-dbf2-4c31-a3b8-f0fd4a7233a5",
    "order_id": "545cef0a-a6f7-43cd-8229-b9fa97989181",
    "status": "DELIVERED",
    "color_code": "#3B82F6",
    "confirmation_code": "8519",
    "created_at": "2026-06-25T18:30:26.931Z",
    "updated_at": "2026-06-25T19:00:26.931Z",
    "snapshot": {
      "seller_id": "store_tecnologia_sur",
      "seller_name": "TecnoSur",
      "seller_address": "Chiclana 200, Bahía Blanca",
      "seller_x": 4636,
      "seller_y": 4429,
      "buyer_id": "mock_user_1782571198357_45",
      "buyer_name": "Usuario de Prueba 45",
      "buyer_phone": "+54 291 1259179",
      "buyer_address": "O'Higgins 150",
      "buyer_x": 4636,
      "buyer_y": 3429,
      "created_at": "2026-06-25T18:30:26.931Z"
    },
    "assignedCourierIdx": 2,
    "genStatus": "DELIVERED"
  },
  {
    "id": "6b9762fa-6717-4157-ba92-b52797b50a89",
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
      "buyer_id": "mock_user_1782571168454_32",
      "buyer_name": "Usuario de Prueba 32",
      "buyer_phone": "+54 291 7815594",
      "buyer_address": "Paraguay 300",
      "buyer_x": 2273,
      "buyer_y": 3857,
      "created_at": "2026-06-28T18:30:26.932Z"
    },
    "assignedCourierIdx": 0,
    "genStatus": "DELIVERED"
  },
  {
    "id": "15a4af3b-a568-43e5-afac-44fc53e0e76e",
    "order_id": "faa626df-32ce-43ac-8976-642dbaf75019",
    "status": "DELIVERED",
    "color_code": "#3B82F6",
    "confirmation_code": "7952",
    "created_at": "2026-06-24T18:30:26.932Z",
    "updated_at": "2026-06-24T19:00:26.932Z",
    "snapshot": {
      "seller_id": "store_supermercado_todo",
      "seller_name": "Super Todo",
      "seller_address": "Sarmiento 400, Bahía Blanca",
      "seller_x": 4091,
      "seller_y": 5286,
      "buyer_id": "mock_user_1782571104200_3",
      "buyer_name": "Usuario de Prueba 3",
      "buyer_phone": "+54 291 3702405",
      "buyer_address": "Av. Alem 1250",
      "buyer_x": 5182,
      "buyer_y": 7514,
      "created_at": "2026-06-24T18:30:26.932Z"
    },
    "assignedCourierIdx": 1,
    "genStatus": "DELIVERED"
  },
  {
    "id": "f77f6810-e630-4aeb-8b54-1c8ccc378326",
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
      "buyer_id": "mock_user_1782571124305_11",
      "buyer_name": "Usuario de Prueba 11",
      "buyer_phone": "+54 291 4165335",
      "buyer_address": "Fitz Roy 300",
      "buyer_x": 5909,
      "buyer_y": 3143,
      "created_at": "2026-06-25T18:30:26.932Z"
    },
    "assignedCourierIdx": 2,
    "genStatus": "DELIVERED"
  },
  {
    "id": "78950833-e744-41df-bd54-79f01f1dc9d0",
    "order_id": "a2a43b41-00f8-4109-bdb2-c95b2bb4231f",
    "status": "DELIVERED",
    "color_code": "#3B82F6",
    "confirmation_code": "3351",
    "created_at": "2026-06-26T18:30:26.932Z",
    "updated_at": "2026-06-26T19:00:26.932Z",
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
      "created_at": "2026-06-26T18:30:26.932Z"
    },
    "assignedCourierIdx": 0,
    "genStatus": "DELIVERED"
  },
  {
    "id": "31a7a93a-2917-446f-b511-3adffe3bc095",
    "order_id": "1501fc2d-f8ba-4cdb-a2c2-2902f4805d6e",
    "status": "DELIVERED",
    "color_code": "#10B981",
    "confirmation_code": "4714",
    "created_at": "2026-06-28T18:30:26.932Z",
    "updated_at": "2026-06-28T19:00:26.932Z",
    "snapshot": {
      "seller_id": "store_farmacia_centro",
      "seller_name": "Farmacia del Centro",
      "seller_address": "O'Higgins 50, Bahía Blanca",
      "seller_x": 4455,
      "seller_y": 3714,
      "buyer_id": "mock_user_1782571151866_24",
      "buyer_name": "Usuario de Prueba 24",
      "buyer_phone": "+54 291 3010660",
      "buyer_address": "Lavalle 400",
      "buyer_x": 7182,
      "buyer_y": 4714,
      "created_at": "2026-06-28T18:30:26.932Z"
    },
    "assignedCourierIdx": 1,
    "genStatus": "DELIVERED"
  },
  {
    "id": "e73cc4e6-f5dc-48a5-8645-ec7285b36768",
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
      "buyer_id": "mock_user_1782571104200_3",
      "buyer_name": "Usuario de Prueba 3",
      "buyer_phone": "+54 291 3702405",
      "buyer_address": "Av. Alem 1250",
      "buyer_x": 5182,
      "buyer_y": 7514,
      "created_at": "2026-06-28T18:30:26.932Z"
    },
    "assignedCourierIdx": 2,
    "genStatus": "DELIVERED"
  },
  {
    "id": "ad6a4e4a-5e57-4e4b-9d06-a4a36de30b49",
    "order_id": "528974d8-56ce-4a01-8206-fcb70ed097d4",
    "status": "DELIVERED",
    "color_code": "#10B981",
    "confirmation_code": "6208",
    "created_at": "2026-06-27T18:30:26.932Z",
    "updated_at": "2026-06-27T19:00:26.932Z",
    "snapshot": {
      "seller_id": "store_farmacia_centro",
      "seller_name": "Farmacia del Centro",
      "seller_address": "O'Higgins 50, Bahía Blanca",
      "seller_x": 4455,
      "seller_y": 3714,
      "buyer_id": "mock_user_1782571111009_6",
      "buyer_name": "Usuario de Prueba 6",
      "buyer_phone": "+54 291 5624675",
      "buyer_address": "Estomba 350",
      "buyer_x": 3909,
      "buyer_y": 4143,
      "created_at": "2026-06-27T18:30:26.932Z"
    },
    "assignedCourierIdx": 0,
    "genStatus": "DELIVERED"
  },
  {
    "id": "209ae285-9f75-4292-9bdc-e1d6238271df",
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
      "buyer_id": "mock_user_1782571186374_40",
      "buyer_name": "Usuario de Prueba 40",
      "buyer_phone": "+54 291 7385631",
      "buyer_address": "Borges 150",
      "buyer_x": 4636,
      "buyer_y": 7000,
      "created_at": "2026-06-24T18:30:26.932Z"
    },
    "assignedCourierIdx": 1,
    "genStatus": "DELIVERED"
  },
  {
    "id": "056611b0-693f-4a28-b54b-9f3de5f75cb3",
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
      "buyer_id": "mock_user_1782571101587_2",
      "buyer_name": "Usuario de Prueba 2",
      "buyer_phone": "+54 291 2155479",
      "buyer_address": "Chiclana 400",
      "buyer_x": 4600,
      "buyer_y": 4400,
      "created_at": "2026-06-26T18:30:26.932Z"
    },
    "assignedCourierIdx": -1,
    "genStatus": "CANCELLED_SUCCESSFULLY"
  },
  {
    "id": "1ed8d4a7-b2c2-4e64-bfaf-0e03b9c4968b",
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
      "buyer_id": "mock_user_1782571151866_24",
      "buyer_name": "Usuario de Prueba 24",
      "buyer_phone": "+54 291 3010660",
      "buyer_address": "Lavalle 400",
      "buyer_x": 7182,
      "buyer_y": 4714,
      "created_at": "2026-06-24T18:30:26.932Z"
    },
    "assignedCourierIdx": -1,
    "genStatus": "CANCELLED_SUCCESSFULLY"
  },
  {
    "id": "bc03e5b2-2917-4028-b117-4bc7a6e417ce",
    "order_id": "758ab2ce-5013-40b1-a883-019704830abf",
    "status": "CANCELLED_SUCCESSFULLY",
    "color_code": "#10B981",
    "confirmation_code": "3305",
    "created_at": "2026-06-25T18:30:26.932Z",
    "updated_at": "2026-06-25T19:00:26.932Z",
    "snapshot": {
      "seller_id": "store_libreria_estudiantil",
      "seller_name": "Librería Estudiantil",
      "seller_address": "Alem 1100, Bahía Blanca",
      "seller_x": 5364,
      "seller_y": 7286,
      "buyer_id": "mock_user_1782571165279_31",
      "buyer_name": "Usuario de Prueba 31",
      "buyer_phone": "+54 291 5634171",
      "buyer_address": "Caronti 150",
      "buyer_x": 2636,
      "buyer_y": 3571,
      "created_at": "2026-06-25T18:30:26.932Z"
    },
    "assignedCourierIdx": -1,
    "genStatus": "CANCELLED_SUCCESSFULLY"
  },
  {
    "id": "f5c8678a-e358-4bef-9c81-73321b9b000b",
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
      "buyer_id": "mock_user_1782571192722_42",
      "buyer_name": "Usuario de Prueba 42",
      "buyer_phone": "+54 291 5684906",
      "buyer_address": "Cuyo 450",
      "buyer_x": 5727,
      "buyer_y": 7714,
      "created_at": "2026-06-28T18:30:26.932Z"
    },
    "assignedCourierIdx": -1,
    "genStatus": "CANCELLED_SUCCESSFULLY"
  },
  {
    "id": "bea0b457-6e48-4de5-a801-72bb0eeb4c17",
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
      "buyer_id": "mock_user_1782571161696_29",
      "buyer_name": "Usuario de Prueba 29",
      "buyer_phone": "+54 291 7524996",
      "buyer_address": "Villarino 200",
      "buyer_x": 5727,
      "buyer_y": 2429,
      "created_at": "2026-06-27T18:30:26.932Z"
    },
    "assignedCourierIdx": 0,
    "genStatus": "DELIVERY_FAILED"
  },
  {
    "id": "f8fe50ab-de36-4a87-a217-3f9a4a499814",
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
      "buyer_id": "mock_user_1782571195999_44",
      "buyer_name": "Usuario de Prueba 44",
      "buyer_phone": "+54 291 1135108",
      "buyer_address": "Cervantes 350",
      "buyer_x": 6818,
      "buyer_y": 8571,
      "created_at": "2026-06-24T18:30:26.932Z"
    },
    "assignedCourierIdx": 1,
    "genStatus": "DELIVERY_FAILED"
  },
  {
    "id": "7db30319-d01a-41f3-a7d3-3a7978b7b698",
    "order_id": "23c9d87f-d4b6-45d9-b842-bbbb92d3bc12",
    "status": "DELIVERY_FAILED",
    "color_code": "#10B981",
    "confirmation_code": "1562",
    "created_at": "2026-06-26T18:30:26.933Z",
    "updated_at": "2026-06-26T19:00:26.933Z",
    "snapshot": {
      "seller_id": "store_pizzeria_roma",
      "seller_name": "Pizzería Roma",
      "seller_address": "Alsina 300, Bahía Blanca",
      "seller_x": 4636,
      "seller_y": 3857,
      "buyer_id": "mock_user_1782571153709_25",
      "buyer_name": "Usuario de Prueba 25",
      "buyer_phone": "+54 291 8424781",
      "buyer_address": "Dorrego 250",
      "buyer_x": 7545,
      "buyer_y": 3714,
      "created_at": "2026-06-26T18:30:26.933Z"
    },
    "assignedCourierIdx": 2,
    "genStatus": "DELIVERY_FAILED"
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

    // Inserción de eventos históricos correspondientes
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
      // Generar algunos puntos de tracking
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
    "request_payload": "{\"order_id\":\"d941f369-7184-47e1-9b54-ee7dbb709aca\",\"seller_name\":\"Pizzería Roma\",\"buyer_name\":\"Usuario de Prueba 6\"}",
    "response_payload": "{\"success\":true,\"message\":\"Solicitud aceptada para asignación\"}",
    "status_code": 200,
    "created_at": "2026-06-27T18:30:26.930Z"
  },
  {
    "direction": "INBOUND",
    "endpoint": "/api/delivery-requests",
    "method": "POST",
    "request_payload": "{\"order_id\":\"e03edb3f-ff16-4c89-9fb0-7eff3998813b\",\"seller_name\":\"Farmacia del Centro\",\"buyer_name\":\"Usuario de Prueba 34\"}",
    "response_payload": "{\"success\":true,\"message\":\"Solicitud aceptada para asignación\"}",
    "status_code": 200,
    "created_at": "2026-06-25T18:30:26.930Z"
  },
  {
    "direction": "INBOUND",
    "endpoint": "/api/delivery-requests",
    "method": "POST",
    "request_payload": "{\"order_id\":\"98ff56d3-4829-47bf-9f2b-b3aecd6e9ce1\",\"seller_name\":\"Farmacia del Centro\",\"buyer_name\":\"Usuario de Prueba 44\"}",
    "response_payload": "{\"success\":true,\"message\":\"Solicitud aceptada para asignación\"}",
    "status_code": 200,
    "created_at": "2026-06-24T18:30:26.930Z"
  },
  {
    "direction": "INBOUND",
    "endpoint": "/api/delivery-requests",
    "method": "POST",
    "request_payload": "{\"order_id\":\"daebefcf-6414-49ca-9907-058c1dfb8fce\",\"seller_name\":\"Pizzería Roma\",\"buyer_name\":\"Usuario de Prueba 35\"}",
    "response_payload": "{\"success\":true,\"message\":\"Solicitud aceptada para asignación\"}",
    "status_code": 200,
    "created_at": "2026-06-25T18:30:26.930Z"
  },
  {
    "direction": "INBOUND",
    "endpoint": "/api/delivery-requests",
    "method": "POST",
    "request_payload": "{\"order_id\":\"6e1db3a9-fc17-4b57-ad7a-b6dba277eb98\",\"seller_name\":\"Pizzería Roma\",\"buyer_name\":\"Usuario de Prueba 35\"}",
    "response_payload": "{\"success\":true,\"message\":\"Solicitud aceptada para asignación\"}",
    "status_code": 200,
    "created_at": "2026-06-27T18:30:26.930Z"
  },
  {
    "direction": "INBOUND",
    "endpoint": "/api/delivery-requests",
    "method": "POST",
    "request_payload": "{\"order_id\":\"91953f50-7220-46f6-84ec-1372a39f5e91\",\"seller_name\":\"Farmacia del Centro\",\"buyer_name\":\"Usuario de Prueba 48\"}",
    "response_payload": "{\"success\":true,\"message\":\"Solicitud aceptada para asignación\"}",
    "status_code": 200,
    "created_at": "2026-06-25T18:30:26.930Z"
  },
  {
    "direction": "INBOUND",
    "endpoint": "/api/delivery-requests",
    "method": "POST",
    "request_payload": "{\"order_id\":\"518cc912-45fa-42e6-969f-ac5bf5c8b56e\",\"seller_name\":\"Librería Estudiantil\",\"buyer_name\":\"Usuario de Prueba 45\"}",
    "response_payload": "{\"success\":true,\"message\":\"Solicitud aceptada para asignación\"}",
    "status_code": 200,
    "created_at": "2026-06-26T18:30:26.930Z"
  },
  {
    "direction": "INBOUND",
    "endpoint": "/api/delivery-requests",
    "method": "POST",
    "request_payload": "{\"order_id\":\"cba684b5-f1c1-4ba2-b897-1f07d18c2363\",\"seller_name\":\"Super Todo\",\"buyer_name\":\"Usuario de Prueba 41\"}",
    "response_payload": "{\"success\":true,\"message\":\"Solicitud aceptada para asignación\"}",
    "status_code": 200,
    "created_at": "2026-06-27T18:30:26.930Z"
  },
  {
    "direction": "INBOUND",
    "endpoint": "/api/delivery-requests",
    "method": "POST",
    "request_payload": "{\"order_id\":\"619de708-2e9d-4b54-bd45-342908c9ace6\",\"seller_name\":\"Librería Estudiantil\",\"buyer_name\":\"Usuario de Prueba 50\"}",
    "response_payload": "{\"success\":true,\"message\":\"Solicitud aceptada para asignación\"}",
    "status_code": 200,
    "created_at": "2026-06-24T18:30:26.930Z"
  },
  {
    "direction": "INBOUND",
    "endpoint": "/api/delivery-requests",
    "method": "POST",
    "request_payload": "{\"order_id\":\"70d171e3-d938-43b1-aa14-45d316d598b7\",\"seller_name\":\"Pizzería Roma\",\"buyer_name\":\"Usuario de Prueba 37\"}",
    "response_payload": "{\"success\":true,\"message\":\"Solicitud aceptada para asignación\"}",
    "status_code": 200,
    "created_at": "2026-06-28T18:30:26.930Z"
  },
  {
    "direction": "INBOUND",
    "endpoint": "/api/delivery-requests",
    "method": "POST",
    "request_payload": "{\"order_id\":\"82dcbaea-0c2f-44ca-8284-582092de95dd\",\"seller_name\":\"Librería Estudiantil\",\"buyer_name\":\"Usuario de Prueba 4\"}",
    "response_payload": "{\"success\":true,\"message\":\"Solicitud aceptada para asignación\"}",
    "status_code": 200,
    "created_at": "2026-06-26T18:30:26.930Z"
  },
  {
    "direction": "INBOUND",
    "endpoint": "/api/delivery-requests",
    "method": "POST",
    "request_payload": "{\"order_id\":\"161f8133-449a-4df3-ab99-1ccf7eb1ab68\",\"seller_name\":\"TecnoSur\",\"buyer_name\":\"Usuario de Prueba 29\"}",
    "response_payload": "{\"success\":true,\"message\":\"Solicitud aceptada para asignación\"}",
    "status_code": 200,
    "created_at": "2026-06-25T18:30:26.930Z"
  },
  {
    "direction": "INBOUND",
    "endpoint": "/api/delivery-requests",
    "method": "POST",
    "request_payload": "{\"order_id\":\"f0170e83-be7d-4d91-ac8f-653513acc459\",\"seller_name\":\"TecnoSur\",\"buyer_name\":\"Usuario de Prueba 32\"}",
    "response_payload": "{\"success\":true,\"message\":\"Solicitud aceptada para asignación\"}",
    "status_code": 200,
    "created_at": "2026-06-24T18:30:26.930Z"
  },
  {
    "direction": "INBOUND",
    "endpoint": "/api/delivery-requests",
    "method": "POST",
    "request_payload": "{\"order_id\":\"1589a989-000d-44cd-acc0-49933fafd468\",\"seller_name\":\"Super Todo\",\"buyer_name\":\"Usuario de Prueba 19\"}",
    "response_payload": "{\"success\":true,\"message\":\"Solicitud aceptada para asignación\"}",
    "status_code": 200,
    "created_at": "2026-06-28T18:30:26.930Z"
  },
  {
    "direction": "INBOUND",
    "endpoint": "/api/delivery-requests",
    "method": "POST",
    "request_payload": "{\"order_id\":\"123fe899-d6a9-4d63-806c-0dcf5acf0caa\",\"seller_name\":\"Librería Estudiantil\",\"buyer_name\":\"Usuario de Prueba 39\"}",
    "response_payload": "{\"success\":true,\"message\":\"Solicitud aceptada para asignación\"}",
    "status_code": 200,
    "created_at": "2026-06-26T18:30:26.930Z"
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
