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
