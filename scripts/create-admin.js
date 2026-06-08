const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash("admin123456", 10);
  const admin = await prisma.admin.create({
    data: {
      name: "Admin",
      email: "admin@num.edu.kh",
      password: hash,
    },
  });
  console.log("✅ Admin created!", admin.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());