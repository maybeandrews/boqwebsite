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

// GET request handler (Attempting Promise type for context.params)
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> } // Typing params as a Promise
) {
    try {
        // Await the params object as if it were a Promise
        const params = await context.params;
        const id = params.id;

        if (!id) {
            return NextResponse.json(
                { error: "Quote ID is required" },
                { status: 400 }
            );
        }

        const quoteId = parseInt(id);
        if (isNaN(quoteId)) {
            return NextResponse.json(
                { error: "Invalid Quote ID format" },
                { status: 400 }
            );
        }

        // Fetch performa with related data
        const quote = await prisma.performa.findUnique({
            where: { id: quoteId },
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
        // Add specific check for potential await error
        if (
            error instanceof TypeError &&
            error.message.includes("object is not awaitable")
        ) {
            console.error(
                "Error likely caused by awaiting non-Promise context.params"
            );
            return NextResponse.json(
                {
                    error: "Internal server error processing request parameters",
                },
                { status: 500 }
            );
        }
        return NextResponse.json(
            { error: "Failed to fetch quote", details: error.message },
            { status: 500 }
        );
    }
}

// PUT request handler (Attempting Promise type for context.params)
export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ id: string }> } // Typing params as a Promise
) {
    try {
        // Await the params object as if it were a Promise
        const params = await context.params;
        const id = params.id;

        if (!id) {
            return NextResponse.json(
                { error: "Quote ID is required" },
                { status: 400 }
            );
        }

        const quoteId = parseInt(id);
        if (isNaN(quoteId)) {
            return NextResponse.json(
                { error: "Invalid Quote ID format" },
                { status: 400 }
            );
        }

        // Parse request body
        const body = await request.json();
        const { status, notes } = body;

        // Update performa status
        const updatedQuote = await prisma.performa.update({
            where: { id: quoteId },
            data: {
                status,
                notes,
            },
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
        // Add specific check for potential await error
        if (
            error instanceof TypeError &&
            error.message.includes("object is not awaitable")
        ) {
            console.error(
                "Error likely caused by awaiting non-Promise context.params"
            );
            return NextResponse.json(
                {
                    error: "Internal server error processing request parameters",
                },
                { status: 500 }
            );
        }
        if (error.code === "P2025") {
            return NextResponse.json(
                { error: "Quote not found" },
                { status: 404 }
            );
        }
        return NextResponse.json(
            { error: "Failed to update quote", details: error.message },
            { status: 500 }
        );
    }
}

// DELETE request handler (Attempting Promise type for context.params)
export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> } // Typing params as a Promise
) {
    try {
        // Await the params object as if it were a Promise
        const params = await context.params;
        const id = params.id;

        if (!id) {
            return NextResponse.json(
                { error: "Performa ID is required" },
                { status: 400 }
            );
        }

        const performaId = parseInt(id);
        if (isNaN(performaId)) {
            return NextResponse.json(
                { error: "Invalid Performa ID format" },
                { status: 400 }
            );
        }

        await prisma.performa.delete({
            where: { id: performaId },
        });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Error deleting performa:", error);
        // Add specific check for potential await error
        if (
            error instanceof TypeError &&
            error.message.includes("object is not awaitable")
        ) {
            console.error(
                "Error likely caused by awaiting non-Promise context.params"
            );
            return NextResponse.json(
                {
                    error: "Internal server error processing request parameters",
                },
                { status: 500 }
            );
        }
        if (error.code === "P2025") {
            return NextResponse.json(
                { error: "Performa not found" },
                { status: 404 }
            );
        }
        return NextResponse.json(
            { error: "Failed to delete performa", details: error.message },
            { status: 500 }
        );
    }
}
