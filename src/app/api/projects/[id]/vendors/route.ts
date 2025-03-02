// app/api/project/[id]/vendors/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET all vendors for a specific project
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const projectId = parseInt(params.id);

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

        // Get all vendors for this project
        const vendors = await prisma.vendor.findMany({
            where: { projectId },
            orderBy: { name: "asc" },
        });

        return NextResponse.json({ vendors }, { status: 200 });
    } catch (error) {
        console.error("Error fetching project vendors:", error);
        return NextResponse.json(
            { error: "Failed to fetch project vendors" },
            { status: 500 }
        );
    }
}
