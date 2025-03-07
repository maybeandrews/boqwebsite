import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadToS3 } from "@/lib/s3-config";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const vendorId = formData.get("vendorId");
    const projectId = formData.get("projectId");
    const totalAmount = formData.get("totalAmount");
    const notes = formData.get("notes") || "";
    const validUntil = formData.get("validUntil") || null;

    // ✅ Validate required fields
    if (!file || !vendorId || !projectId || !totalAmount) {
      return NextResponse.json(
        { error: "Missing required fields: file, vendorId, projectId, totalAmount" },
        { status: 400 }
      );
    }

    // ✅ Convert values to appropriate types
    const vendorIdNum = Number(vendorId);
    const projectIdNum = Number(projectId);
    const totalAmountNum = Number(totalAmount);

    if (isNaN(vendorIdNum) || isNaN(projectIdNum) || isNaN(totalAmountNum)) {
      return NextResponse.json(
        { error: "Invalid input values: vendorId, projectId, and totalAmount must be numbers" },
        { status: 400 }
      );
    }

    // ✅ Validate file size
    if (file.size === 0) {
      return NextResponse.json({ error: "Uploaded file is empty" }, { status: 400 });
    }

    // ✅ Read file buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileKey = `uploads/${randomUUID()}-${file.name}`;

    // ✅ Upload file to S3
    const uploadResult = await uploadToS3(buffer, fileKey, file.type);
    if (!uploadResult.success) {
      return NextResponse.json(
        { error: "Failed to upload file to S3" },
        { status: 500 }
      );
    }

    // ✅ Save to database
    const performa = await prisma.performa.create({
      data: {
        vendorId: vendorIdNum,
        projectId: projectIdNum,
        fileName: file.name,
        filePath: uploadResult.url, // ✅ Use URL from S3 upload
        fileKey: fileKey,
        fileSize: file.size, // ✅ Use file.size instead of buffer.length
        mimeType: file.type,
        totalAmount: totalAmountNum,
        status: "PENDING",
        notes: notes.toString(),
        validUntil: validUntil ? new Date(validUntil.toString()) : null,
      },
    });

    return NextResponse.json(performa, { status: 201 });
  } catch (error) {
    console.error("Error uploading performa:", error);
    return NextResponse.json(
      { error: `Failed to upload performa: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}
