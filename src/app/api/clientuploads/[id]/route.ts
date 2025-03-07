import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Use singleton Prisma instance
import {
    S3Client,
    GetObjectCommand,
    DeleteObjectCommand,
    PutObjectCommand,
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

// GET route to fetch a specific Performa
export async function GET(
    req: NextRequest,
    { params }: { params: { id?: string } }
) {
    try {
        const id = Number(params.id);
        const includeUrl =
            req.nextUrl.searchParams.get("includeUrl") === "true";

        if (!params.id || isNaN(id)) {
            return NextResponse.json(
                { error: "Valid Performa ID is required" },
                { status: 400 }
            );
        }

        const performa = await prisma.performa.findUnique({
            where: { id },
            include: {
                project: {
                    select: {
                        name: true,
                        description: true,
                        tags: true,
                    },
                },
                vendor: {
                    select: {
                        name: true,
                        contact: true,
                    },
                },
            },
        });

        if (!performa) {
            return NextResponse.json(
                { error: "Performa not found" },
                { status: 404 }
            );
        }

        // Generate presigned URL if requested
        if (includeUrl) {
            try {
                const getCommand = new GetObjectCommand({
                    Bucket: BUCKET_NAME,
                    Key: performa.fileKey,
                });

                const downloadUrl = await getSignedUrl(s3Client, getCommand, {
                    expiresIn: 3600, // URL expires in 1 hour
                });

                return NextResponse.json({ ...performa, downloadUrl });
            } catch (urlError) {
                console.error("Error generating presigned URL:", urlError);
                // Continue and return performa without URL
            }
        }

        return NextResponse.json(performa);
    } catch (error) {
        console.error("Error fetching Performa:", error);
        return NextResponse.json(
            { error: "Failed to fetch Performa" },
            { status: 500 }
        );
    }
}

// DELETE route to remove a Performa without using lib/s3-config
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id?: string } }
) {
    try {
        const id = Number(params.id);
        // Make vendorId optional - admins might not need to provide it
        const vendorIdParam = req.nextUrl.searchParams.get("vendorId");
        const vendorId = vendorIdParam ? Number(vendorIdParam) : undefined;

        if (!params.id || isNaN(id)) {
            return NextResponse.json(
                { error: "Valid Performa ID is required" },
                { status: 400 }
            );
        }

        // If vendorId is provided, check authorization
        const whereClause: any = { id };
        if (vendorId !== undefined) {
            if (isNaN(vendorId)) {
                return NextResponse.json(
                    { error: "Valid Vendor ID is required" },
                    { status: 400 }
                );
            }
            whereClause.vendorId = vendorId;
        }

        const performa = await prisma.performa.findFirst({
            where: whereClause,
        });

        if (!performa) {
            return NextResponse.json(
                { error: "Performa not found or unauthorized" },
                { status: 404 }
            );
        }

        // Delete file from S3 directly
        try {
            const deleteCommand = new DeleteObjectCommand({
                Bucket: BUCKET_NAME,
                Key: performa.fileKey,
            });

            await s3Client.send(deleteCommand);
            console.log(`File deleted from S3: ${performa.fileKey}`);
        } catch (fileError) {
            console.error("Error deleting file from S3:", fileError);
            // Continue with database deletion even if S3 deletion fails
        }

        // Delete Performa from database
        await prisma.performa.delete({ where: { id } });

        return NextResponse.json({ message: "Performa deleted successfully" });
    } catch (error) {
        console.error("Error deleting Performa:", error);
        return NextResponse.json(
            { error: "Failed to delete Performa" },
            { status: 500 }
        );
    }
}

