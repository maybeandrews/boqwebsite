import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSignedFileUrl } from "@/lib/s3-config";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const projectId = parseInt(params.id, 10);
    const vendorId = parseInt(req.nextUrl.searchParams.get("vendorId") || "0", 10);

    if (!vendorId || !projectId) {
      return NextResponse.json({ success: false, message: "Vendor ID and Project ID are required" }, { status: 400 });
    }

    // Verify vendor is assigned to the project
    const assignedProject = await prisma.vendorProject.findFirst({
      where: { vendorId, projectId },
      include: { project: { include: { boqs: true, quotes: true, performas: true } } },
    });

    if (!assignedProject) {
      return NextResponse.json({ success: false, message: "Access denied" }, { status: 403 });
    }

    const project = assignedProject.project;
    const projectDetails = {
      id: project.id,
      name: project.name,
      description: project.description,
      deadline: project.deadline,
      tags: project.tags,
      boqs: await Promise.all(
        project.boqs.map(async (boq) => ({
          id: boq.id,
          fileName: boq.fileName,
          fileUrl: await getSignedFileUrl(boq.filePath),
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

    return NextResponse.json({ success: true, project: projectDetails });
  } catch (error) {
    console.error("❌ Error fetching project details:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
