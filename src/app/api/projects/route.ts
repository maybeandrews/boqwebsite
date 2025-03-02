import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const projects = await prisma.project.findMany();
        return NextResponse.json(projects);
    } catch (error) {
        console.error("Error fetching projects:", error);
        return NextResponse.json(
            { error: "Failed to fetch projects" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate request body
        if (!body.name || !body.deadline) {
            return NextResponse.json(
                { error: "Name and deadline are required" },
                { status: 400 }
            );
        }

        // Format tags if they come as a string
        const tags = Array.isArray(body.tags)
            ? body.tags
            : body.tags
            ? body.tags.split(",").map((tag: string) => tag.trim())
            : [];

        // Create new project
        const project = await prisma.project.create({
            data: {
                name: body.name,
                description: body.description || "",
                vendors: body.vendors || 0,
                quotes: body.quotes || 0,
                deadline: new Date(body.deadline),
                tags: tags,
            },
        });

        return NextResponse.json(project, { status: 201 });
    } catch (error) {
        console.error("Error creating project:", error);
        return NextResponse.json(
            { error: "Failed to create project" },
            { status: 500 }
        );
    }
}
