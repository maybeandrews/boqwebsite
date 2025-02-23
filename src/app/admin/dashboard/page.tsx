"use client";

import React, { useState, useReducer } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Send } from "lucide-react";

type Project = {
    id: string;
    name: string;
    description: string;
    vendors: number;
    quotes: number;
    deadline: string;
    tags: string[];
};

const initialProjects: Project[] = [
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

type ProjectAction =
    | { type: "ADD_PROJECT"; payload: Project }
    | { type: "EDIT_PROJECT"; payload: Project };

const projectReducer = (state: Project[], action: ProjectAction): Project[] => {
    switch (action.type) {
        case "ADD_PROJECT":
            return [...state, action.payload];
        case "EDIT_PROJECT":
            return state.map((project) =>
                project.id === action.payload.id ? action.payload : project
            );
        default:
            return state;
    }
};

const CreateProjectDialog: React.FC<{ onCreate: (project: Project) => void }> = ({ onCreate }) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [vendors, setVendors] = useState(0);
    const [quotes, setQuotes] = useState(0);
    const [deadline, setDeadline] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    const handleCreate = () => {
        const newProject = {
            id: Date.now().toString(),
            name,
            description,
            vendors,
            quotes,
            deadline,
            tags,
        };
        onCreate(newProject);
        setIsOpen(false);
        // Reset form fields
        setName("");
        setDescription("");
        setVendors(0);
        setQuotes(0);
        setDeadline("");
        setTags([]);
    };

    return (
        <>
            <Button onClick={() => setIsOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Project
            </Button>
            {isOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded shadow-lg">
                        <h2 className="text-xl font-bold mb-4">Create Project</h2>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Vendors</label>
                            <input
                                type="number"
                                value={vendors}
                                onChange={(e) => setVendors(Number(e.target.value))}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Quotes</label>
                            <input
                                type="number"
                                value={quotes}
                                onChange={(e) => setQuotes(Number(e.target.value))}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Deadline</label>
                            <input
                                type="date"
                                value={deadline}
                                onChange={(e) => setDeadline(e.target.value)}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Tags</label>
                            <input
                                type="text"
                                value={tags.join(", ")}
                                onChange={(e) => setTags(e.target.value.split(", "))}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setIsOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreate}>Create</Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

const EditProjectDialog: React.FC<{ project: Project; onSave: (project: Project) => void; onClose: () => void }> = ({ project, onSave, onClose }) => {
    const [name, setName] = useState(project.name);
    const [description, setDescription] = useState(project.description);
    const [vendors, setVendors] = useState(project.vendors);
    const [quotes, setQuotes] = useState(project.quotes);
    const [deadline, setDeadline] = useState(project.deadline);
    const [tags, setTags] = useState<string[]>(project.tags);

    const handleSave = () => {
        const updatedProject = {
            ...project,
            name,
            description,
            vendors,
            quotes,
            deadline,
            tags,
        };
        onSave(updatedProject);
        onClose();
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded shadow-lg">
                <h2 className="text-xl font-bold mb-4">Edit Project</h2>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-2 border rounded"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full p-2 border rounded"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Vendors</label>
                    <input
                        type="number"
                        value={vendors}
                        onChange={(e) => setVendors(Number(e.target.value))}
                        className="w-full p-2 border rounded"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Quotes</label>
                    <input
                        type="number"
                        value={quotes}
                        onChange={(e) => setQuotes(Number(e.target.value))}
                        className="w-full p-2 border rounded"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Deadline</label>
                    <input
                        type="date"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        className="w-full p-2 border rounded"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Tags</label>
                    <input
                        type="text"
                        value={tags.join(", ")}
                        onChange={(e) => setTags(e.target.value.split(", "))}
                        className="w-full p-2 border rounded"
                    />
                </div>
                <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave}>Save</Button>
                </div>
            </div>
        </div>
    );
};

export default function DashboardPage() {
    const [projects, dispatch] = useReducer(projectReducer, initialProjects);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    const handleCreateProject = (newProject: Project) => {
        dispatch({ type: "ADD_PROJECT", payload: newProject });
    };

    const handleEditProject = (project: Project) => {
        setSelectedProject(project);
        setIsEditOpen(true);
    };

    const handleSaveProject = (updatedProject: Project) => {
        dispatch({ type: "EDIT_PROJECT", payload: updatedProject });
        setIsEditOpen(false);
        setSelectedProject(null);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Projects Dashboard</h1>
                <CreateProjectDialog onCreate={handleCreateProject} />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {projects.map((project) => (
                    <Card
                        key={project.id}
                        className="hover:shadow-lg transition-shadow"
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
                        <CardFooter className="flex justify-end">
                            <Button variant="outline" size="sm" onClick={() => handleEditProject(project)}>
                                <Edit className="h-4 w-4 mr-2" />

                                Edit
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {isEditOpen && selectedProject && (
                <EditProjectDialog
                    project={selectedProject}
                    onSave={handleSaveProject}
                    onClose={() => setIsEditOpen(false)}
                />
            )}
        </div>
    );
}