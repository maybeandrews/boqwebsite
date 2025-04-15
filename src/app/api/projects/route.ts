import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        console.log("Fetching all projects...");

        const projects = await prisma.project.findMany({
            include: {
                boqs: true,
                quotes: true,
                vendors: true,
            },
        });

        console.log("Fetched projects:", projects.length, "projects found.");
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
        console.log("Received request body:", body);

        // Validate request body
        if (!body.name || !body.deadline) {
            console.warn("Validation failed: Missing name or deadline.");
            return NextResponse.json(
                { error: "Name and deadline are required" },
                { status: 400 }
            );
        }

        // Ensure vendors and quotes are arrays (or empty arrays if undefined)
        const vendors = Array.isArray(body.vendors) ? body.vendors : [];
        const quotes = Array.isArray(body.quotes) ? body.quotes : [];
        const boqs = Array.isArray(body.boqs) ? body.boqs : [];

        // Ensure tags is an array
        const tags: string[] = Array.isArray(body.tags)
            ? body.tags
            : typeof body.tags === "string"
            ? body.tags.split(",").map((tag: string) => tag.trim())
            : [];

        const groupName = body.groupName || null;

        // Log parsed data before creating the project
        console.log("Creating project with data:", {
            name: body.name,
            description: body.description || "",
            deadline: new Date(body.deadline),
            tags,
            groupName,
            boqs,
            quotes,
            vendors,
        });

        // Create new project
        const project = await prisma.project.create({
            data: {
                name: body.name,
                description: body.description || "",
                deadline: new Date(body.deadline),
                tags: { set: tags }, // Ensure tags are set using Prisma's syntax
                groupName,
                boqs: { connect: boqs.map((boqId: number) => ({ id: boqId })) },
                quotes: {
                    connect: quotes.map((quoteId: number) => ({ id: quoteId })),
                },
                vendors: {
                    create: vendors.map((vendorId: number) => ({
                        vendor: { connect: { id: vendorId } },
                    })),
                },
            },
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

        console.log("Project created successfully:", project);
        return NextResponse.json(project, { status: 201 });
    } catch (error) {
        console.error("Error creating project:", error);
        return NextResponse.json(
            {
                error: "Failed to create project",
                details:
                    error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
