import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create a matching User first for 1-1 relationship if needed
  const existingUser = await prisma.user.findUnique({
    where: { email: "jordan.test@vitstudent.ac.in" },
  });

  let user = existingUser;
  if (!user) {
    user = await prisma.user.create({
      data: {
        name: "Jordan Lee (Test)",
        email: "jordan.test@vitstudent.ac.in",
      },
    });
  }

  const existingJordan = await prisma.vITStudent.findFirst({
    where: { name: "Jordan Lee (Test)" },
  });

  if (!existingJordan) {
    const jordan = await prisma.vITStudent.create({
      data: {
        name: "Jordan Lee (Test)",
        regNo: "23BCE2045",
        year: 2,
        phone: "9123456780",
        gender: "MALE",
        residencyType: "DAYSCHOLAR",
        userId: user.id,
      },
    });
    console.log("Created Jordan Lee (Test) VIT student:", jordan);
  } else {
    console.log("Jordan Lee (Test) already exists:", existingJordan);
  }

  // Create another External student: "Morgan Taylor"
  const existingMorganUser = await prisma.user.findUnique({
    where: { email: "morgan.taylor.test@gmail.com" },
  });

  let morganUser = existingMorganUser;
  if (!morganUser) {
    morganUser = await prisma.user.create({
      data: {
        name: "Morgan Taylor (Test)",
        email: "morgan.taylor.test@gmail.com",
      },
    });
  }

  const existingMorgan = await prisma.externalStudent.findFirst({
    where: { name: "Morgan Taylor (Test)" },
  });

  if (!existingMorgan) {
    const morgan = await prisma.externalStudent.create({
      data: {
        name: "Morgan Taylor (Test)",
        phone: "9876543211",
        year: 3,
        collegeName: "BITS Pilani",
        email: "morgan.taylor.test@gmail.com",
        userId: morganUser.id,
      },
    });
    console.log("Created Morgan Taylor (Test) External student:", morgan);
  } else {
    console.log("Morgan Taylor (Test) already exists:", existingMorgan);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
