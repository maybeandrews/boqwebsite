// app/api/vendor/[id]/approve/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const dynamic = "force-dynamic"; // Mark the route as dynamic

const prisma = new PrismaClient();

// PATCH - Toggle vendor approval status
export async function PATCH(request: NextRequest) {
    try {
        // Extract ID using URL constructor
        const url = new URL(request.url);
        const pathParts = url.pathname.split("/").filter(Boolean);
        const id = parseInt(pathParts[pathParts.length - 2], 10); // Get the second-to-last path segment

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
