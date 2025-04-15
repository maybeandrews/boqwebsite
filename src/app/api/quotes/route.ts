import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Configure AWS S3 client
const s3Client = new S3Client({
    region: process.env.AWS_REGION || "ap-south-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    },
});

// Function to generate presigned URL
async function generatePresignedUrl(fileKey: string) {
    try {
        const command = new GetObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME || "",
            Key: fileKey,
        });

        // URL expires in 1 hour
        return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    } catch (error) {
        console.error("Error generating presigned URL:", error);
        return null;
    }
}

// GET all quotes with filtering options
export async function GET(req: NextRequest) {
    try {
        // Get query parameters
        const url = new URL(req.url);
        const projectId = url.searchParams.get("projectId");
        const vendorId = url.searchParams.get("vendorId");
        const status = url.searchParams.get("status");
        const category = url.searchParams.get("category");

        // Build query filters
        const filters: any = {};

        if (projectId) {
            filters.projectId = parseInt(projectId);
        }

        if (vendorId) {
            filters.vendorId = parseInt(vendorId);
        }

        if (status) {
            filters.status = status;
        }

        if (category) {
            filters.category = category;
        }

        // Fetch performas with filters
        const quotes = await prisma.performa.findMany({
            where: filters,
            include: {
                project: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                    },
                },
                vendor: {
                    select: {
                        id: true,
                        name: true,
                        contact: true,
                    },
                },
                boqItems: true, // Changed from "boq" to "boqItems" to match schema
            },
            orderBy: {
                uploadedAt: "desc",
            },
        });

        // Generate presigned URLs for each quote
        const quotesWithUrls = await Promise.all(
            quotes.map(async (quote) => {
                const presignedUrl = await generatePresignedUrl(quote.fileKey);
                return {
                    ...quote,
                    presignedUrl,
                };
            })
        );

        // For the dashboard, we also need to get unique projects and categories for filters
        const projects = await prisma.project.findMany({
            select: {
                id: true,
                name: true,
            },
            orderBy: {
                name: "asc",
            },
        });

        // Get unique categories from performas
        const categoriesQuery = await prisma.performa.findMany({
            select: {
                category: true,
            },
            distinct: ["category"],
            where: {
                category: {
                    not: null,
                },
            },
        });

        const categories = categoriesQuery
            .map((item) => item.category)
            .filter(Boolean) as string[];

        return NextResponse.json({
            quotes: quotesWithUrls,
            projects,
            categories,
        });
    } catch (error: any) {
        console.error("Error in quotes API:", error);

        return NextResponse.json(
            { error: "Failed to fetch quotes", details: error.message },
            { status: 500 }
        );
    }
}

// Update quote status and comments
export async function POST(req: NextRequest) {
    try {
        // Parse request body
        const body = await req.json();
        const { id, status, notes } = body;

        if (!id) {
            return NextResponse.json(
                { error: "Performa ID is required" },
                { status: 400 }
            );
        }

        // Update performa status
        const updatedPerforma = await prisma.performa.update({
            where: {
                id: parseInt(id),
            },
            data: {
                status,
                notes,
            },
            include: {
                project: {
                    select: {
                        name: true,
                    },
                },
                vendor: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        // Generate presigned URL for the updated performa
        const presignedUrl = await generatePresignedUrl(
            updatedPerforma.fileKey
        );

        return NextResponse.json({
            success: true,
            performa: {
                ...updatedPerforma,
                presignedUrl,
            },
        });
    } catch (error: any) {
        console.error("Error updating performa:", error);

        return NextResponse.json(
            { error: "Failed to update performa", details: error.message },
            { status: 500 }
        );
    }
}
