"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Define the Project type
type Project = {
  name: string;
  status: string;
};

// Sample projects list
const projects: Project[] = [
  { name: "Project 1", status: "Pending" },
  { name: "Project 2", status: "Approved" },
  { name: "Project 3", status: "Not proceeding with the quote" },
  { name: "Project 4", status: "Not proceeding with the quote" },
  { name: "Project 5", status: "Not proceeding with the quote" },
];

export default function ClientDashboard() {
  const router = useRouter();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  return (
    <>
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
                </>
              ) : (
                <h1 className="text-lg font-semibold">Select a project to view details</h1>
              )}
              <Link href="#">
                <span className="text-blue-500 hover:underline">Download BOQ</span>
              </Link>
            </div>
          </Card>
          
          {/* Projects List */}
          <div className="lg:w-2/3 grid gap-4 md:grid-cols-1 lg:grid-cols-2">
            {projects.map((project) => (
              <Card 
                key={project.name} 
                className="shadow-md cursor-pointer" 
                onClick={() => setSelectedProject(project)}
              >
                <CardHeader>
                  <CardTitle>{project.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <p>
                    <span className="font-semibold">Quote for:</span> {project.name} - {project.status}
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
    </>
  );
}