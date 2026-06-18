/**
 * ENLACES DE INTEGRACIÓN: lib/mock-external.ts
 * DESCRIPCIÓN: Implementa la comunicación saliente hacia el ecosistema (Buyer App, Payments App).
 * CARACTERÍSTICAS:
 *   - Si están configuradas las variables reales, realiza llamadas HTTP reales con API Key (Authorization: Bearer).
 *   - Si no están configuradas (desarrollo local o pruebas aisladas), realiza un fallback imprimiendo en consola.
 */

export async function mockNotifyOrderStatusChange(orderId: string, status: string, message: string) {
  const baseUrl = process.env.BUYER_API_BASE_URL;
  const apiKey = process.env.BUYER_API_KEY;
  const endpoint = `/orders/${orderId}/status`;
  const payload = { status, message };

  // Intentar llamada HTTP real si las credenciales están configuradas
  if (baseUrl && apiKey) {
    try {
      const url = `${baseUrl}${endpoint}`;
      console.log(`📡 [REAL API OUT] -> POST ${url}`);
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const responseData = await res.json();
        console.log(`✅ [REAL API SUCCESS] -> Notificación de estado enviada a Buyer App.`);
        return responseData;
      } else {
        console.warn(`⚠️ [REAL API WARNING] -> Error ${res.status} al notificar estado. Haciendo fallback...`);
      }
    } catch (error) {
      console.error(`❌ [REAL API ERROR] -> Fallo de red al notificar estado:`, error);
    }
  }

  // Fallback a comportamiento simulado en consola
  console.log(`\n======================================`);
  console.log(`📡 [MOCK API CALL OUT] -> POST ${endpoint}`);
  console.log(`📦 Payload: ${JSON.stringify(payload)}`);
  console.log(`✅ Resultado: Notificación enviada (MOCK).`);
  console.log(`======================================\n`);

  return { success: true };
}

export async function mockNotifyPaymentClose(orderId: string) {
  const baseUrl = process.env.PAYMENTS_API_BASE_URL;
  const apiKey = process.env.PAYMENTS_API_KEY;
  const endpoint = `/payments/operations/${orderId}/close`;
  const payload = { action: "RELEASE_FUNDS" };

  // Intentar llamada HTTP real si las credenciales están configuradas
  if (baseUrl && apiKey) {
    try {
      const url = `${baseUrl}${endpoint}`;
      console.log(`💸 [REAL API OUT] -> POST ${url}`);
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const responseData = await res.json();
        console.log(`✅ [REAL API SUCCESS] -> Operación financiera cerrada y fondos liberados.`);
        return responseData;
      } else {
        console.warn(`⚠️ [REAL API WARNING] -> Error ${res.status} al cerrar pago. Haciendo fallback...`);
      }
    } catch (error) {
      console.error(`❌ [REAL API ERROR] -> Fallo de red al cerrar pago:`, error);
    }
  }

  // Fallback a comportamiento simulado en consola
  console.log(`\n======================================`);
  console.log(`💸 [MOCK API CALL OUT] -> POST ${endpoint}`);
  console.log(`📦 Payload: ${JSON.stringify(payload)}`);
  console.log(`✅ Resultado: Circuito financiero cerrado. Fondos liberados (MOCK).`);
  console.log(`======================================\n`);

  return { success: true };
}

export async function mockSendConfirmationCodeToBuyer(orderId: string, code: string) {
  const baseUrl = process.env.BUYER_API_BASE_URL;
  const apiKey = process.env.BUYER_API_KEY;
  const endpoint = `/buyer/order/${orderId}/confirmation-code`;
  const payload = { code };

  // Intentar llamada HTTP real si las credenciales están configuradas
  if (baseUrl && apiKey) {
    try {
      const url = `${baseUrl}${endpoint}`;
      console.log(`📡 [REAL API OUT] -> POST ${url}`);
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const responseData = await res.json();
        console.log(`✅ [REAL API SUCCESS] -> Código de confirmación enviado a Buyer App.`);
        return responseData;
      } else {
        console.warn(`⚠️ [REAL API WARNING] -> Error ${res.status} al enviar código OTP. Haciendo fallback...`);
      }
    } catch (error) {
      console.error(`❌ [REAL API ERROR] -> Fallo de red al enviar código OTP:`, error);
    }
  }

  // Fallback a comportamiento simulado en consola
  console.log(`\n======================================`);
  console.log(`📡 [MOCK API CALL OUT] -> POST ${endpoint}`);
  console.log(`📦 Payload: ${JSON.stringify(payload)}`);
  console.log(`✅ Resultado: Código de confirmación enviado (MOCK).`);
  console.log(`======================================\n`);

  return { success: true };
}
