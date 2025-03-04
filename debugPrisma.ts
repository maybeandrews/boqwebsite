import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkPrisma() {
    const model = await prisma.project.create({
        data: {
            name: "Test Project",
            description: "Testing Prisma",
            deadline: new Date(),
            tags: ["test1", "test2"], // 👈 Add sample tags
            vendors: {}, // 👈 Might need adjustment based on VendorProject model
            quotes: {},  // 👈 Might need adjustment based on Quote model
            boqs: {}     // 👈 Might need adjustment based on BOQ model
        }
    });

    console.log(model);
}

checkPrisma()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
