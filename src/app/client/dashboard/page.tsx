"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Define Project type
type Project = {
  id: number;
  name: string;
  description?: string;
  status: string;
  boqs: { id: number; fileName: string; fileUrl: string }[];
};

export default function ClientDashboard() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[] | null>(null); // ✅ Start with null to avoid mismatches
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const vendorId = 2; // Replace with actual vendor ID
        const response = await fetch(`/api/clientdashboard?vendorId=${vendorId}`, {
          cache: "no-store", // Prevents SSR caching issues
        });

        if (!response.ok) throw new Error("Failed to fetch projects");

        const data = await response.json();
        if (data?.projects) {
          setProjects(data.projects);
        }
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchProjects();
  }, []);

  // ✅ Avoid rendering until projects are fetched
  if (!projects) {
    return (
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-10">Main Dashboard</h1>
        {error ? (
          <p className="text-center text-red-500">Error: {error}</p>
        ) : (
          <p className="text-center text-gray-500">Loading projects...</p>
        )}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-10">Main Dashboard</h1>

      <div className="flex flex-col lg:flex-row justify-between space-y-6 lg:space-y-0 lg:space-x-6">
        {/* Project Details Card */}
        <Card className="lg:w-1/3 shadow-md">
          <div className="w-full h-full flex flex-col justify-start items-center gap-4 p-4">
            {selectedProject ? (
              <>
                <h1 className="text-lg font-semibold">{selectedProject.name}</h1>
                <p className="text-sm">Status: {selectedProject.status}</p>
                {selectedProject.boqs.length > 0 ? (
                  <Link
                    href={selectedProject.boqs[0].fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="text-blue-500 hover:underline">Download BOQ</span>
                  </Link>
                ) : (
                  <p className="text-sm text-gray-500">No BOQ available</p>
                )}
              </>
            ) : (
              <h1 className="text-lg font-semibold">Select a project to view details</h1>
            )}
          </div>
        </Card>

        {/* Projects List */}
        <div className="lg:w-2/3 grid gap-4 md:grid-cols-1 lg:grid-cols-2">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="shadow-md cursor-pointer transition-transform hover:scale-105"
              onClick={() => setSelectedProject(project)}
            >
              <CardHeader>
                <CardTitle>{project.name}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p>
                  <span className="font-semibold">Status:</span> {project.status}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Upload Button */}
      <div className="fixed bottom-20 right-4 z-50">
        <Button onClick={() => router.push("/client/upload")} className="tooltip-upload">
          Upload
        </Button>
      </div>
    </div>
  );
}
