// app/api/vendor/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET all vendors
export async function GET(req: NextRequest) {
    try {
        // We need to add a Vendor model to the Prisma schema first
        // For now, we'll query from the existing schema as best we can
        const vendors = await prisma.vendor.findMany({
            include: {
                project: true,
            },
        });

        return NextResponse.json({ vendors }, { status: 200 });
    } catch (error) {
        console.error("Error fetching vendors:", error);
        return NextResponse.json(
            { error: "Failed to fetch vendors" },
            { status: 500 }
        );
    }
}

// POST - Create a new vendor
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, contact, tags, projectId, username, password } = body;

        // Validate required fields
        if (!name || !contact || !projectId) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Create the vendor
        const vendor = await prisma.vendor.create({
            data: {
                name,
                contact,
                tags,
                approved: false,
                username,
                password, // Note: In production, this should be hashed
                project: {
                    connect: {
                        id: projectId,
                    },
                },
            },
        });

        // Update the project's vendor count
        await prisma.project.update({
            where: { id: projectId },
            data: {
                vendors: {
                    increment: 1,
                },
            },
        });

        return NextResponse.json({ vendor }, { status: 201 });
    } catch (error) {
        console.error("Error creating vendor:", error);
        return NextResponse.json(
            { error: "Failed to create vendor" },
            { status: 500 }
        );
    }
}
