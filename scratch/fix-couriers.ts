import { prisma } from '../lib/prisma';

async function fixCouriers() {
  const BASE_LAT = -38.7196;
  const BASE_LON = -62.2724;

  const couriers = await prisma.courier.findMany({
    where: {
      OR: [
        { last_lat: null },
        { last_lon: null }
      ]
    }
  });

  console.log(`Fijando telemetría para ${couriers.length} unidades...`);

  for (const c of couriers) {
    await prisma.courier.update({
      where: { id: c.id },
      data: {
        last_lat: BASE_LAT + (Math.random() - 0.5) * 0.05,
        last_lon: BASE_LON + (Math.random() - 0.5) * 0.05,
      }
    });
    console.log(`UNIDAD [${c.name}] SINCRONIZADA EN RADAR.`);
  }

  console.log("PROCEDIMIENTO COMPLETADO.");
}

fixCouriers();
