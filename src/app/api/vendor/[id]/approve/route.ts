// app/api/vendor/[id]/approve/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const dynamic = "force-dynamic"; // Mark the route as dynamic

const prisma = new PrismaClient();

// PATCH - Toggle vendor approval status
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // No need for await here; parseInt is synchronous
        const id = parseInt(params.id, 10);

        if (isNaN(id)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        // Get current vendor to check approval status
        const currentVendor = await prisma.vendor.findUnique({
            where: { id },
            select: { approved: true },
        });

        if (!currentVendor) {
            return NextResponse.json(
                { error: "Vendor not found" },
                { status: 404 }
            );
        }

        // Toggle the approval status
        const vendor = await prisma.vendor.update({
            where: { id },
            data: {
                approved: !currentVendor.approved,
            },
        });

        return NextResponse.json(
            {
                vendor,
                message: vendor.approved
                    ? "Vendor approved"
                    : "Vendor approval revoked",
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error updating vendor approval:", error);
        return NextResponse.json(
            { error: "Failed to update vendor approval status" },
            { status: 500 }
        );
    }
}
