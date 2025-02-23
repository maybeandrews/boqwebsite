"use client";
import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { ProjectDetailsDialog } from "@/components/project-details-dialog";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateProjectDialog } from "@/components/create-project-dialog";

type Project = {
    id: string;
    name: string;
    description: string;
    vendors: number;
    quotes: number;
    deadline: string;
    tags: string[];
};

const projects: Project[] = [
    {
        id: "1",
        name: "Project A",
        description: "Construction of new office building",
        vendors: 5,
        quotes: 3,
        deadline: "2023-08-31",
        tags: ["Construction", "Electrical"],
    },
    {
        id: "2",
        name: "Project B",
        vendors: 8,
        quotes: 6,
        deadline: "2023-09-15",
        description: "",
        tags: [],
    },
    {
        id: "3",
        name: "Project C",
        vendors: 3,
        quotes: 2,
        deadline: "2023-09-30",
        description: "",
        tags: [],
    },
];

export default function DashboardPage() {
    const [selectedProject, setSelectedProject] = useState<Project | null>(
        null
    );

    const handleDeleteProject = (projectId: string) => {
        // Add delete logic here
        console.log("Deleting project:", projectId);
        setSelectedProject(null);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Projects Dashboard</h1>
                <CreateProjectDialog /> {/* Add this line */}
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                    <Card
                        key={project.id}
                        className="hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => setSelectedProject(project)}
                    >
                        <CardHeader>
                            <div>
                                <CardTitle>{project.name}</CardTitle>
                                <CardDescription className="mt-2">
                                    {project.description}
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex flex-wrap gap-2">
                                    {project.tags.map((tag) => (
                                        <Badge key={tag} variant="outline">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium">
                                            Vendors
                                        </p>
                                        <p className="text-2xl font-bold">
                                            {project.vendors}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">
                                            Quotes
                                        </p>
                                        <p className="text-2xl font-bold">
                                            {project.quotes}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Deadline:{" "}
                                        {new Date(
                                            project.deadline
                                        ).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Project Details Dialog */}
            <Dialog
                open={!!selectedProject}
                onOpenChange={() => setSelectedProject(null)}
            >
                {selectedProject && (
                    <ProjectDetailsDialog
                        project={selectedProject}
                        //quotes={[]} // Add your quotes data here
                        onClose={() => setSelectedProject(null)}
                        onDelete={handleDeleteProject}
                    />
                )}
            </Dialog>
        </div>
    );
}
