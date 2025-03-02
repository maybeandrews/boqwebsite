// app/api/vendor/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET a specific vendor
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id);

        if (isNaN(id)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        const vendor = await prisma.vendor.findUnique({
            where: { id },
            include: {
                project: true,
            },
        });

        if (!vendor) {
            return NextResponse.json(
                { error: "Vendor not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ vendor }, { status: 200 });
    } catch (error) {
        console.error("Error fetching vendor:", error);
        return NextResponse.json(
            { error: "Failed to fetch vendor" },
            { status: 500 }
        );
    }
}

// PATCH - Update a vendor
export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id);

        if (isNaN(id)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        const body = await req.json();
        const { name, contact, tags, approved, username, password } = body;

        // Get current vendor to check if we need to update project relationship
        const currentVendor = await prisma.vendor.findUnique({
            where: { id },
            select: { projectId: true },
        });

        if (!currentVendor) {
            return NextResponse.json(
                { error: "Vendor not found" },
                { status: 404 }
            );
        }

        // Update the vendor
        const vendor = await prisma.vendor.update({
            where: { id },
            data: {
                name,
                contact,
                tags,
                approved,
                username,
                password, // Note: In production, this should be hashed
            },
        });

        return NextResponse.json({ vendor }, { status: 200 });
    } catch (error) {
        console.error("Error updating vendor:", error);
        return NextResponse.json(
            { error: "Failed to update vendor" },
            { status: 500 }
        );
    }
}

// DELETE - Remove a vendor
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id);

        if (isNaN(id)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        // Get vendor details before deletion to update project count
        const vendor = await prisma.vendor.findUnique({
            where: { id },
            select: { projectId: true },
        });

        if (!vendor) {
            return NextResponse.json(
                { error: "Vendor not found" },
                { status: 404 }
            );
        }

        // Delete the vendor
        await prisma.vendor.delete({
            where: { id },
        });

        // Update the project's vendor count
        await prisma.project.update({
            where: { id: vendor.projectId },
            data: {
                vendors: {
                    decrement: 1,
                },
            },
        });

        return NextResponse.json(
            { message: "Vendor deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting vendor:", error);
        return NextResponse.json(
            { error: "Failed to delete vendor" },
            { status: 500 }
        );
    }
}
