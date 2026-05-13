import { prisma } from './prisma';

type LogDirection = 'INBOUND' | 'OUTBOUND';

export async function logApiTraffic({
  direction,
  endpoint,
  method,
  request_payload,
  response_payload,
  status_code,
}: {
  direction: LogDirection;
  endpoint: string;
  method: string;
  request_payload?: any;
  response_payload?: any;
  status_code: number;
}) {
  try {
    await prisma.travelerLog.create({
      data: {
        direction,
        endpoint,
        method,
        request_payload: request_payload || {},
        response_payload: response_payload || {},
        status_code,
      },
    });
  } catch (error) {
    console.error('Failed to log API traffic:', error);
  }
}
