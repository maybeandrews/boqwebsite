import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkPrisma() {
    console.log("Available Prisma Models:", Object.keys(prisma)); // 🔍 Debugging Prisma models

    const model = await prisma.project.create({
        data: {
            name: "Test Project",
            description: "Testing Prisma",
            deadline: new Date(),
            tags: ["test1", "test2"]
        }
    });

    console.log(model);
}

checkPrisma()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
