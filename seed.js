import prisma from "./src/config/prismaClient.js";
import bcrypt from "bcrypt";

async function main() {
  console.log("Mulai seeding...");

  // ==============================
  // 1. ROLE
  // ==============================
  const adminRole = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {},
    create: { name: "ADMIN" },
  });

  const userRole = await prisma.role.upsert({
    where: { name: "USER" },
    update: {},
    create: { name: "USER" },
  });

  console.log("Role berhasil dibuat");

  // ==============================
  // 2. USER
  // ==============================
  const hashedPassword = await bcrypt.hash("123456", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@gmail.com" },
    update: {},
    create: {
      email: "admin@gmail.com",
      password: hashedPassword,
      roleId: adminRole.id,
    },
  });

  const user = await prisma.user.upsert({
    where: { email: "user@gmail.com" },
    update: {},
    create: {
      email: "user@gmail.com",
      password: hashedPassword,
      roleId: userRole.id,
    },
  });

  console.log("User berhasil dibuat");

  // ==============================
  // 3. PRODUCT
  // ==============================
  await prisma.product.createMany({
    data: [
      {
        name: "Kaos Polos Hitam",
        description: "Bahan cotton premium",
        price: 50000,
        stock: 10,
        size: "L",
        color: "Hitam",
        material: "Cotton",
        shopeeUrl: "https://shopee.co.id/contoh1",
        createdById: admin.id,
      },
      {
        name: "Kaos Putih Oversize",
        description: "Nyaman dipakai",
        price: 75000,
        stock: 5,
        size: "XL",
        color: "Putih",
        material: "Combed 30s",
        shopeeUrl: "https://shopee.co.id/contoh2",
        createdById: admin.id,
      },
    ],
  });

  console.log("Product berhasil dibuat");
  console.log("Seeding selesai");
}

main()
  .catch((e) => {
    console.error("Error seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });