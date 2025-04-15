// File: app/api/boqs/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
    S3Client,
    PutObjectCommand,
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

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const projectId = searchParams.get("projectId");
        const category = searchParams.get("category");
        const includeUrls = searchParams.get("includeUrls") === "true";

        let whereClause: any = {};
        if (projectId) {
            whereClause.projectId = parseInt(projectId);
        }
        if (category) {
            whereClause.category = category;
        }

        const boqs = await prisma.bOQ.findMany({
            where: whereClause,
            include: {
                project: true,
                items: true, // Include BOQ items in the response
            },
        });

        // If requested, generate presigned URLs for each BOQ file
        if (includeUrls) {
            const boqsWithUrls = await Promise.all(
                boqs.map(async (boq: any) => {
                    const command = new GetObjectCommand({
                        Bucket: BUCKET_NAME,
                        Key: boq.filePath,
                    });

                    // Generate a signed URL that expires in 1 hour
                    const url = await getSignedUrl(s3Client, command, {
                        expiresIn: 3600,
                    });

                    return {
                        ...boq,
                        downloadUrl: url,
                    };
                })
            );

            return NextResponse.json(boqsWithUrls);
        }

        return NextResponse.json(boqs);
    } catch (error) {
        console.error("Error fetching BOQs:", error);
        return NextResponse.json(
            { error: "Failed to fetch BOQs" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const projectId = formData.get("projectId");
        if (isNaN(Number(projectId))) {
            return NextResponse.json(
                { error: "Invalid projectId" },
                { status: 400 }
            );
        }
        const category = formData.get("category");
        const notes = formData.get("notes");
        const file = formData.get("file") as File;
        const boqItemsRaw = formData.get("boqItems");
        let boqItems: any[] = [];
        if (boqItemsRaw) {
            try {
                boqItems = JSON.parse(boqItemsRaw.toString());
            } catch (e) {
                return NextResponse.json(
                    { error: "Invalid BOQ items format" },
                    { status: 400 }
                );
            }
        }
        if (!projectId || !category || !file) {
            return NextResponse.json(
                { error: "ProjectId, category, and file are required" },
                { status: 400 }
            );
        }

        // Sanitize filename for S3 header
        const safeFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");

        // Create a unique file path for S3
        const filename = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
        const s3Key = `boqs/${filename}`;

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to S3
        const uploadParams = {
            Bucket: BUCKET_NAME,
            Key: s3Key,
            Body: buffer,
            ContentType: file.type,
            ContentDisposition: `attachment; filename="${safeFileName}"`,
        };

        const command = new PutObjectCommand(uploadParams);
        await s3Client.send(command);

        // Changed bOQ to BOQ to match schema casing
        const boq = await prisma.bOQ.create({
            data: {
                projectId: parseInt(projectId.toString()),
                category: category.toString(),
                fileName: file.name,
                filePath: s3Key,
                notes: notes?.toString() || "",
                items: {
                    create: boqItems.map((item) => ({
                        slNo: Number(item.slNo),
                        workDetail: item.workDetail,
                        amount: 0, // Always set to 0 for admin upload
                    })),
                },
            },
            // The 'items' relation will be created, but not included in the immediate response
            // Run `npx prisma generate` if the 'items' relation exists in your schema and you want to include it.
        });

        // Generate a presigned URL for the uploaded file
        const getCommand = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: s3Key,
        });

        const downloadUrl = await getSignedUrl(s3Client, getCommand, {
            expiresIn: 3600,
        });

        return NextResponse.json({ ...boq, downloadUrl }, { status: 201 });
    } catch (error) {
        console.error("Error creating BOQ:", error);
        return NextResponse.json(
            { error: "Failed to create BOQ" },
            { status: 500 }
        );
    }
}
