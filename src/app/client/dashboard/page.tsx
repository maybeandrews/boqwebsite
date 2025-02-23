"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
const projects = [
  { name: "Project 1", status: "pending" },
  { name: "Project 2", status: "Approved" },
  { name: "Project 3", status: "Not proceeding with the quote" },
  { name: "Project 4", status: "Not proceeding with the quote" },
  { name: "Project 5", status: "Not proceeding with the quote" }
];

export default function ClientDashboard() {
  const router = useRouter();

  return (
    <>
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-10">Main Dashboard</h1>
        <div className="flex flex-col lg:flex-row justify-between space-y-6 lg:space-y-0 lg:space-x-6">
          <Card className="lg:w-1/3 shadow-md">
            <div className="w-full h-full flex flex-col justify-start items-center gap-4 p-4">
              <h1 className="text-lg font-semibold">Projects Open</h1>
              <Link href="#">
                <span className="text-blue-500 hover:underline">Download BOQ</span>
              </Link>
            </div>
          </Card>
          <div className="lg:w-2/3 grid gap-4 md:grid-cols-1 lg:grid-cols-2">
            {projects.map((project) => (
              <Card key={project.name} className="shadow-md">
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
        <div className="fixed bottom-20 right-4 z-50">
          <Button onClick={() => router.push("/client/upload")} className="tooltip-upload">Upload</Button>
        </div>
      </div>
    </>
  );
}
