// app/api/vendor/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET all vendors
export async function GET(req: NextRequest) {
    try {
        const vendors = await prisma.vendor.findMany();

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
        const { name, contact, tags, username, password } = body;

        // Validate required fields - only name and contact are required now
        if (!name || !contact) {
            return NextResponse.json(
                {
                    error: "Missing required fields: name and contact are required",
                },
                { status: 400 }
            );
        }

        // Ensure tags is an array
        const processedTags = Array.isArray(tags)
            ? tags
            : typeof tags === "string"
            ? tags.split(",").map((tag) => tag.trim())
            : [];

        // Create vendor data object
        // Ensure tags is stored as a comma-separated string
        const vendorData = {
            name,
            contact,
            tags: processedTags.join(", "), // Convert array to string
            approved: false,
            username: username || null,
            password: password || null, // Remember to hash passwords in production,
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