// PATCH route to update Performa status
export async function PATCH(
    req: NextRequest,
    { params }: { params: { id?: string } }
) {
    try {
        const id = Number(params.id);
        if (!params.id || isNaN(id)) {
            return NextResponse.json(
                { error: "Valid Performa ID is required" },
                { status: 400 }
            );
        }

        const body = await req.json().catch(() => null); // ✅ Handle JSON parsing safely
        if (!body) {
            return NextResponse.json(
                { error: "Invalid request body" },
                { status: 400 }
            );
        }

        const { status, notes, termsAccepted, validUntil } = body;

        if (!status && !notes && termsAccepted === undefined && !validUntil) {
            return NextResponse.json(
                {
                    error: "At least one field (status, notes, termsAccepted, or validUntil) must be provided",
                },
                { status: 400 }
            );
        }

        // Validate status if provided
        if (
            status &&
            ![
                "PENDING",
                "UNDER_REVIEW",
                "APPROVED",
                "REJECTED",
                "EXPIRED",
            ].includes(status)
        ) {
            return NextResponse.json(
                { error: "Invalid status" },
                { status: 400 }
            );
        }

        // Build the update data object
        const updateData: any = {};
        if (status !== undefined) updateData.status = status;
        if (notes !== undefined) updateData.notes = notes;
        if (termsAccepted !== undefined)
            updateData.termsAccepted = termsAccepted;
        if (validUntil !== undefined) {
            try {
                updateData.validUntil = new Date(validUntil);
            } catch (e) {
                return NextResponse.json(
                    { error: "Invalid date format for validUntil" },
                    { status: 400 }
                );
            }
        }

        const updatedPerforma = await prisma.performa.update({
            where: { id },
            data: updateData,
        });

        // Generate a presigned URL for the updated performa
        try {
            const getCommand = new GetObjectCommand({
                Bucket: BUCKET_NAME,
                Key: updatedPerforma.fileKey,
            });

            const downloadUrl = await getSignedUrl(s3Client, getCommand, {
                expiresIn: 3600, // URL expires in 1 hour
            });

            return NextResponse.json({ ...updatedPerforma, downloadUrl });
        } catch (urlError) {
            console.error("Error generating presigned URL:", urlError);
            // Return without URL if there's an error
            return NextResponse.json(updatedPerforma);
        }
    } catch (error) {
        console.error("Error updating Performa:", error);
        return NextResponse.json(
            { error: "Failed to update Performa" },
            { status: 500 }
        );
    }
}

// PUT route to handle larger updates or file replacement
export async function PUT(
    req: NextRequest,
    { params }: { params: { id?: string } }
) {
    try {
        const id = Number(params.id);
        if (!params.id || isNaN(id)) {
            return NextResponse.json(
                { error: "Valid Performa ID is required" },
                { status: 400 }
            );
        }

        // Ensure the performa exists
        const existingPerforma = await prisma.performa.findUnique({
            where: { id },
        });

        if (!existingPerforma) {
            return NextResponse.json(
                { error: "Performa not found" },
                { status: 404 }
            );
        }

        // Handle form data for file uploads
        const formData = await req.formData();
        const file = formData.get("file") as File | null;
        const totalAmount = formData.get("totalAmount");
        const notes = formData.get("notes");
        const validUntil = formData.get("validUntil");
        const status = formData.get("status");

        // Prepare update data
        const updateData: any = {};

        // Update non-file fields
        if (totalAmount !== null) {
            const totalAmountNum = Number(totalAmount);
            if (!isNaN(totalAmountNum)) {
                updateData.totalAmount = totalAmountNum;
            }
        }

        if (notes !== null) updateData.notes = notes.toString();

        if (validUntil !== null && validUntil !== "") {
            try {
                updateData.validUntil = new Date(validUntil.toString());
            } catch (e) {
                // Invalid date - ignore
            }
        }

        if (
            status !== null &&
            [
                "PENDING",
                "UNDER_REVIEW",
                "APPROVED",
                "REJECTED",
                "EXPIRED",
            ].includes(status.toString())
        ) {
            updateData.status = status.toString();
        }

        // Handle file update if provided
        if (file && file.size > 0) {
            // Delete the old file from S3 directly
            try {
                const deleteCommand = new DeleteObjectCommand({
                    Bucket: BUCKET_NAME,
                    Key: existingPerforma.fileKey,
                });

                await s3Client.send(deleteCommand);
                console.log(
                    `Old file deleted from S3: ${existingPerforma.fileKey}`
                );
            } catch (fileError) {
                console.error("Error deleting old file from S3:", fileError);
            }

            // Generate new key for the updated file
            const filename = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
            const fileKey = `performas/updated-${filename}`;

            // Upload new file
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Upload to S3 using the S3 client
            const uploadParams = {
                Bucket: BUCKET_NAME,
                Key: fileKey,
                Body: buffer,
                ContentType: file.type,
                ContentDisposition: `attachment; filename="${file.name}"`,
            };

            const command = new PutObjectCommand(uploadParams);
            await s3Client.send(command);

            // Update file-related fields
            updateData.fileName = file.name;
            updateData.filePath = `https://${BUCKET_NAME}.s3.amazonaws.com/${fileKey}`;
            updateData.fileKey = fileKey;
            updateData.fileSize = file.size;
            updateData.mimeType = file.type;
        }

        // Update the performa in the database
        const updatedPerforma = await prisma.performa.update({
            where: { id },
            data: updateData,
        });

        // Generate presigned download URL
        const getCommand = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: updatedPerforma.fileKey,
        });

        const downloadUrl = await getSignedUrl(s3Client, getCommand, {
            expiresIn: 3600,
        });

        return NextResponse.json({ ...updatedPerforma, downloadUrl });
    } catch (error) {
        console.error("Error updating Performa:", error);
        return NextResponse.json(
            { error: "Failed to update Performa" },
            { status: 500 }
        );
    }
}
