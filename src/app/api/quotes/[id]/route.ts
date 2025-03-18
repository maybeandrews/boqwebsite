import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Configure AWS S3 client
const s3Client = new S3Client({
    region: process.env.AWS_REGION || "us-east-1",
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

export async function GET(req: NextRequest) {
    try {
        const id = req.url.split("/").pop();
        if (!id) {
            return NextResponse.json(
                { error: "Quote ID is required" },
                { status: 400 }
            );
        }

        // Fetch performa with related data
        const quote = await prisma.performa.findUnique({
            where: {
                id: parseInt(id),
            },
            include: {
                project: true,
                vendor: {
                    select: {
                        id: true,
                        name: true,
                        contact: true,
                    },
                },
            },
        });

        if (!quote) {
            return NextResponse.json(
                { error: "Quote not found" },
                { status: 404 }
            );
        }

        // Generate presigned URL for the quote
        const presignedUrl = await generatePresignedUrl(quote.fileKey);

        return NextResponse.json({
            quote: {
                ...quote,
                presignedUrl,
            },
        });
    } catch (error: any) {
        console.error("Error fetching quote:", error);

        return NextResponse.json(
            { error: "Failed to fetch quote", details: error.message },
            { status: 500 }
        );
    }
}

// Update a specific quote's status and add comments
export async function PUT(req: NextRequest) {
    try {
        const id = req.url.split("/").pop();
        if (!id) {
            return NextResponse.json(
                { error: "Quote ID is required" },
                { status: 400 }
            );
        }

        // Parse request body
        const body = await req.json();
        const { status, notes } = body;

        // Update performa status
        const updatedQuote = await prisma.performa.update({
            where: {
                id: parseInt(id),
            },
            data: {
                status,
                notes,
            },
            // Add these include statements to fetch project and vendor info
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
            },
        });

        // Generate presigned URL for the updated quote
        const presignedUrl = await generatePresignedUrl(updatedQuote.fileKey);

        return NextResponse.json({
            success: true,
            quote: {
                ...updatedQuote,
                presignedUrl,
            },
        });
    } catch (error: any) {
        console.error("Error updating quote:", error);

        return NextResponse.json(
            { error: "Failed to update quote", details: error.message },
            { status: 500 }
        );
    }
}
