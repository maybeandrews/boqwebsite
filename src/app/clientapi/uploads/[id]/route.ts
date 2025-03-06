import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { deleteFromS3 } from "@/lib/s3-config";

// Use a single instance of PrismaClient (Singleton Pattern)
const prisma = new PrismaClient();

// GET route to fetch a specific Performa
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json({ error: "Valid Performa ID is required" }, { status: 400 });
    }

    const performa = await prisma.performa.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            name: true,
            description: true,
          },
        },
      },
    });

    if (!performa) {
      return NextResponse.json({ error: "Performa not found" }, { status: 404 });
    }

    return NextResponse.json(performa);
  } catch (error) {
    console.error("Error fetching Performa:", error);
    return NextResponse.json({ error: "Failed to fetch Performa" }, { status: 500 });
  }
}

// DELETE route to remove a Performa
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const vendorId = Number(req.nextUrl.searchParams.get("vendorId")); // ✅ Use `req.nextUrl`

    if (isNaN(id) || isNaN(vendorId)) {
      return NextResponse.json({ error: "Valid Performa ID and Vendor ID are required" }, { status: 400 });
    }

    const performa = await prisma.performa.findFirst({
      where: { id, vendorId },
    });

    if (!performa) {
      return NextResponse.json({ error: "Performa not found or unauthorized" }, { status: 404 });
    }

    // Delete file from S3
    try {
      await deleteFromS3(performa.fileKey);
    } catch (fileError) {
      console.error("Error deleting file from S3:", fileError);
    }

    // Delete Performa from database
    await prisma.performa.delete({ where: { id } });

    return NextResponse.json({ message: "Performa deleted successfully" });
  } catch (error) {
    console.error("Error deleting Performa:", error);
    return NextResponse.json({ error: "Failed to delete Performa" }, { status: 500 });
  }
}

// PATCH route to update Performa status
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Valid Performa ID is required" }, { status: 400 });
    }

    const body = await req.json().catch(() => null); // ✅ Handle JSON parsing safely
    if (!body) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { status, notes } = body;

    if (status && !["PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED", "EXPIRED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const updatedPerforma = await prisma.performa.update({
      where: { id },
      data: { status, notes },
    });

    return NextResponse.json(updatedPerforma);
  } catch (error) {
    console.error("Error updating Performa:", error);
    return NextResponse.json({ error: "Failed to update Performa" }, { status: 500 });
  }
}
