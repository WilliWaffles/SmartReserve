// server/seed.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.reservation.deleteMany();
  await prisma.restaurant.deleteMany();

  const rs = await prisma.restaurant.createMany({
    data: [
      { name: "Bistró Central", address: "Av. Centro 123", phone: "555-111-222", capacity: 30 },
      { name: "La Terraza Verde", address: "Calle Jardín 45", phone: "555-222-333", capacity: 20 },
    ]
  });
  console.log("Seed OK:", rs);
}
main().finally(() => prisma.$disconnect());
