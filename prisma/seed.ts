// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
    // Check if admin already exists
    const existingAdmin = await prisma.vendor.findUnique({
        where: { username: "admin" },
    });

    if (!existingAdmin) {
        // Hash the admin password
        const hashedPassword = await bcrypt.hash("admin1234", 10);

        // Create admin user
        await prisma.vendor.create({
            data: {
                name: "Administrator",
                contact: "admin@example.com",
                username: "admin",
                password: hashedPassword,
                approved: true,
            },
        });

        console.log("Admin user created");
    } else {
        console.log("Admin user already exists");
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
