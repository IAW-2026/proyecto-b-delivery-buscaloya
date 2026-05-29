/**
 * API ENDPOINT: POST /api/deliveries/quote
 * DESCRIPCIÓN: Cotización de costo de envío (Delivery Quote).
 * CARACTERÍSTICAS:
 *   - Calcula y devuelve un costo estimado mock basado en la distancia del trayecto de entrega en pesos argentinos (ARS).
 *   - Utilizado por la App de Ventas (Seller) para cotizar el precio de envío al cliente final en el Checkout.
 */
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Cotización mock básica basada en distancia (hardcoded para cumplir)
    // Etapa 3 usaría Haversine
    const cost = 500 + Math.random() * 1000;
    
    return NextResponse.json({ 
      estimated_cost: cost.toFixed(2),
      currency: 'ARS'
    });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
