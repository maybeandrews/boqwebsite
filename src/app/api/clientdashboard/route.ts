import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
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

// Function to generate signed URL for S3 files
async function getSignedFileUrl(fileKey: string): Promise<string> {
    if (!fileKey) return "";

    try {
        // Extract the key if it's a full URL
        const key = fileKey.includes("amazonaws.com")
            ? fileKey.split(".com/")[1]
            : fileKey;

        const command = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
        });

        return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    } catch (error) {
        console.error("Error generating signed URL:", error);
        return ""; // Return empty string if URL generation fails
    }
}

export async function GET(req: NextRequest) {
    try {
        // Extract vendor ID from query params
        const vendorId = parseInt(
            req.nextUrl.searchParams.get("vendorId") || "0",
            10
        );

        if (!vendorId) {
            return NextResponse.json(
                { success: false, message: "Vendor ID is required" },
                { status: 400 }
            );
        }

        // Check if vendor exists
        const vendor = await prisma.vendor.findUnique({
            where: { id: vendorId },
        });

        if (!vendor) {
            return NextResponse.json(
                { success: false, message: "Vendor not found" },
                { status: 404 }
            );
        }

        // Fetch only the projects assigned to this vendor
        const assignedProjects = await prisma.vendorProject.findMany({
            where: { vendorId },
            include: {
                project: {
                    include: {
                        boqs: true, // Get associated BOQs
                        performas: {
                            where: { vendorId }, // Only get performas from this vendor
                        },
                    },
                },
            },
        });

        // Transform the data to include signed S3 URLs for files
        const projectsWithFiles = await Promise.all(
            assignedProjects.map(async (vp) => {
                const project = vp.project;

                // Process BOQs
                const boqsWithUrls = await Promise.all(
                    project.boqs.map(async (boq) => {
                        try {
                            return {
                                id: boq.id,
                                fileName: boq.fileName,
                                fileUrl: await getSignedFileUrl(boq.filePath),
                                category: boq.category,
                            };
                        } catch (error) {
                            console.error(
                                `Error processing BOQ ${boq.id}:`,
                                error
                            );
                            return {
                                id: boq.id,
                                fileName: boq.fileName,
                                fileUrl: "",
                                category: boq.category,
                            };
                        }
                    })
                );

                // Process performas
                const performasWithUrls = await Promise.all(
                    project.performas.map(async (performa) => {
                        try {
                            return {
                                id: performa.id,
                                fileName: performa.fileName,
                                fileUrl: await getSignedFileUrl(
                                    performa.fileKey
                                ),
                                status: performa.status,
                                totalAmount: performa.totalAmount,
                                notes: performa.notes,
                                category: performa.category,
                                validUntil: performa.validUntil,
                            };
                        } catch (error) {
                            console.error(
                                `Error processing performa ${performa.id}:`,
                                error
                            );
                            return {
                                id: performa.id,
                                fileName: performa.fileName,
                                fileUrl: "",
                                status: performa.status,
                                totalAmount: performa.totalAmount,
                                notes: performa.notes,
                                category: performa.category,
                                validUntil: performa.validUntil,
                            };
                        }
                    })
                );

                return {
                    id: project.id,
                    name: project.name,
                    description: project.description,
                    deadline: project.deadline,
                    tags: project.tags,
                    status: project.tags?.includes("urgent")
                        ? "URGENT"
                        : "ACTIVE",
                    boqs: boqsWithUrls,
                    performas: performasWithUrls,
                };
            })
        );

        return NextResponse.json({
            success: true,
            projects: projectsWithFiles,
            vendorId,
        });
    } catch (error) {
        console.error("❌ Error fetching vendor projects:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Internal Server Error",
                error: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        );
    }
}
