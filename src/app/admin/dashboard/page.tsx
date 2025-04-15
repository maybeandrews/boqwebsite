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
    groupName?: string | undefined; // Removed null to match ProjectDetailsDialog type
};

export default function DashboardPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProject, setSelectedProject] = useState<Project | null>(
        null
    );
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState<
        string | number | null
    >(null);
    const [selectedGroup, setSelectedGroup] = useState<string>("");

    // Define fetchProjects outside of useEffect so it can be called from other functions
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
                (project: any) => ({
                    id: project.id,
                    name: project.name,
                    description: project.description || "",
                    vendors: project.vendors ? project.vendors.length : 0,
                    quotes: project.quotes ? project.quotes.length : 0,
                    deadline: project.deadline,
                    tags: project.tags || [],
                    groupName: project.groupName || undefined, // Assign undefined instead of null
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

    // Fetch projects on component mount
    useEffect(() => {
        fetchProjects();
    }, []);

    const handleProjectCreated = () => {
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

    // Get unique group names from projects
    const groupNames = Array.from(
        new Set(projects.map((p) => p.groupName).filter(Boolean))
    );
    // Filter projects by selected group
    const filteredProjects = selectedGroup
        ? projects.filter((p) => p.groupName === selectedGroup)
        : projects;

    return (
        <div className="flex">
            {/* Sidebar for project groups */}
            <aside className="w-56 pr-6 border-r hidden md:block">
                <div className="mb-4">
                    <h2 className="text-lg font-semibold mb-2">
                        Project Groups
                    </h2>
                    <button
                        className={`block w-full text-left px-3 py-2 rounded hover:bg-gray-100 ${
                            selectedGroup === "" ? "bg-gray-200 font-bold" : ""
                        }`}
                        onClick={() => setSelectedGroup("")}
                    >
                        All Projects
                    </button>
                    {groupNames.map((group) => (
                        <button
                            key={group}
                            className={`block w-full text-left px-3 py-2 rounded hover:bg-gray-100 ${
                                selectedGroup === group
                                    ? "bg-gray-200 font-bold"
                                    : ""
                            }`}
                            onClick={() => setSelectedGroup(group || "")}
                        >
                            {group}
                        </button>
                    ))}
                </div>
            </aside>
            <main className="flex-1 p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">Projects Dashboard</h1>
                    <CreateProjectDialog
                        onProjectCreated={handleProjectCreated}
                    />
                </div>

                {isLoading && <p>Loading projects...</p>}
                {error && <p className="text-red-500">{error}</p>}

                {!isLoading && !error && (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredProjects.length > 0 ? (
                            filteredProjects.map((project) => (
                                <Card
                                    key={project.id}
                                    className="hover:shadow-lg transition-shadow cursor-pointer"
                                    onClick={() => setSelectedProject(project)}
                                >
                                    <CardHeader>
                                        <div>
                                            <CardTitle>
                                                {project.name}
                                            </CardTitle>
                                            <CardDescription className="mt-2">
                                                {project.description}
                                            </CardDescription>
                                            {project.groupName && (
                                                <div className="mt-1 text-xs text-gray-500">
                                                    Group: {project.groupName}
                                                </div>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="flex flex-wrap gap-2">
                                                {project.tags.map((tag) => (
                                                    <Badge
                                                        key={tag}
                                                        variant="outline"
                                                    >
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
                                                    {formatDate(
                                                        project.deadline
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <p className="col-span-3 text-center text-muted-foreground">
                                No projects found. Create a new project to get
                                started.
                            </p>
                        )}
                    </div>
                )}

                {/* Project Details Dialog */}
                <Dialog
                    open={!!selectedProject}
                    onOpenChange={(open) => !open && setSelectedProject(null)}
                >
                    {selectedProject && (
                        <ProjectDetailsDialog
                            project={selectedProject}
                            onClose={() => setSelectedProject(null)}
                            onDelete={() =>
                                confirmDeleteProject(selectedProject.id)
                            }
                            onProjectUpdated={fetchProjects}
                        />
                    )}
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <AlertDialog
                    open={showDeleteConfirm}
                    onOpenChange={setShowDeleteConfirm}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete the project and all
                                associated data. This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDeleteProject}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </main>
        </div>
    );
}
