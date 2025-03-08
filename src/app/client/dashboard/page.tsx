"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Define Project type with BOQ categories
type Project = {
    id: number;
    name: string;
    description?: string;
    status: string;
    boqs: {
        id: number;
        fileName: string;
        fileUrl: string;
        category?: string; // Added category field
    }[];
};

export default function ClientDashboard() {
    const router = useRouter();
    const [projects, setProjects] = useState<Project[] | null>(null);
    const [selectedProject, setSelectedProject] = useState<Project | null>(
        null
    );
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const sessionRes = await fetch("/api/auth/session");
                const session = await sessionRes.json();

                if (!session?.user?.id) {
                    toast.error("You must be logged in to view projects");
                    return;
                }

                const response = await fetch(
                    `/api/clientdashboard?vendorId=${session.user.id}`,
                    {
                        cache: "no-store",
                    }
                );

                if (!response.ok) throw new Error("Failed to fetch projects");

                const data = await response.json();
                if (data?.projects) {
                    setProjects(data.projects);
                }
            } catch (err: any) {
                setError(err.message);
                toast.error("Failed to load projects");
            }
        };

        fetchProjects();
    }, []);

    if (!projects) {
        return (
            <div className="container mx-auto px-4 py-10">
                <h1 className="text-3xl font-bold mb-10 text-gray-800">
                    Client Dashboard
                </h1>
                <Card className="w-full max-w-3xl mx-auto shadow-lg">
                    <CardContent className="pt-6">
                        {error ? (
                            <div className="flex flex-col items-center justify-center p-6">
                                <div className="text-red-500 text-xl mb-2">
                                    Error
                                </div>
                                <p className="text-center text-red-500">
                                    {error}
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-6">
                                <div className="animate-pulse w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
                                <p className="text-center text-gray-500">
                                    Loading your projects...
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-10">
            <h1 className="text-3xl font-bold mb-10 text-gray-800">
                Client Dashboard
            </h1>

            <div className="flex flex-col lg:flex-row justify-between space-y-6 lg:space-y-0 lg:space-x-8">
                {/* Project Details Panel */}
                <Card className="lg:w-1/3 shadow-lg bg-white border-0">
                    <CardHeader className="bg-gray-50 rounded-t-lg border-b">
                        <CardTitle className="text-xl">
                            Project Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {selectedProject ? (
                            <div className="p-6 space-y-6">
                                <div>
                                    <h2 className="text-2xl font-semibold text-gray-800">
                                        {selectedProject.name}
                                    </h2>
                                    <Badge
                                        variant={
                                            selectedProject.status === "active"
                                                ? "default" // green
                                                : selectedProject.status ===
                                                  "pending"
                                                ? "secondary" // yellow/orange
                                                : "outline" // neutral
                                        }
                                        className={`mt-2 ${
                                            selectedProject.status === "active"
                                                ? "bg-green-100 text-green-800 hover:bg-green-100"
                                                : selectedProject.status ===
                                                  "pending"
                                                ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                                                : ""
                                        }`}
                                    >
                                        {selectedProject.status}
                                    </Badge>
                                </div>

                                {selectedProject.description && (
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">
                                            Description
                                        </h3>
                                        <p className="text-gray-700">
                                            {selectedProject.description}
                                        </p>
                                    </div>
                                )}

                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                                        Bill of Quantities
                                    </h3>

                                    {selectedProject.boqs.length > 0 ? (
                                        <div className="space-y-4">
                                            {selectedProject.boqs.map((boq) => (
                                                <div
                                                    key={boq.id}
                                                    className="bg-gray-50 p-3 rounded-md"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <div className="font-medium">
                                                                {boq.fileName}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {boq.category ||
                                                                    "General"}
                                                            </div>
                                                        </div>
                                                        <Link
                                                            href={boq.fileUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                            >
                                                                Download
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-4 bg-gray-50 rounded-md">
                                            <p className="text-gray-500">
                                                No BOQ files available
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-12 text-center">
                                <div className="text-gray-400 mb-4">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="48"
                                        height="48"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                        <polyline points="14 2 14 8 20 8"></polyline>
                                        <line
                                            x1="16"
                                            y1="13"
                                            x2="8"
                                            y2="13"
                                        ></line>
                                        <line
                                            x1="16"
                                            y1="17"
                                            x2="8"
                                            y2="17"
                                        ></line>
                                        <line
                                            x1="10"
                                            y1="9"
                                            x2="8"
                                            y2="9"
                                        ></line>
                                    </svg>
                                </div>
                                <h2 className="text-lg font-medium text-gray-900">
                                    Select a project
                                </h2>
                                <p className="mt-1 text-sm text-gray-500">
                                    Choose a project from the list to view its
                                    details
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Projects Grid */}
                <div className="lg:w-2/3 grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                    {projects.map((project) => (
                        <Card
                            key={project.id}
                            className={`shadow-md cursor-pointer transition-all hover:shadow-lg border-l-4 ${
                                selectedProject?.id === project.id
                                    ? "border-l-blue-500"
                                    : "border-l-transparent"
                            }`}
                            onClick={() => setSelectedProject(project)}
                        >
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-lg">
                                        {project.name}
                                    </CardTitle>
                                    <Badge
                                        variant={
                                            project.status === "active"
                                                ? "default"
                                                : project.status === "pending"
                                                ? "secondary"
                                                : "outline"
                                        }
                                        className={`${
                                            project.status === "active"
                                                ? "bg-green-100 text-green-800 hover:bg-green-100"
                                                : project.status === "pending"
                                                ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                                                : ""
                                        }`}
                                    >
                                        {project.status}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                                {project.description && (
                                    <CardDescription className="line-clamp-2 mt-1 mb-2">
                                        {project.description}
                                    </CardDescription>
                                )}
                                <div className="flex items-center text-sm text-gray-500 mt-2">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="mr-2"
                                    >
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                        <polyline points="14 2 14 8 20 8"></polyline>
                                        <line
                                            x1="16"
                                            y1="13"
                                            x2="8"
                                            y2="13"
                                        ></line>
                                        <line
                                            x1="16"
                                            y1="17"
                                            x2="8"
                                            y2="17"
                                        ></line>
                                        <polyline points="10 9 9 9 8 9"></polyline>
                                    </svg>
                                    {project.boqs.length} BOQ{" "}
                                    {project.boqs.length === 1
                                        ? "file"
                                        : "files"}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
