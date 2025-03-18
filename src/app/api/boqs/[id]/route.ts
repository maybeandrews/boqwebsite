import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
    S3Client,
    DeleteObjectCommand,
    GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Initialize S3 client
const s3Client = new S3Client({
    region: process.env.AWS_REGION || "ap-south-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || "your-bucket-name";

// Inline type for context parameter
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id);

        if (isNaN(id)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        const boq = await prisma.bOQ.findUnique({
            where: { id },
            include: {
                project: true,
            },
        });

        if (!boq) {
            return NextResponse.json(
                { error: "BOQ not found" },
                { status: 404 }
            );
        }

        // Generate a presigned URL for file download
        const command = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: boq.filePath,
        });

        const downloadUrl = await getSignedUrl(s3Client, command, {
            expiresIn: 3600,
        });

        return NextResponse.json({ ...boq, downloadUrl });
    } catch (error) {
        console.error("Error fetching BOQ:", error);
        return NextResponse.json(
            { error: "Failed to fetch BOQ" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id);

        if (isNaN(id)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        // Fetch the BOQ first to get the file path
        const boq = await prisma.bOQ.findUnique({
            where: { id },
        });

        if (!boq) {
            return NextResponse.json(
                { error: "BOQ not found" },
                { status: 404 }
            );
        }

        // Delete the file from S3
        try {
            const deleteCommand = new DeleteObjectCommand({
                Bucket: BUCKET_NAME,
                Key: boq.filePath,
            });
            await s3Client.send(deleteCommand);
        } catch (fileError) {
            console.warn(
                "File might not exist in S3. Proceeding with DB deletion.",
                fileError
            );
        }

        // Delete the database record
        await prisma.bOQ.delete({
            where: { id },
        });

        return NextResponse.json({ message: "BOQ deleted successfully" });
    } catch (error) {
        console.error("Error deleting BOQ:", error);
        return NextResponse.json(
            { error: "Failed to delete BOQ" },
            { status: 500 }
        );
    }
}
