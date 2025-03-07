"use client";

import { useState, useEffect } from "react";
import { Dialog } from "@/components/ui/dialog";
import { ProjectDetailsDialog } from "@/components/project-details-dialog";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateProjectDialog } from "@/components/create-project-dialog";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Project = {
    id: string | number;
    name: string;
    description: string;
    vendors: number;
    quotes: number;
    deadline: string;
    tags: string[];
};

export default function DashboardPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState<string | number | null>(null);

    // Fetch projects from API
    useEffect(() => {
        const fetchProjects = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch("/api/projects");
                if (!response.ok) {
                    throw new Error("Failed to fetch projects");
                }
                const data = await response.json();

                // Transform the data to match the Project type definition
                interface ApiProject {
                    id: string | number;
                    name: string;
                    description?: string;
                    vendors?: { id: string | number }[];
                    quotes?: { id: string | number }[];
                    deadline: string;
                    tags?: string[];
                }

                const transformedProjects: Project[] = (data as ApiProject[]).map(
                    (project: ApiProject) => ({
                        id: project.id,
                        name: project.name,
                        description: project.description || "",
                        vendors: project.vendors ? project.vendors.length : 0,
                        quotes: project.quotes ? project.quotes.length : 0,
                        deadline: project.deadline,
                        tags: project.tags || [],
                    })
                );

                setProjects(transformedProjects);
            } catch (err) {
                setError("Error loading projects. Please try again later.");
                console.error("Error fetching projects:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProjects();
    }, []);

    const handleProjectCreated = () => {
        setIsLoading(true);
        fetchProjects();
    };

    const confirmDeleteProject = (projectId: string | number) => {
        setProjectToDelete(projectId);
        setShowDeleteConfirm(true);
    };

    const handleDeleteProject = async () => {
        if (!projectToDelete) return;

        try {
            const response = await fetch(`/api/projects/${projectToDelete}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to delete project");
            }

            fetchProjects();
            setSelectedProject(null);
            setShowDeleteConfirm(false);
            setProjectToDelete(null);
        } catch (err) {
            console.error("Error deleting project:", err);
            // You could set an error state here to show to the user
        }
    };

    // Format date from API to local date string
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Projects Dashboard</h1>
                <CreateProjectDialog onProjectCreated={handleProjectCreated} />
            </div>

            {isLoading && <p>Loading projects...</p>}
            {error && <p className="text-red-500">{error}</p>}

            {!isLoading && !error && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {projects.length > 0 ? (
                        projects.map((project) => (
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
                                                <p className="text-sm font-medium">Vendors</p>
                                                <p className="text-2xl font-bold">{project.vendors}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">Quotes</p>
                                                <p className="text-2xl font-bold">{project.quotes}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Deadline: {formatDate(project.deadline)}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <p className="col-span-3 text-center text-muted-foreground">
                            No projects found. Create a new project to get started.
                        </p>
                    )}
                </div>
            )}

            {/* Project Details Dialog */}
            <Dialog open={!!selectedProject} onOpenChange={(open) => !open && setSelectedProject(null)}>
                {selectedProject && (
                    <ProjectDetailsDialog
                        project={selectedProject}
                        onClose={() => setSelectedProject(null)}
                        onDelete={() => confirmDeleteProject(selectedProject.id)}
                    />
                )}
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the project and all associated data. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteProject} className="bg-red-600 hover:bg-red-700">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
