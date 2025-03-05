// app/api/vendor/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET all vendors
export async function GET(req: NextRequest) {
    try {
        const vendors = await prisma.vendor.findMany({
            select: {
                id: true,
                name: true,
                contact: true,
                approved: true,
                username: true,
                // Don't include password for security
                projects: {
                    include: {
                        project: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        // Return just the vendors array, not wrapped in an object
        return NextResponse.json(vendors, { status: 200 });
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
        const { name, contact, username, password } = body;

        // Validate required fields
        if (!name || !contact || !username || !password) {
            return NextResponse.json(
                {
                    error: "Missing required fields: name, contact, username, and password are required",
                },
                { status: 400 }
            );
        }

        // Check if username already exists
        const existingVendor = await prisma.vendor.findUnique({
            where: { username },
        });

        if (existingVendor) {
            return NextResponse.json(
                { error: "Username already exists" },
                { status: 409 }
            );
        }

        // Create vendor data object
        const vendorData = {
            name,
            contact,
            approved: false,
            username,
            password, // Basic implementation - not hashed
        };

        // Create the vendor
        const vendor = await prisma.vendor.create({
            data: vendorData,
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

// PUT - Update vendor
export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const { id, name, contact, approved, username, password } = body;

        if (!id) {
            return NextResponse.json(
                { error: "Vendor ID is required" },
                { status: 400 }
            );
        }

        // Check if vendor exists
        const existingVendor = await prisma.vendor.findUnique({
            where: { id },
        });

        if (!existingVendor) {
            return NextResponse.json(
                { error: "Vendor not found" },
                { status: 404 }
            );
        }

        // Update vendor
        const updatedVendor = await prisma.vendor.update({
            where: { id },
            data: {
                name: name !== undefined ? name : existingVendor.name,
                contact:
                    contact !== undefined ? contact : existingVendor.contact,
                approved:
                    approved !== undefined ? approved : existingVendor.approved,
                username:
                    username !== undefined ? username : existingVendor.username,
                password:
                    password !== undefined ? password : existingVendor.password,
            },
        });

        return NextResponse.json({ vendor: updatedVendor }, { status: 200 });
    } catch (error) {
        console.error("Error updating vendor:", error);
        return NextResponse.json(
            { error: "Failed to update vendor" },
            { status: 500 }
        );
    }
}

// DELETE - Remove a vendor
export async function DELETE(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const id = Number(url.searchParams.get("id"));

        if (!id) {
            return NextResponse.json(
                { error: "Vendor ID is required" },
                { status: 400 }
            );
        }

        // Delete the vendor
        await prisma.vendor.delete({
            where: { id },
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
