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
];

export default function ClientDashboard() {
  const router = useRouter();

  return (
    <>
      <div>
        <h1 className="text-3xl font-bold mb-10">Main Dashboard</h1>
      </div>
      <div className="flex justify-between space-x-6">
        <div className="w-[440px] h-screen flex flex-col justify-start items-center gap-4">
          <h1 className="text-lg font-semibold">Projects Open</h1>
          <Link href="#">
            <span>Download BOQ</span>
          </Link>
        </div>

        <div className="grid gap-1 md:grid-cols-1 lg:grid-cols-1 w-1/2 h-full">
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

        {/* Floating Button for Navigation */}
        <div className="relative h-screen">
          <Button
            className="absolute bottom-10 right-4 z-50"
            onClick={() => router.push("/upload")}
          >
            +
          </Button>
        </div>
      </div>
    </>
  );
}
