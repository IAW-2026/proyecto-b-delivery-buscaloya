/**
 * API ENDPOINT: POST /api/delivery-requests
 * DESCRIPCIÓN: Recibe y procesa nuevas solicitudes de envío enviadas por los comercios (Sellers) y crea la orden en estado ACCEPTED_FOR_ASSIGNMENT.
 * ROL EN EL ECOSISTEMA: Punto de entrada principal para que la App de Ventas (Seller) registre un envío cuando se concreta una compra.
 */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { mockSendConfirmationCodeToBuyer } from '@/lib/mock-external';

const deliverySchema = z.object({
  order_id: z.string().min(1, "Order ID requerido"),
  seller_id: z.string().min(1, "Seller ID requerido"),
  seller_name: z.string(),
  seller_address: z.string(),
  seller_x: z.number().optional(),
  seller_y: z.number().optional(),
  buyer_id: z.string(),
  buyer_name: z.string(),
  buyer_phone: z.string(),
  buyer_address: z.string(),
  buyer_x: z.number().optional(),
  buyer_y: z.number().optional(),
});

export async function POST(req: Request) {
  // Validación de API Key para llamadas entrantes si está configurada en el entorno
  const expectedApiKey = process.env.DELIVERY_API_KEY;
  if (expectedApiKey) {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Falta cabecera de autorización (Bearer Token)' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    if (token !== expectedApiKey) {
      return NextResponse.json({ error: 'API Key inválida o no autorizada' }, { status: 401 });
    }
  }

  let requestJson: any;
  try {
    requestJson = await req.json();
    const body = deliverySchema.parse(requestJson);

    // Si no vienen coordenadas, las inventamos dentro del rango seguro (500-9500)
    const sX = body.seller_x ?? (Math.floor(Math.random() * 9000) + 500);
    const sY = body.seller_y ?? (Math.floor(Math.random() * 9000) + 500);
    const bX = body.buyer_x ?? (Math.floor(Math.random() * 9000) + 500);
    const bY = body.buyer_y ?? (Math.floor(Math.random() * 9000) + 500);
    
    // Generar Código OTP de Confirmación aleatorio de 4 dígitos
    const confirmationCode = Math.floor(1000 + Math.random() * 9000).toString();

    const delivery = await prisma.delivery.create({
      data: {
        order_id: body.order_id,
        confirmation_code: confirmationCode,
        snapshot: {
          create: {
            seller_id: body.seller_id,
            seller_name: body.seller_name,
            seller_address: body.seller_address,
            seller_x: Math.max(500, Math.min(9500, Math.floor(sX))),
            seller_y: Math.max(500, Math.min(9500, Math.floor(sY))),
            buyer_id: body.buyer_id,
            buyer_name: body.buyer_name,
            buyer_phone: body.buyer_phone,
            buyer_address: body.buyer_address,
            buyer_x: Math.max(500, Math.min(9500, Math.floor(bX))),
            buyer_y: Math.max(500, Math.min(9500, Math.floor(bY))),
          }
        }
      }
    });

    // Simular el envío del código OTP a la Buyer App
    await mockSendConfirmationCodeToBuyer(body.order_id, confirmationCode);

    const response = NextResponse.json(delivery, { status: 201 });
    return response;
  } catch (error: any) {
    let statusCode = 500;
    let errorResponse: any = { error: error.message };

    if (error instanceof z.ZodError) {
      statusCode = 400;
      errorResponse = { error: error.issues };
    }

    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
