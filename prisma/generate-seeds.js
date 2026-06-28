const fs = require('fs');
const path = require('path');

// Helper to generate UUIDs
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Bounding box for Bahía Blanca coordinates mapping to [1000, 9000]
function mapLngToX(lng) {
  const minLng = -62.276;
  const maxLng = -62.254;
  const x = ((lng - minLng) / (maxLng - minLng)) * 8000 + 1000;
  return Math.round(x);
}

function mapLatToY(lat) {
  const minLat = -38.728;
  const maxLat = -38.700;
  const y = ((lat - minLat) / (maxLat - minLat)) * 8000 + 1000;
  return Math.round(y);
}

function escapeSqlString(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/'/g, "''");
}

function main() {
  const buyerDataDir = path.join(__dirname, 'buyer-data');
  const sellerDataDir = path.join(__dirname, 'seller-data');
  const paymentDataDir = path.join(__dirname, 'payment-data');
  
  // Read baseline files
  const users = JSON.parse(fs.readFileSync(path.join(buyerDataDir, 'users.json'), 'utf8'));
  const addresses = JSON.parse(fs.readFileSync(path.join(buyerDataDir, 'addresses.json'), 'utf8'));
  const sellers = JSON.parse(fs.readFileSync(path.join(sellerDataDir, 'sellers.json'), 'utf8'));

  // Ensure output directory structure exists
  const outputDir = path.join(__dirname, 'seeds-ecosistema');
  fs.mkdirSync(path.join(outputDir, 'buyer'), { recursive: true });
  fs.mkdirSync(path.join(outputDir, 'seller'), { recursive: true });
  fs.mkdirSync(path.join(outputDir, 'payments'), { recursive: true });
  fs.mkdirSync(path.join(outputDir, 'delivery'), { recursive: true });

  console.log('Generating seed datasets...');

  // Generate ~40 consistent orders
  const orders = [];
  const statusOptions = ['payment_pending', 'paid_preparing', 'paid_assigned', 'paid_picked_up', 'paid_out', 'closed', 'cancelled', 'failed'];
  
  for (let i = 0; i < 45; i++) {
    const orderId = generateUUID();
    const purchaseId = generateUUID();
    
    // Pick random buyer and store
    const buyer = users[Math.floor(Math.random() * users.length)];
    const buyerAddressList = addresses.filter(a => a.client_id === buyer.client_id);
    const buyerAddress = buyerAddressList.length > 0 
      ? buyerAddressList[Math.floor(Math.random() * buyerAddressList.length)] 
      : { address_id: generateUUID(), title: 'Casa', street: 'Alsina 120', city: 'Bahía Blanca', lat: -38.7180, lng: -62.2660 };

    const store = sellers[Math.floor(Math.random() * sellers.length)];
    
    // Pick 1-3 random products from the store
    const numProducts = Math.floor(Math.random() * 3) + 1;
    const selectedProducts = [];
    const availableProducts = [...store.products];
    for (let p = 0; p < numProducts && availableProducts.length > 0; p++) {
      const idx = Math.floor(Math.random() * availableProducts.length);
      selectedProducts.push(availableProducts.splice(idx, 1)[0]);
    }

    const items = selectedProducts.map(p => ({
      product_id: p.id,
      name: p.name,
      quantity: Math.floor(Math.random() * 2) + 1,
      unit_price: p.price,
      seller_id: store.id
    }));

    const totalAmount = items.reduce((acc, curr) => acc + (curr.unit_price * curr.quantity), 0);
    const deliveryCost = Math.round(350 + Math.random() * 450);
    
    // Pick status with realistic distribution
    let statusIndex = 0;
    if (i < 5) statusIndex = 0; // payment_pending
    else if (i < 10) statusIndex = 1; // paid_preparing
    else if (i < 15) statusIndex = 2; // paid_assigned
    else if (i < 20) statusIndex = 3; // paid_picked_up
    else if (i < 25) statusIndex = 4; // paid_out
    else if (i < 38) statusIndex = 5; // closed (delivered)
    else if (i < 42) statusIndex = 6; // cancelled
    else statusIndex = 7; // failed

    const genStatus = statusOptions[statusIndex];

    // Status mapping table
    let paymentsStatus = 'paid';
    let buyerOrderStatus = 'PREPARING';
    let buyerPurchaseStatus = 'PAID';
    let deliveryStatus = 'ACCEPTED_FOR_ASSIGNMENT';

    if (genStatus === 'payment_pending') {
      paymentsStatus = 'payment_pending';
      buyerOrderStatus = 'PAYMENT_PENDING';
      buyerPurchaseStatus = 'PENDING';
      deliveryStatus = 'ACCEPTED_FOR_ASSIGNMENT';
    } else if (genStatus === 'paid_preparing') {
      paymentsStatus = 'paid';
      buyerOrderStatus = 'PREPARING';
      buyerPurchaseStatus = 'PAID';
      deliveryStatus = 'ACCEPTED_FOR_ASSIGNMENT';
    } else if (genStatus === 'paid_assigned') {
      paymentsStatus = 'paid';
      buyerOrderStatus = 'COURIER_ASSIGNED';
      buyerPurchaseStatus = 'PAID';
      deliveryStatus = 'COURIER_ASSIGNED';
    } else if (genStatus === 'paid_picked_up') {
      paymentsStatus = 'paid';
      buyerOrderStatus = 'PICKED_UP';
      buyerPurchaseStatus = 'PAID';
      deliveryStatus = 'PICKED_UP';
    } else if (genStatus === 'paid_out') {
      paymentsStatus = 'paid';
      buyerOrderStatus = 'OUT_FOR_DELIVERY';
      buyerPurchaseStatus = 'PAID';
      deliveryStatus = 'OUT_FOR_DELIVERY';
    } else if (genStatus === 'closed') {
      paymentsStatus = 'closed';
      buyerOrderStatus = 'DELIVERED';
      buyerPurchaseStatus = 'COMPLETED';
      deliveryStatus = 'DELIVERED';
    } else if (genStatus === 'cancelled') {
      paymentsStatus = 'cancelled';
      buyerOrderStatus = 'CANCELLED';
      buyerPurchaseStatus = 'CANCELLED';
      deliveryStatus = 'CANCELLED_SUCCESSFULLY';
    } else if (genStatus === 'failed') {
      paymentsStatus = 'failed';
      buyerOrderStatus = 'DELIVERY_FAILED';
      buyerPurchaseStatus = 'PAID';
      deliveryStatus = 'DELIVERY_FAILED';
    }

    const createdOffset = Math.floor(Math.random() * 5) * 86400 * 1000; // up to 5 days ago
    const createdAt = new Date(Date.now() - createdOffset);
    const updatedAt = new Date(createdAt.getTime() + 1800 * 1000); // 30 mins later
    const deliveryCode = Math.floor(1000 + Math.random() * 9000);

    orders.push({
      orderId,
      purchaseId,
      buyer,
      buyerAddress,
      store,
      items,
      totalAmount,
      deliveryCost,
      paymentsStatus,
      buyerOrderStatus,
      buyerPurchaseStatus,
      deliveryStatus,
      deliveryCode,
      createdAt,
      updatedAt
    });
  }

  // 1. GENERATE BUYER SQL SEED
  console.log('Generating Buyer seed SQL...');
  let buyerSql = '-- SEED PARA BASE DE DATOS BUYER\n';
  buyerSql += 'TRUNCATE TABLE order_items CASCADE;\n';
  buyerSql += 'TRUNCATE TABLE orders CASCADE;\n';
  buyerSql += 'TRUNCATE TABLE purchases CASCADE;\n';
  buyerSql += 'TRUNCATE TABLE addresses CASCADE;\n';
  buyerSql += 'TRUNCATE TABLE users CASCADE;\n';
  buyerSql += 'TRUNCATE TABLE user_logs CASCADE;\n\n';

  // Seed Users
  buyerSql += '-- INSERTING USERS\n';
  for (const user of users) {
    buyerSql += `INSERT INTO users (client_id, name, email, phone, role, created_at) VALUES ('${user.client_id}', '${escapeSqlString(user.name)}', '${user.email}', '${user.phone || ''}', '${user.role}', '${user.created_at}') ON CONFLICT (client_id) DO NOTHING;\n`;
  }

  // Seed Addresses
  buyerSql += '\n-- INSERTING ADDRESSES\n';
  for (const addr of addresses) {
    buyerSql += `INSERT INTO addresses (address_id, client_id, title, street, city, lat, lng) VALUES ('${addr.address_id}', '${addr.client_id}', '${escapeSqlString(addr.title)}', '${escapeSqlString(addr.street)}', '${escapeSqlString(addr.city)}', ${addr.lat}, ${addr.lng}) ON CONFLICT (address_id) DO NOTHING;\n`;
  }

  // Seed Purchases, Orders, and Order Items
  buyerSql += '\n-- INSERTING PURCHASES, ORDERS & ITEMS\n';
  for (const o of orders) {
    buyerSql += `INSERT INTO purchases (purchase_id, client_id, address_id, amount, status, created_at) VALUES ('${o.purchaseId}', '${o.buyer.client_id}', '${o.buyerAddress.address_id}', ${o.totalAmount + o.deliveryCost}, '${o.buyerPurchaseStatus}', '${o.createdAt.toISOString()}');\n`;
    buyerSql += `INSERT INTO orders (order_id, purchase_id, store_name, status, delivery_code, created_at) VALUES ('${o.orderId}', '${o.purchaseId}', '${escapeSqlString(o.store.name)}', '${o.buyerOrderStatus}', ${o.deliveryCode}, '${o.createdAt.toISOString()}');\n`;
    for (const item of o.items) {
      buyerSql += `INSERT INTO order_items (order_id, product_name, quantity) VALUES ('${o.orderId}', '${escapeSqlString(item.name)}', ${item.quantity});\n`;
    }
  }

  // Seed User Logs
  buyerSql += '\n-- INSERTING USER LOGS\n';
  const logs = JSON.parse(fs.readFileSync(path.join(buyerDataDir, 'user_logs.json'), 'utf8'));
  for (const log of logs.slice(0, 150)) { // limit logs to first 150 for reasonable seed size
    buyerSql += `INSERT INTO user_logs (client_id, login_time) VALUES ('${log.client_id}', '${log.login_time}');\n`;
  }
  fs.writeFileSync(path.join(outputDir, 'buyer', 'seed.sql'), buyerSql, 'utf8');

  // 2. GENERATE SELLER SQL SEED
  console.log('Generating Seller seed SQL...');
  let sellerSql = '-- SEED PARA BASE DE DATOS SELLER\n';
  sellerSql += 'TRUNCATE TABLE products CASCADE;\n';
  sellerSql += 'TRUNCATE TABLE stores CASCADE;\n\n';

  sellerSql += '-- INSERTING STORES\n';
  for (const store of sellers) {
    sellerSql += `INSERT INTO stores (id, name, email, category, image_url, address, lat, lng) VALUES ('${store.id}', '${escapeSqlString(store.name)}', '${store.email}', '${escapeSqlString(store.category)}', '${store.image_url}', '${escapeSqlString(store.address)}', ${store.lat}, ${store.lng}) ON CONFLICT (id) DO NOTHING;\n`;
  }

  sellerSql += '\n-- INSERTING PRODUCTS\n';
  for (const store of sellers) {
    for (const prod of store.products) {
      sellerSql += `INSERT INTO products (id, store_id, name, price, stock, description, image_url) VALUES ('${prod.id}', '${store.id}', '${escapeSqlString(prod.name)}', ${prod.price}, ${prod.stock}, '${escapeSqlString(prod.description)}', '${prod.image_url}') ON CONFLICT (id) DO NOTHING;\n`;
    }
  }
  fs.writeFileSync(path.join(outputDir, 'seller', 'seed.sql'), sellerSql, 'utf8');

  // 3. GENERATE PAYMENTS SQL SEED
  console.log('Generating Payments seed SQL...');
  let paymentsSql = '-- SEED PARA BASE DE DATOS PAYMENTS\n';
  paymentsSql += 'TRUNCATE TABLE public.orders CASCADE;\n\n';

  paymentsSql += '-- INSERTING PAYMENTS TRANSACTIONS\n';
  for (const o of orders) {
    const itemsSnapshot = JSON.stringify(o.items);
    const addressSnapshot = JSON.stringify({
      street: o.buyerAddress.street,
      city: o.buyerAddress.city,
      lat: o.buyerAddress.lat,
      lng: o.buyerAddress.lng
    });
    const quoteSnapshot = JSON.stringify({
      cost: o.deliveryCost,
      quote_id: 'quo_' + o.orderId.substring(0, 8),
      estimated_minutes: Math.round(15 + Math.random() * 25)
    });

    const prefId = 'pref_' + o.orderId.substring(0, 8);
    const payId = o.paymentsStatus === 'paid' || o.paymentsStatus === 'closed' ? String(Math.floor(1000000000 + Math.random() * 9000000000)) : 'NULL';

    paymentsSql += `INSERT INTO public.orders (order_id, buyer_id, store_id, status, total_amount, delivery_cost, mp_preference_id, mp_payment_id, items_snapshot, delivery_address_snapshot, delivery_quote_snapshot, created_at, updated_at) VALUES ('${o.orderId}', '${o.buyer.client_id}', '${o.store.id}', '${o.paymentsStatus}', ${o.totalAmount}, ${o.deliveryCost}, '${prefId}', ${payId === 'NULL' ? 'NULL' : `'${payId}'`}, '${escapeSqlString(itemsSnapshot)}', '${escapeSqlString(addressSnapshot)}', '${escapeSqlString(quoteSnapshot)}', '${o.createdAt.toISOString()}', '${o.updatedAt.toISOString()}');\n`;
  }
  fs.writeFileSync(path.join(outputDir, 'payments', 'seed.sql'), paymentsSql, 'utf8');

  // 4. GENERATE DELIVERY TS SEED (Prisma)
  console.log('Generating Delivery Prisma seed.ts...');
  
  // Format consistent deliveries as JS objects for inlining in seed.ts
  const deliveryData = [];
  const courierAssignments = [];
  const statusEvents = [];
  const trackingPoints = [];

  // Couriers list mapping (c1 to c6)
  const couriersInfo = [
    { name: 'DRON FENIX-01', phone: '+54 291 555-0101', vehicle: 'Drone', status: 'AVAILABLE', last_x: 2500, last_y: 2800 },
    { name: 'DRON CENTINELA-02', phone: '+54 291 555-0102', vehicle: 'Drone', status: 'ASSIGNED', last_x: 7500, last_y: 4200 },
    { name: 'MOTO HALCON-03', phone: '+54 291 555-0103', vehicle: 'Moto', status: 'ASSIGNED', last_x: 5000, last_y: 5000 },
    { name: 'BICI ECO-04', phone: '+54 291 555-0104', vehicle: 'Bicicleta', status: 'OFFLINE', last_x: 4800, last_y: 6100 },
    { name: 'DRON RAPTOR-05', phone: '+54 291 555-0105', vehicle: 'Drone', status: 'OFFLINE', last_x: 1200, last_y: 8900 },
    { name: 'DRON VIPER-06', phone: '+54 291 555-0106', vehicle: 'Drone', status: 'AVAILABLE', last_x: 8200, last_y: 1900 }
  ];

  // Map each order to Prisma inserts
  orders.forEach((o, index) => {
    // Determine target courier if assigned or in transit
    let assignedCourierIdx = -1;
    if (o.deliveryStatus !== 'ACCEPTED_FOR_ASSIGNMENT' && o.deliveryStatus !== 'CANCELLED_SUCCESSFULLY') {
      assignedCourierIdx = index % 3; // Fenice, Centinela or Halcon
    }

    deliveryData.push({
      id: generateUUID(),
      order_id: o.orderId,
      status: o.deliveryStatus,
      color_code: index % 2 === 0 ? '#10B981' : '#3B82F6',
      confirmation_code: String(o.deliveryCode),
      created_at: o.createdAt.toISOString(),
      updated_at: o.updatedAt.toISOString(),
      snapshot: {
        seller_id: o.store.id,
        seller_name: o.store.name,
        seller_address: o.store.address,
        seller_x: mapLngToX(o.store.lng),
        seller_y: mapLatToY(o.store.lat),
        buyer_id: o.buyer.client_id,
        buyer_name: o.buyer.name,
        buyer_phone: o.buyer.phone || '+54 291 111-2222',
        buyer_address: o.buyerAddress.street,
        buyer_x: mapLngToX(o.buyerAddress.lng),
        buyer_y: mapLatToY(o.buyerAddress.lat),
        created_at: o.createdAt.toISOString()
      },
      assignedCourierIdx,
      genStatus: o.deliveryStatus
    });
  });

  // Generate traveler logs
  const travelerLogs = [];
  deliveryData.slice(0, 15).forEach((d) => {
    travelerLogs.push({
      direction: 'INBOUND',
      endpoint: '/api/delivery-requests',
      method: 'POST',
      request_payload: JSON.stringify({ order_id: d.order_id, seller_name: d.snapshot.seller_name, buyer_name: d.snapshot.buyer_name }),
      response_payload: JSON.stringify({ success: true, message: 'Solicitud aceptada para asignación' }),
      status_code: 200,
      created_at: d.created_at
    });
  });

  // Write TS file
  let tsCode = `import { DeliveryStatus, AvailabilityStatus, AssignmentStatus, EventSource, TrackingSource } from '@prisma/client'\n`;
  tsCode += `import 'dotenv/config'\n`;
  tsCode += `import { prisma } from '../lib/prisma'\n\n`;
  
  tsCode += `// Función auxiliar para buscar el Clerk ID del usuario ficticio\n`;
  tsCode += `async function getClerkUserIdByEmail(email: string): Promise<string | null> {\n`;
  tsCode += `  const secretKey = process.env.CLERK_SECRET_KEY;\n`;
  tsCode += `  if (!secretKey) return null;\n`;
  tsCode += `  try {\n`;
  tsCode += `    const res = await fetch(\`https://api.clerk.com/v1/users?email_address=\${encodeURIComponent(email)}\`, {\n`;
  tsCode += `      headers: {\n`;
  tsCode += `        'Authorization': \`Bearer \${secretKey}\`,\n`;
  tsCode += `        'Content-Type': 'application/json'\n`;
  tsCode += `      }\n`;
  tsCode += `    });\n`;
  tsCode += `    if (res.ok) {\n`;
  tsCode += `      const users = await res.json() as any[];\n`;
  tsCode += `      if (users && users.length > 0) return users[0].id;\n`;
  tsCode += `    }\n`;
  tsCode += `  } catch (e) {}\n`;
  tsCode += `  return null;\n`;
  tsCode += `}\n\n`;

  tsCode += `async function main() {\n`;
  tsCode += `  console.log('⚡ LIMPIANDO BASE DE DATOS DE DRONES...');\n`;
  tsCode += `  await prisma.travelerLog.deleteMany();\n`;
  tsCode += `  await prisma.deliveryTrackingPoint.deleteMany();\n`;
  tsCode += `  await prisma.deliveryStatusEvent.deleteMany();\n`;
  tsCode += `  await prisma.deliveryAssignment.deleteMany();\n`;
  tsCode += `  await prisma.deliveryContextSnapshot.deleteMany();\n`;
  tsCode += `  await prisma.delivery.deleteMany();\n`;
  tsCode += `  await prisma.courier.deleteMany();\n\n`;

  tsCode += `  console.log('🛰 CREANDO COURIERS E INICIALIZANDO CLERK...');\n`;
  tsCode += `  const deliveryClerkId = await getClerkUserIdByEmail('delivery+clerk_test@iaw.com');\n`;
  tsCode += `  const adminClerkId = await getClerkUserIdByEmail('admin+clerk_test@iaw.com');\n\n`;

  // Create couriers JS code
  tsCode += `  const couriersData = ${JSON.stringify(couriersInfo, null, 2)};\n`;
  tsCode += `  const couriers = [];\n`;
  tsCode += `  for (const c of couriersData) {\n`;
  tsCode += `    const clerk_id = c.name.includes('FENIX') || c.name.includes('CENTINELA') || c.name.includes('HALCON') ? deliveryClerkId : adminClerkId;\n`;
  tsCode += `    const dbCourier = await prisma.courier.create({\n`;
  tsCode += `      data: {\n`;
  tsCode += `        name: c.name,\n`;
  tsCode += `        phone: c.phone,\n`;
  tsCode += `        vehicle_type: c.vehicle,\n`;
  tsCode += `        status: AvailabilityStatus[c.status],\n`;
  tsCode += `        last_x: c.last_x,\n`;
  tsCode += `        last_y: c.last_y,\n`;
  tsCode += `        clerk_id: clerk_id || null\n`;
  tsCode += `      }\n`;
  tsCode += `    });\n`;
  tsCode += `    couriers.push(dbCourier);\n`;
  tsCode += `  }\n\n`;

  tsCode += `  console.log('📦 CREANDO ENTREGAS Y HISTORIALES COHERENTES...');\n`;
  
  // Create deliveries JS code inline
  tsCode += `  const deliveries = ${JSON.stringify(deliveryData, null, 2)};\n`;
  tsCode += `  for (const d of deliveries) {\n`;
  tsCode += `    const dbDelivery = await prisma.delivery.create({\n`;
  tsCode += `      data: {\n`;
  tsCode += `        id: d.id,\n`;
  tsCode += `        order_id: d.order_id,\n`;
  tsCode += `        status: DeliveryStatus[d.genStatus],\n`;
  tsCode += `        color_code: d.color_code,\n`;
  tsCode += `        confirmation_code: d.confirmation_code,\n`;
  tsCode += `        created_at: new Date(d.created_at),\n`;
  tsCode += `        updated_at: new Date(d.updated_at),\n`;
  tsCode += `        snapshot: {\n`;
  tsCode += `          create: {\n`;
  tsCode += `            seller_id: d.snapshot.seller_id,\n`;
  tsCode += `            seller_name: d.snapshot.seller_name,\n`;
  tsCode += `            seller_address: d.snapshot.seller_address,\n`;
  tsCode += `            seller_x: d.snapshot.seller_x,\n`;
  tsCode += `            seller_y: d.snapshot.seller_y,\n`;
  tsCode += `            buyer_id: d.snapshot.buyer_id,\n`;
  tsCode += `            buyer_name: d.snapshot.buyer_name,\n`;
  tsCode += `            buyer_phone: d.snapshot.buyer_phone,\n`;
  tsCode += `            buyer_address: d.snapshot.buyer_address,\n`;
  tsCode += `            buyer_x: d.snapshot.buyer_x,\n`;
  tsCode += `            buyer_y: d.snapshot.buyer_y,\n`;
  tsCode += `            created_at: new Date(d.snapshot.created_at)\n`;
  tsCode += `          }\n`;
  tsCode += `        }\n`;
  tsCode += `      }\n`;
  tsCode += `    });\n\n`;

  // Status-based creation of assignments and events inside the loop
  tsCode += `    // Inserción de eventos históricos correspondientes\n`;
  tsCode += `    const events = [];\n`;
  tsCode += `    events.push({\n`;
  tsCode += `      delivery_id: dbDelivery.id,\n`;
  tsCode += `      status: DeliveryStatus.ACCEPTED_FOR_ASSIGNMENT,\n`;
  tsCode += `      source: EventSource.PAYMENTS,\n`;
  tsCode += `      reason: 'Pago verificado, solicitando drones.'\n`;
  tsCode += `    });\n\n`;

  tsCode += `    if (d.assignedCourierIdx !== -1) {\n`;
  tsCode += `      const courier = couriers[d.assignedCourierIdx];\n`;
  tsCode += `      await prisma.deliveryAssignment.create({\n`;
  tsCode += `        data: {\n`;
  tsCode += `          delivery_id: dbDelivery.id,\n`;
  tsCode += `          courier_id: courier.id,\n`;
  tsCode += `          status: AssignmentStatus.ASSIGNED\n`;
  tsCode += `        }\n`;
  tsCode += `      });\n`;
  tsCode += `      events.push({\n`;
  tsCode += `        delivery_id: dbDelivery.id,\n`;
  tsCode += `        status: DeliveryStatus.COURIER_ASSIGNED,\n`;
  tsCode += `        source: EventSource.SYSTEM,\n`;
  tsCode += `        reason: \`Courier \${courier.name} asignado automáticamente.\`\n`;
  tsCode += `      });\n`;
  tsCode += `    }\n\n`;

  tsCode += `    if (d.genStatus === 'PICKED_UP' || d.genStatus === 'OUT_FOR_DELIVERY' || d.genStatus === 'DELIVERED') {\n`;
  tsCode += `      events.push({\n`;
  tsCode += `        delivery_id: dbDelivery.id,\n`;
  tsCode += `        status: DeliveryStatus.PICKED_UP,\n`;
  tsCode += `        source: EventSource.DELIVERY,\n`;
  tsCode += `        reason: 'Pedido retirado del local comercial.'\n`;
  tsCode += `      });\n`;
  tsCode += `    }\n\n`;

  tsCode += `    if (d.genStatus === 'OUT_FOR_DELIVERY' || d.genStatus === 'DELIVERED') {\n`;
  tsCode += `      events.push({\n`;
  tsCode += `        delivery_id: dbDelivery.id,\n`;
  tsCode += `        status: DeliveryStatus.OUT_FOR_DELIVERY,\n`;
  tsCode += `        source: EventSource.DELIVERY,\n`;
  tsCode += `        reason: 'Dron despegó, rumbo trazado a destino.'\n`;
  tsCode += `      });\n`;
  tsCode += `      // Generar algunos puntos de tracking\n`;
  tsCode += `      await prisma.deliveryTrackingPoint.createMany({\n`;
  tsCode += `        data: [\n`;
  tsCode += `          { delivery_id: dbDelivery.id, lat: -38.7180, lon: -62.2660, source: TrackingSource.SYSTEM },\n`;
  tsCode += `          { delivery_id: dbDelivery.id, lat: -38.7150, lon: -62.2640, source: TrackingSource.COURIER_APP }\n`;
  tsCode += `        ]\n`;
  tsCode += `      });\n`;
  tsCode += `    }\n\n`;

  tsCode += `    if (d.genStatus === 'DELIVERED') {\n`;
  tsCode += `      events.push({\n`;
  tsCode += `        delivery_id: dbDelivery.id,\n`;
  tsCode += `        status: DeliveryStatus.DELIVERED,\n`;
  tsCode += `        source: EventSource.SYSTEM,\n`;
  tsCode += `        reason: 'Entrega confirmada vía código OTP.'\n`;
  tsCode += `      });\n`;
  tsCode += `    } else if (d.genStatus === 'CANCELLED_SUCCESSFULLY') {\n`;
  tsCode += `      events.push({\n`;
  tsCode += `        delivery_id: dbDelivery.id,\n`;
  tsCode += `        status: DeliveryStatus.CANCELLED_SUCCESSFULLY,\n`;
  tsCode += `        source: EventSource.BUYER,\n`;
  tsCode += `        reason: 'El cliente canceló la orden antes de despacho.'\n`;
  tsCode += `      });\n`;
  tsCode += `    } else if (d.genStatus === 'DELIVERY_FAILED') {\n`;
  tsCode += `      events.push({\n`;
  tsCode += `        delivery_id: dbDelivery.id,\n`;
  tsCode += `        status: DeliveryStatus.DELIVERY_FAILED,\n`;
  tsCode += `        source: EventSource.SYSTEM,\n`;
  tsCode += `        reason: 'Batería insuficiente o cliente ausente. Dron regresa a base.'\n`;
  tsCode += `      });\n`;
  tsCode += `    }\n\n`;

  tsCode += `    await prisma.deliveryStatusEvent.createMany({ data: events });\n`;
  tsCode += `  }\n\n`;

  // Traveler logs DML
  tsCode += `  console.log('🖥 INICIALIZANDO BITÁCORAS TRAVELERLOG...');\n`;
  tsCode += `  await prisma.travelerLog.createMany({\n`;
  tsCode += `    data: ${JSON.stringify(travelerLogs, null, 2)}.map(log => ({\n`;
  tsCode += `      ...log,\n`;
  tsCode += `      request_payload: JSON.parse(log.request_payload),\n`;
  tsCode += `      response_payload: JSON.parse(log.response_payload),\n`;
  tsCode += `      created_at: new Date(log.created_at)\n`;
  tsCode += `    }))\n`;
  tsCode += `  });\n\n`;

  tsCode += `  console.log('🎉 ECOSISTEMA DE DELIVERY SEEDEADO CON CONSISTENCIA!');\n`;
  tsCode += `}\n\n`;

  tsCode += `main()\n`;
  tsCode += `  .catch((e) => {\n`;
  tsCode += `    console.error(e);\n`;
  tsCode += `    process.exit(1);\n`;
  tsCode += `  })\n`;
  tsCode += `  .finally(async () => {\n`;
  tsCode += `    await prisma.$disconnect();\n`;
  tsCode += `  });\n`;

  fs.writeFileSync(path.join(outputDir, 'delivery', 'seed.ts'), tsCode, 'utf8');
  
  // Also replace the official seed.ts in prisma
  fs.writeFileSync(path.join(__dirname, 'seed.ts'), tsCode, 'utf8');

  console.log('All seed scripts generated successfully in folder "seeds-ecosistema" and delivery seed updated!');
}

main();
