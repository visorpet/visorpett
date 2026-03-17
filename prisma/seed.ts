import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Password for all users
  const passwordHash = await bcrypt.hash("123456", 10);

  // 1. Super Admin
  const admin = await prisma.user.upsert({
    where: { email: "admin@visorpet.app" },
    update: {},
    create: {
      name: "Admin Visorpet",
      email: "admin@visorpet.app",
      role: "SUPER_ADMIN",
      passwordHash,
    },
  });

  // 2. Pet Shop Owner
  const owner = await prisma.user.upsert({
    where: { email: "dono@petlove.br" },
    update: {},
    create: {
      name: "Dono Pet Shop",
      email: "dono@petlove.br",
      role: "DONO",
      passwordHash,
    },
  });

  const petShop = await prisma.petShop.upsert({
    where: { ownerId: owner.id },
    update: {},
    create: {
      name: "PetLove Moema",
      slug: "petlove-moema",
      ownerId: owner.id,
      city: "São Paulo",
      state: "SP",
    },
  });

  // Services
  await prisma.service.upsert({
    where: { id: "clv1xyz_banho" },
    update: {},
    create: {
      id: "clv1xyz_banho",
      petShopId: petShop.id,
      type: "banho",
      label: "Banho Simples",
      price: 50,
      durationMin: 60,
    }
  });

  await prisma.service.upsert({
    where: { id: "clv1xyz_tosa" },
    update: {},
    create: {
      id: "clv1xyz_tosa",
      petShopId: petShop.id,
      type: "tosa",
      label: "Tosa Higiênica",
      price: 85,
      durationMin: 90,
    }
  });

  // 3. Client
  const clientUser = await prisma.user.upsert({
    where: { email: "cliente@email.com" },
    update: {},
    create: {
      name: "João Cliente",
      email: "cliente@email.com",
      role: "CLIENTE",
      passwordHash,
    },
  });

  const client = await prisma.client.upsert({
    where: { id: "client-test" },
    update: {},
    create: {
      id: "client-test",
      name: "João Cliente",
      email: "cliente@email.com",
      phone: "11999999999",
      userId: clientUser.id,
      petShopId: petShop.id,
    },
  });

  console.log("Seeding done:", { admin: admin.email, owner: owner.email, client: clientUser.email });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
