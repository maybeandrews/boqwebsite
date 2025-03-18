// File: app/api/projects/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
    params: {
        id: string;
    };
}

export async function GET(request: NextRequest) {
    try {
        const id = parseInt(request.url.split("/").pop() || "");

        if (isNaN(id)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        const project = await prisma.project.findUnique({
            where: { id },
            include: {
                boqs: true,
                quotes: true,
                vendors: {
                    include: {
                        vendor: true,
                    },
                },
            },
        });

        if (!project) {
            return NextResponse.json(
                { error: "Project not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(project);
    } catch (error) {
        console.error("Error fetching project:", error);
        return NextResponse.json(
            { error: "Failed to fetch project" },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const id = parseInt(request.url.split("/").pop() || "");
        const body = await request.json();

        if (isNaN(id)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        // Format tags if they come as a string
        let tags = Array.isArray(body.tags)
            ? body.tags
            : typeof body.tags === "string"
            ? body.tags.split(",").map((tag: string) => tag.trim())
            : undefined;

        // Process update data
        const updateData: any = {};

        if (body.name !== undefined) updateData.name = body.name;
        if (body.description !== undefined)
            updateData.description = body.description;
        if (body.deadline) updateData.deadline = new Date(body.deadline);
        if (tags !== undefined) updateData.tags = { set: tags };

        // Handle relationships if needed
        if (Array.isArray(body.boqs)) {
            updateData.boqs = { set: body.boqs.map((id: number) => ({ id })) };
        }

        if (Array.isArray(body.quotes)) {
            updateData.quotes = {
                set: body.quotes.map((id: number) => ({ id })),
            };
        }

        // Vendors need special handling through the join table
        if (Array.isArray(body.vendors)) {
            // First delete existing vendor connections
            await prisma.vendorProject.deleteMany({
                where: { projectId: id },
            });

            // Then create new ones
            updateData.vendors = {
                create: body.vendors.map((vendorId: number) => ({
                    vendor: { connect: { id: vendorId } },
                })),
            };
        }

        const project = await prisma.project.update({
            where: { id },
            data: updateData,
            include: {
                boqs: true,
                quotes: true,
                vendors: {
                    include: {
                        vendor: true,
                    },
                },
            },
        });

        return NextResponse.json(project);
    } catch (error) {
        console.error("Error updating project:", error);
        return NextResponse.json(
            {
                error: "Failed to update project",
                details:
                    error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const id = parseInt(request.url.split("/").pop() || "");

        if (isNaN(id)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        // First delete all related records to avoid foreign key constraint errors

        // 1. Delete VendorProject associations
        await prisma.vendorProject.deleteMany({
            where: { projectId: id },
        });

        // 2. Delete Performas related to this project
        await prisma.performa.deleteMany({
            where: { projectId: id },
        });

        // 3. Delete BOQs related to this project
        await prisma.bOQ.deleteMany({
            where: { projectId: id },
        });

        // 4. Delete Quotes related to this project
        await prisma.quote.deleteMany({
            where: { projectId: id },
        });

        // 5. Now delete the project itself
        await prisma.project.delete({
            where: { id },
        });

        return NextResponse.json({ message: "Project deleted successfully" });
    } catch (error) {
        console.error("Error deleting project:", error);
        return NextResponse.json(
            {
                error: "Failed to delete project",
                details:
                    error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
