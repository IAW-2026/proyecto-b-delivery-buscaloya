/**
 * MOCKS DE INTEGRACIÓN: lib/mock-external.ts
 * DESCRIPCIÓN: Implementa la simulación de llamadas salientes (outbound) hacia el ecosistema de aplicaciones (Seller App, Buyer App, Payments App).
 * CARACTERÍSTICAS:
 *   - Permite cumplir con el requisito obligatorio de aislamiento en la Etapa 2 de desarrollo individual.
 *   - Simula las llamadas salientes e interactúa con `logApiTraffic` para registrar la auditoría de salidas en producción.
 */
import { logApiTraffic } from './traveler-logger';

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

export async function mockSendConfirmationCodeToBuyer(orderId: string, code: string) {
  const endpoint = `/buyer/order/${orderId}/confirmation-code`;
  const payload = { code };
  const response = { success: true };

  console.log(`\n======================================`);
  console.log(`📡 [MOCK API CALL OUT] -> POST ${endpoint}`);
  console.log(`📦 Payload: ${JSON.stringify(payload)}`);
  console.log(`✅ Resultado: Código de confirmación enviado a Buyer App.`);
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
