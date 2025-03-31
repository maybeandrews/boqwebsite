// app/api/vendor/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();
const SALT_ROUNDS = 10; // Standard salt rounds for bcrypt

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

// POST - Create a new vendor with hashed password
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, contact, username, password, approved = true } = body;

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

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        // Create vendor data object with hashed password
        const vendorData = {
            name,
            contact,
            approved, // Use the approved value from request, defaulting to true
            username,
            password: hashedPassword, // Store hashed password, not plaintext
        };

        // Create the vendor
        const vendor = await prisma.vendor.create({
            data: vendorData,
            select: {
                id: true,
                name: true,
                contact: true,
                approved: true,
                username: true,
                // Don't include password in response
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

// PUT - Also update to handle password hashing when password is changed
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

        // Prepare update data
        const updateData: any = {};

        if (name !== undefined) updateData.name = name;
        if (contact !== undefined) updateData.contact = contact;
        if (approved !== undefined) updateData.approved = approved;
        if (username !== undefined) updateData.username = username;

        // If password is being updated, hash the new password
        if (password !== undefined && password) {
            updateData.password = await bcrypt.hash(password, SALT_ROUNDS);
        }

        // Update vendor
        const updatedVendor = await prisma.vendor.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                name: true,
                contact: true,
                approved: true,
                username: true,
                // Don't include password in response
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
