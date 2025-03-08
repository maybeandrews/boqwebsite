// app/api/vendor/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET a specific vendor
export async function GET(
    req: NextRequest,
    context: { params: { id: string } }
) {
    try {
        const { id: vendorIdString } = context.params;
        const id = parseInt(vendorIdString);

        if (isNaN(id)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        const vendor = await prisma.vendor.findUnique({
            where: { id },
            include: {
                projects: {
                    include: {
                        project: true,
                    },
                },
                quotes: true,
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
    context: { params: { id: string } }
) {
    try {
        const { id: vendorIdString } = context.params;
        const id = parseInt(vendorIdString);

        if (isNaN(id)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        const body = await req.json();
        const { name, contact, approved, username, password } = body;

        // Check if vendor exists
        const currentVendor = await prisma.vendor.findUnique({
            where: { id },
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
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id);

        if (isNaN(id)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        // Check if vendor exists
        const vendor = await prisma.vendor.findUnique({
            where: { id },
            include: {
                projects: true, // Include relationships to check
            },
        });

        if (!vendor) {
            return NextResponse.json(
                { error: "Vendor not found" },
                { status: 404 }
            );
        }

        // First delete any VendorProject entries
        if (vendor.projects.length > 0) {
            await prisma.vendorProject.deleteMany({
                where: { vendorId: id },
            });
        }

        // Delete any Performa entries associated with this vendor
        await prisma.performa.deleteMany({
            where: { vendorId: id },
        });

        // Delete any quotes associated with this vendor
        await prisma.quote.deleteMany({
            where: { vendorId: id },
        });

        // Delete any BOQs associated with this vendor
        await prisma.bOQ.deleteMany({
            where: { vendorId: id },
        });

        // Delete the vendor
        const deleted = await prisma.vendor.delete({
            where: { id },
        });

        return NextResponse.json(deleted);
    } catch (error) {
        console.error("Error deleting vendor:", error);

        // Check for specific Prisma errors
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error";

        return NextResponse.json(
            { error: "Failed to delete vendor", details: errorMessage },
            { status: 500 }
        );
    }
}
