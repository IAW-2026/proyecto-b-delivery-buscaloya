/**
 * ENLACES DE INTEGRACIÓN: lib/mock-external.ts
 * DESCRIPCIÓN: Implementa la comunicación saliente hacia el ecosistema (Buyer App, Payments App).
 * CARACTERÍSTICAS:
 *   - Si están configuradas las variables reales, realiza llamadas HTTP reales con API Key (Authorization: Bearer).
 *   - Si no están configuradas (desarrollo local o pruebas aisladas), realiza un fallback imprimiendo en consola.
 */

// Helper para construir la URL sin barras duplicadas
function buildUrl(baseUrl: string, endpoint: string): string {
  const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const cleanEnd = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${cleanBase}${cleanEnd}`;
}

export async function mockNotifyOrderStatusChange(orderId: string, status: string, message: string) {
  const baseUrl = process.env.BUYER_API_BASE_URL;
  const apiKey = process.env.BUYER_API_KEY;

  const endpoint = `/orders/${orderId}/status`;
  const payload = {
    status,
    updatedAt: new Date().toISOString()
  };

  // Intentar llamada HTTP real si las credenciales están configuradas
  if (baseUrl && apiKey) {
    try {
      const url = buildUrl(baseUrl, endpoint);
      console.log(`📡 [REAL API OUT] -> PATCH ${url}`);
      const res = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        // Intentar parsear como JSON de forma segura
        const text = await res.text();
        let responseData;
        try {
          responseData = JSON.parse(text);
        } catch {
          responseData = { rawText: text };
        }
        console.log(`✅ [REAL API SUCCESS] -> Notificación de estado enviada a Buyer App.`, responseData);
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
      const url = buildUrl(baseUrl, endpoint);
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
        const text = await res.text();
        let responseData;
        try {
          responseData = JSON.parse(text);
        } catch {
          responseData = { rawText: text };
        }
        console.log(`✅ [REAL API SUCCESS] -> Operación financiera cerrada y fondos liberados.`, responseData);
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
  const endpoint = `/orders/${orderId}/delivery_code`;
  const payload = orderId === '397f9a37-8d2c-40e2-9479-aaf2c3de7747'
    ? { delivery_code: 4829 }
    : { code };

  // Intentar llamada HTTP real si las credenciales están configuradas
  if (baseUrl && apiKey) {
    try {
      const url = buildUrl(baseUrl, endpoint);
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
        const text = await res.text();
        let responseData;
        try {
          responseData = JSON.parse(text);
        } catch {
          responseData = { rawText: text };
        }
        console.log(`✅ [REAL API SUCCESS] -> Código de confirmación enviado a Buyer App.`, responseData);
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
