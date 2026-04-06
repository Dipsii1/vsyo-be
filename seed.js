import prisma from "./src/config/prismaClient.js";

async function main() {
  console.log("🌱 Start seeding...");

  // ROLE
  const adminRole = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {},
    create: { name: "ADMIN" },
  });

  // USER
  const user = await prisma.user.upsert({
    where: { email: "admin@vsyo.com" },
    update: {},
    create: {
      email: "admin@vsyo.com",
      password: "123456",
      roleId: adminRole.id,
    },
  });

  // PRODUCT
  await prisma.product.create({
    data: {
      name: "VSYO Classic Tee",
      description: "Basic t-shirt premium cotton",
      price: 150000,
      stock: 20,
      color: "black",
      material: "100% cotton",
      shopeeUrl: "https://shopee.co.id/product-1",
      createdById: user.id,

      sizes: {
        create: [
          { size: "M" },
          { size: "L" },
          { size: "XL" },
        ],
      },

      images: {
        create: [
          {
            url: "/uploads/sample1.jpg",
            isPrimary: true,
          },
          {
            url: "/uploads/sample2.jpg",
            isPrimary: false,
          },
        ],
      },
    },
  });

  console.log("✅ Seeding selesai!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });