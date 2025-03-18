import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET all vendors for a specific project
export async function GET(req: NextRequest) {
    try {
        const projectId = parseInt(req.url.split("/").pop() || "");

        if (isNaN(projectId)) {
            return NextResponse.json(
                { error: "Invalid project ID" },
                { status: 400 }
            );
        }

        // Check if project exists
        const project = await prisma.project.findUnique({
            where: { id: projectId },
        });

        if (!project) {
            return NextResponse.json(
                { error: "Project not found" },
                { status: 404 }
            );
        }

        // Get all vendors for this project through the VendorProject join table
        const vendors = await prisma.vendorProject.findMany({
            where: { projectId },
            include: {
                vendor: true,
            },
            orderBy: { vendor: { name: "asc" } },
        });

        // Extract vendor details
        const vendorDetails = vendors.map((vp) => vp.vendor);

        return NextResponse.json({ vendors: vendorDetails }, { status: 200 });
    } catch (error) {
        console.error("Error fetching project vendors:", error);
        return NextResponse.json(
            { error: "Failed to fetch project vendors" },
            { status: 500 }
        );
    }
}
