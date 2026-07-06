import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();
const prisma = new PrismaClient();

async function main() {
  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

  // 1. Create Admin (MANDATORY requirement)
  const adminEmail = process.env.ADMIN_EMAIL || "admin@fixitnow.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin123!";
  const adminName = process.env.ADMIN_NAME || "Super Admin";

  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);
    await prisma.user.create({
      data: {
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: "ADMIN",
      },
    });
    console.log(`✅ Admin created -> email: ${adminEmail} | password: ${adminPassword}`);
  } else {
    console.log("ℹ️  Admin already exists, skipping.");
  }

  // 2. Seed some default service categories
  const categories = ["Plumbing", "Electrical", "Cleaning", "Painting", "Carpentry", "AC Repair"];

  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name, description: `${name} related home services` },
    });
  }
  console.log(`✅ Seeded ${categories.length} service categories`);

  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
