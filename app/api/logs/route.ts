/**
 * API ENDPOINT: GET/DELETE /api/logs
 * DESCRIPCIÓN: Endpoint del sistema de auditoría Traveler's Log.
 *   - GET: Devuelve los últimos 20 registros de tráfico JSON (entrantes y salientes).
 *   - DELETE: Limpia todo el historial de logs de auditoría.
 */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const logs = await prisma.travelerLog.findMany({
      orderBy: { created_at: 'desc' },
      take: 20
    });
    return NextResponse.json(logs);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }
}
export async function DELETE() {
  try {
    await prisma.travelerLog.deleteMany();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to clear logs' }, { status: 500 });
  }
}
