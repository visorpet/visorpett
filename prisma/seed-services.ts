import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const shop = await prisma.petShop.findFirst();
  if (!shop) return console.error("No petshop found");
  
  await prisma.service.upsert({
    where: { id: "cm85jxxxb00021xyzv1" },
    update: {},
    create: { id: "cm85jxxxb00021xyzv1", petShopId: shop.id, type: "banho", label: "Banho", price: 50, durationMin: 60, active: true }
  });
  await prisma.service.upsert({
    where: { id: "cm85jxxxc00031xyzv2" },
    update: {},
    create: { id: "cm85jxxxc00031xyzv2", petShopId: shop.id, type: "tosa", label: "Tosa Higiênica", price: 85, durationMin: 90, active: true }
  });
  console.log("Mock services created!");
}
main().finally(() => prisma.$disconnect());
