import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSignedFileUrl } from "@/lib/s3-config"; // Use signed URLs for private PDFs

export async function GET(req: NextRequest) {
  try {
    // Extract vendor ID from query params or authentication middleware
    const vendorId = parseInt(req.nextUrl.searchParams.get("vendorId") || "0", 10);
    if (!vendorId) return NextResponse.json({ success: false, message: "Vendor ID is required" }, { status: 400 });

    // Fetch only the projects assigned to this vendor
    const assignedProjects = await prisma.vendorProject.findMany({
      where: { vendorId },
      include: {
        project: {
          include: {
            boqs: true, // Get associated BOQs (PDFs)
            quotes: true,
            performas: true,
          },
        },
      },
    });

    // Transform the data to include signed S3 URLs for PDFs
    const projectsWithFiles = await Promise.all(
      assignedProjects.map(async (vp) => {
        const project = vp.project;
        return {
          id: project.id,
          name: project.name,
          description: project.description,
          deadline: project.deadline,
          tags: project.tags,
          boqs: await Promise.all(
            project.boqs.map(async (boq) => ({
              id: boq.id,
              fileName: boq.fileName,
              fileUrl: await getSignedFileUrl(boq.filePath), // Generate signed URL
            }))
          ),
          quotes: await Promise.all(
            project.quotes.map(async (quote) => ({
              id: quote.id,
              fileName: quote.fileName,
              fileUrl: await getSignedFileUrl(quote.filePath),
            }))
          ),
          performas: await Promise.all(
            project.performas.map(async (performa) => ({
              id: performa.id,
              fileName: performa.fileName,
              fileUrl: await getSignedFileUrl(performa.filePath),
            }))
          ),
        };
      })
    );

    return NextResponse.json({ success: true, projects: projectsWithFiles });
  } catch (error) {
    console.error("❌ Error fetching vendor projects:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
