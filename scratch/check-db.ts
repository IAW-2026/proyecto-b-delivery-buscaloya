import { prisma } from '../lib/prisma';

async function main() {
  try {
    const count = await prisma.courier.count();
    console.log("✅ DATABASE CONNECTION SUCCESS! Courier count:", count);
  } catch (err: any) {
    console.error("❌ DATABASE CONNECTION ERROR:", err.message);
  }
}

main();
