import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

// Initialize S3 client
const s3Client = new S3Client({
    region: process.env.AWS_REGION || "ap-south-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || "your-bucket-name";

// GET - Fetch projects for client uploads or performas
export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const vendorId = url.searchParams.get("vendorId");
        const projectId = url.searchParams.get("projectId");
        const includeUrls = url.searchParams.get("includeUrls") === "true";

        // If projectId is provided, return performas for that project
        if (projectId) {
            return await GET_performas(request);
        }

        // If vendorId is provided, return projects assigned to that vendor
        if (vendorId) {
            const vendorIdNum = Number(vendorId);
            if (isNaN(vendorIdNum)) {
                return NextResponse.json(
                    { error: "Invalid vendorId format" },
                    { status: 400 }
                );
            }

            // Get projects assigned to this vendor using VendorProject relation
            const projects = await prisma.project.findMany({
                where: {
                    vendors: {
                        some: {
                            vendorId: vendorIdNum,
                        },
                    },
                },
                select: {
                    id: true,
                    name: true,
                    description: true,
                    deadline: true,
                    tags: true,
                },
            });

            return NextResponse.json(projects);
        }

        // If no filters provided, return all projects (admin view)
        const projects = await prisma.project.findMany({
            select: {
                id: true,
                name: true,
                description: true,
                deadline: true,
                tags: true,
            },
        });

        return NextResponse.json(projects);
    } catch (error) {
        console.error("Error fetching projects:", error);
        return NextResponse.json(
            { error: "Failed to fetch projects" },
            { status: 500 }
        );
    }
}

// Function to fetch performas for a project
async function GET_performas(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const projectId = url.searchParams.get("projectId");
        const vendorId = url.searchParams.get("vendorId");
        const includeUrls = url.searchParams.get("includeUrls") === "true";

        if (!projectId) {
            return NextResponse.json(
                { error: "Missing projectId parameter" },
                { status: 400 }
            );
        }

        const projectIdNum = Number(projectId);
        if (isNaN(projectIdNum)) {
            return NextResponse.json(
                { error: "Invalid projectId format" },
                { status: 400 }
            );
        }

        // Build where clause for filtering performas
        const where: any = { projectId: projectIdNum };

        // Add vendorId filter if provided
        if (vendorId) {
            const vendorIdNum = Number(vendorId);
            if (!isNaN(vendorIdNum)) {
                where.vendorId = vendorIdNum;
            }
        }

        // Fetch performas from database
        const performas = await prisma.performa.findMany({
            where,
            orderBy: { uploadedAt: "desc" },
            select: {
                id: true,
                fileName: true,
                fileKey: true,
                uploadedAt: true,
                totalAmount: true,
                status: true,
                notes: true,
                category: true, // Make sure to include this
                // other fields...
            },
        });

        // If includeUrls is true, generate presigned URLs for each performa
        if (includeUrls) {
            const performasWithUrls = await Promise.all(
                performas.map(async (performa) => {
                    try {
                        const getCommand = new GetObjectCommand({
                            Bucket: BUCKET_NAME,
                            Key: performa.fileKey,
                        });

                        const downloadUrl = await getSignedUrl(
                            s3Client,
                            getCommand,
                            {
                                expiresIn: 3600, // URL expires in 1 hour
                            }
                        );

                        return {
                            ...performa,
                            downloadUrl,
                        };
                    } catch (error) {
                        console.error(
                            `Error generating URL for performa ${performa.id}:`,
                            error
                        );
                        return performa;
                    }
                })
            );

            return NextResponse.json(performasWithUrls);
        }

        return NextResponse.json(performas);
    } catch (error) {
        console.error("Error fetching performas:", error);
        return NextResponse.json(
            { error: "Failed to fetch performas" },
            { status: 500 }
        );
    }
}

// POST - Upload a new performa
export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const vendorId = formData.get("vendorId");
        const projectId = formData.get("projectId");
        const totalAmount = formData.get("totalAmount");
        const notes = formData.get("notes") || "";
        const validUntil = formData.get("validUntil") || null;
        const category = formData.get("category") || null;
        const boqItemsRaw = formData.get("boqItems");

        // Validate required fields
        if (!file || !vendorId || !projectId || !totalAmount) {
            return NextResponse.json(
                {
                    error: "Missing required fields: file, vendorId, projectId, totalAmount",
                },
                { status: 400 }
            );
        }

        // Parse BOQ items if provided
        let boqItems = [];
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

        // Convert values to appropriate types
        const vendorIdNum = Number(vendorId);
        const projectIdNum = Number(projectId);
        const totalAmountNum = Number(totalAmount);

        if (
            isNaN(vendorIdNum) ||
            isNaN(projectIdNum) ||
            isNaN(totalAmountNum)
        ) {
            return NextResponse.json(
                {
                    error: "Invalid input values: vendorId, projectId, and totalAmount must be numbers",
                },
                { status: 400 }
            );
        }

        // Validate file size
        if (file.size === 0) {
            return NextResponse.json(
                { error: "Uploaded file is empty" },
                { status: 400 }
            );
        }

        // Create a unique file path for S3
        const filename = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
        const fileKey = `performas/${randomUUID()}-${filename}`;

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to S3 using the S3Client directly
        const uploadParams = {
            Bucket: BUCKET_NAME,
            Key: fileKey,
            Body: buffer,
            ContentType: file.type,
            ContentDisposition: `attachment; filename="${file.name}"`,
        };

        // Create and send the PutObject command
        const command = new PutObjectCommand(uploadParams);
        await s3Client.send(command);

        // Save performa to database
        const performa = await prisma.performa.create({
            data: {
                vendorId: vendorIdNum,
                projectId: projectIdNum,
                fileName: file.name,
                filePath: `https://${BUCKET_NAME}.s3.amazonaws.com/${fileKey}`,
                fileKey: fileKey,
                fileSize: file.size,
                mimeType: file.type,
                totalAmount: totalAmountNum,
                status: "PENDING",
                notes: notes.toString(),
                validUntil: validUntil ? new Date(validUntil.toString()) : null,
                category: category ? category.toString() : null,
            },
        });

        // Find the admin BOQ for this project and category
        let boqId: number | null = null;
        if (category) {
            const adminBOQ = await prisma.bOQ.findFirst({
                where: {
                    projectId: projectIdNum,
                    category: category.toString(),
                },
                orderBy: { id: "desc" }, // get the latest if multiple
            });
            boqId = adminBOQ ? adminBOQ.id : null;
        }

        // Save BOQ items to database, linked to the performa
        // Define a type for BOQ items
        interface BOQItem {
            slNo: string;
            workDetail: string;
            amount: string;
        }

        if (boqItems.length > 0) {
            await prisma.bOQItem.createMany({
                data: boqItems.map((item: BOQItem) => ({
                    performaId: performa.id,
                    boqId: boqId,
                    slNo: Number(item.slNo),
                    workDetail: item.workDetail,
                    amount: Number(item.amount),
                })),
            });
        }

        // Generate a presigned URL for the uploaded file
        const getCommand = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: fileKey,
        });

        const downloadUrl = await getSignedUrl(s3Client, getCommand, {
            expiresIn: 3600, // URL expires in 1 hour
        });

        return NextResponse.json({ ...performa, downloadUrl }, { status: 201 });
    } catch (error) {
        console.error("Error uploading performa:", error);
        return NextResponse.json(
            { error: `Failed to upload performa: ${(error as Error).message}` },
            { status: 500 }
        );
    }
}
