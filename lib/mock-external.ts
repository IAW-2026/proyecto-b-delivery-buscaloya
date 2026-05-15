import { logApiTraffic } from './traveler-logger';

// Mocks de las APIs de otras webapps (Seller, Buyer, Payment)
// Requerimiento para aislamiento en Etapa 2.

export async function mockNotifyOrderStatusChange(orderId: string, status: string, message: string) {
  const endpoint = `/orders/${orderId}/status`;
  const payload = { status, message };
  const response = { success: true };

  console.log(`\n======================================`);
  console.log(`📡 [MOCK API CALL OUT] -> POST ${endpoint}`);
  console.log(`📦 Payload: ${JSON.stringify(payload)}`);
  console.log(`✅ Resultado: Notificación enviada a Buyer/Seller App.`);
  console.log(`======================================\n`);

  await logApiTraffic({
    direction: 'OUTBOUND',
    endpoint,
    method: 'POST',
    request_payload: payload,
    response_payload: response,
    status_code: 200
  });

  return response;
}

export async function mockNotifyPaymentClose(orderId: string) {
  const endpoint = `/payments/operations/${orderId}/close`;
  const payload = { action: "RELEASE_FUNDS" };
  const response = { success: true };

  console.log(`\n======================================`);
  console.log(`💸 [MOCK API CALL OUT] -> POST ${endpoint}`);
  console.log(`📦 Payload: ${JSON.stringify(payload)}`);
  console.log(`✅ Resultado: Circuito financiero cerrado. Fondos liberados.`);
  console.log(`======================================\n`);

  await logApiTraffic({
    direction: 'OUTBOUND',
    endpoint,
    method: 'POST',
    request_payload: payload,
    response_payload: response,
    status_code: 200
  });

  return response;
}
