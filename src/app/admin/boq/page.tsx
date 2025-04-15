//admin/boq page.tsx
"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Download, Trash2 } from "lucide-react";

// Define types based on your API schema
type Project = {
    id: number;
    name: string;
    tags: string[];
};

type BOQ = {
    id: number;
    projectId: number;
    fileName: string;
    filePath: string;
    category: string;
    notes: string;
    downloadUrl?: string;
    project?: Project;
};

// Add type for BOQItem
interface BOQItemInput {
    slNo: number;
    workDetail: string;
    amount: number;
}

export default function BOQPage() {
    // State for API data
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProject, setSelectedProject] = useState<string>("");
    const [projectTags, setProjectTags] = useState<string[]>([]);
    const [uploadedBOQs, setUploadedBOQs] = useState<BOQ[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingProject, setIsLoadingProject] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // State for form handling
    const [files, setFiles] = useState<{ [key: string]: File | null }>({});
    const [notes, setNotes] = useState<{ [key: string]: string }>({});
    // Add state for BOQ items per category
    const [boqItems, setBoqItems] = useState<{
        [category: string]: BOQItemInput[];
    }>({});

    // Fetch projects on component mount
    useEffect(() => {
        fetchProjects();
    }, []);

    // Fetch project details and BOQs when a project is selected
    useEffect(() => {
        if (selectedProject) {
            fetchProjectDetails(selectedProject);
            fetchBOQs(selectedProject);
        } else {
            setProjectTags([]);
            setUploadedBOQs([]);
        }
    }, [selectedProject]);

    // Fetch projects from API
    const fetchProjects = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch("/api/projects");
            if (!response.ok) {
                throw new Error("Failed to fetch projects");
            }
            const data = await response.json();
            setProjects(data);
        } catch (err) {
            console.error("Error fetching projects:", err);
            setError("Error loading projects. Please try again.");
            toast.error("Failed to load projects");
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch specific project details to get tags
    const fetchProjectDetails = async (projectId: string) => {
        setIsLoadingProject(true);
        try {
            const response = await fetch(`/api/projects/${projectId}`);
            if (!response.ok) {
                throw new Error("Failed to fetch project details");
            }
            const data = await response.json();

            // Set project tags as categories
            if (data.tags && Array.isArray(data.tags) && data.tags.length > 0) {
                setProjectTags(data.tags);
            } else {
                setProjectTags([]);
                toast.warning(
                    "This project has no categories defined. Please add tags to the project first."
                );
            }
        } catch (err) {
            console.error("Error fetching project details:", err);
            toast.error("Failed to load project categories");
            setProjectTags([]);
        } finally {
            setIsLoadingProject(false);
        }
    };

    // Fetch BOQs for a specific project from API
    const fetchBOQs = async (projectId: string) => {
        setIsLoading(true);
        try {
            const response = await fetch(
                `/api/boqs?projectId=${projectId}&includeUrls=true`
            );
            if (!response.ok) {
                throw new Error("Failed to fetch BOQs");
            }
            const data = await response.json();
            setUploadedBOQs(data);
        } catch (err) {
            console.error("Error fetching BOQs:", err);
            toast.error("Failed to load BOQs");
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (
        category: string,
        event: ChangeEvent<HTMLInputElement>
    ) => {
        setFiles({
            ...files,
            [category]: event.target.files ? event.target.files[0] : null,
        });
    };

    const handleNoteChange = (
        category: string,
        event: ChangeEvent<HTMLTextAreaElement>
    ) => {
        setNotes({ ...notes, [category]: event.target.value });
    };

    // Handler to add a new row
    const handleAddBOQItem = (category: string) => {
        setBoqItems((prev) => ({
            ...prev,
            [category]: [
                ...(prev[category] || []),
                {
                    slNo: (prev[category]?.length || 0) + 1,
                    workDetail: "",
                    amount: 0,
                },
            ],
        }));
    };

    // Handler to update a row
    const handleBOQItemChange = (
        category: string,
        idx: number,
        field: keyof BOQItemInput,
        value: string | number
    ) => {
        setBoqItems((prev) => {
            const items = [...(prev[category] || [])];
            items[idx] = {
                ...items[idx],
                [field]:
                    field === "amount"
                        ? 0
                        : field === "slNo"
                        ? Number(value)
                        : value,
            };
            return { ...prev, [category]: items };
        });
    };

    // Handler to remove a row
    const handleRemoveBOQItem = (category: string, idx: number) => {
        setBoqItems((prev) => {
            const items = [...(prev[category] || [])];
            items.splice(idx, 1);
            return { ...prev, [category]: items };
        });
    };

    const handleUpload = async () => {
        if (!selectedProject) {
            toast.error("Please select a project");
            return;
        }

        if (projectTags.length === 0) {
            toast.error(
                "This project has no categories. Please add tags to the project first."
            );
            return;
        }

        const categoriesToUpload = projectTags.filter(
            (category) => files[category]
        );

        if (categoriesToUpload.length === 0) {
            toast.error("Please upload at least one BOQ file");
            return;
        }

        setIsUploading(true);

        try {
            // Upload each BOQ file
            for (const category of categoriesToUpload) {
                const formData = new FormData();
                formData.append("projectId", selectedProject);
                formData.append("category", category);
                formData.append("notes", notes[category] || "");
                formData.append("file", files[category] as File);
                // Add BOQ items as JSON string
                formData.append(
                    "boqItems",
                    JSON.stringify(boqItems[category] || [])
                );

                const response = await fetch("/api/boqs", {
                    method: "POST",
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error(`Failed to upload ${category} BOQ`);
                }
            }

            toast.success("BOQs uploaded successfully");

            // Reset form and refresh BOQs
            setFiles({});
            setNotes({});
            setBoqItems({});
            fetchBOQs(selectedProject);
        } catch (err) {
            console.error("Error uploading BOQs:", err);
            toast.error("Failed to upload BOQs. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteBOQ = async (id: number) => {
        if (!confirm("Are you sure you want to delete this BOQ?")) {
            return;
        }

        try {
            const response = await fetch(`/api/boqs/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to delete BOQ");
            }

            toast.success("BOQ deleted successfully");

            // Refresh the BOQs list
            fetchBOQs(selectedProject);
        } catch (err) {
            console.error("Error deleting BOQ:", err);
            toast.error("Failed to delete BOQ");
        }
    };

    return (
        <div className="space-y-6 overflow-hidden p-6">
            <h1 className="text-3xl font-bold">BOQ Upload & Management</h1>
            <div className="grid gap-48 md:grid-cols-2">
                <div>
                    <h2 className="text-xl font-semibold mb-4">
                        Upload New BOQ
                    </h2>
                    <Select onValueChange={setSelectedProject}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a project" />
                        </SelectTrigger>
                        <SelectContent>
                            {projects.map((project) => (
                                <SelectItem
                                    key={project.id}
                                    value={project.id.toString()}
                                >
                                    {project.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {isLoadingProject ? (
                        <div className="flex items-center justify-center h-40 mt-4">
                            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                            <span className="ml-2 text-gray-500">
                                Loading project categories...
                            </span>
                        </div>
                    ) : selectedProject && projectTags.length === 0 ? (
                        <div className="text-center py-10 border rounded-lg bg-gray-50 mt-4">
                            <p className="text-gray-500">
                                This project has no categories defined.
                            </p>
                            <p className="text-sm text-gray-400 mt-1">
                                Please add tags to the project in the project
                                management section.
                            </p>
                        </div>
                    ) : (
                        selectedProject && (
                            <div className="space-y-4 mt-4">
                                {projectTags.map((category) => (
                                    <div key={category}>
                                        <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 rounded-lg">
                                            <CardContent className="pt-6">
                                                <div className="rounded-md">
                                                    <h3 className="text-lg font-medium mb-2">
                                                        {category}
                                                    </h3>
                                                    <Input
                                                        type="file"
                                                        onChange={(e) =>
                                                            handleFileChange(
                                                                category,
                                                                e
                                                            )
                                                        }
                                                        className="mb-2"
                                                        accept=".pdf,.doc,.docx,.xls,.xlsx"
                                                    />
                                                    <Textarea
                                                        placeholder="Add notes or remarks"
                                                        onChange={(e) =>
                                                            handleNoteChange(
                                                                category,
                                                                e
                                                            )
                                                        }
                                                        value={
                                                            notes[category] ||
                                                            ""
                                                        }
                                                        className="mb-2"
                                                    />
                                                    {/* BOQ Items Table */}
                                                    <div className="mb-2">
                                                        <h4 className="font-semibold mb-1">
                                                            BOQ Table
                                                        </h4>
                                                        <Table>
                                                            <TableHeader>
                                                                <TableRow>
                                                                    <TableHead>
                                                                        Sl. No
                                                                    </TableHead>
                                                                    <TableHead>
                                                                        Work
                                                                        Detail
                                                                    </TableHead>
                                                                    <TableHead>
                                                                        Amount
                                                                    </TableHead>
                                                                    <TableHead></TableHead>
                                                                </TableRow>
                                                            </TableHeader>
                                                            <TableBody>
                                                                {(
                                                                    boqItems[
                                                                        category
                                                                    ] || []
                                                                ).map(
                                                                    (
                                                                        item,
                                                                        idx
                                                                    ) => (
                                                                        <TableRow
                                                                            key={
                                                                                idx
                                                                            }
                                                                        >
                                                                            <TableCell>
                                                                                <Input
                                                                                    type="number"
                                                                                    min={
                                                                                        1
                                                                                    }
                                                                                    value={
                                                                                        item.slNo
                                                                                    }
                                                                                    onChange={(
                                                                                        e
                                                                                    ) =>
                                                                                        handleBOQItemChange(
                                                                                            category,
                                                                                            idx,
                                                                                            "slNo",
                                                                                            e
                                                                                                .target
                                                                                                .value
                                                                                        )
                                                                                    }
                                                                                    className="w-16"
                                                                                />
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                <Input
                                                                                    value={
                                                                                        item.workDetail
                                                                                    }
                                                                                    onChange={(
                                                                                        e
                                                                                    ) =>
                                                                                        handleBOQItemChange(
                                                                                            category,
                                                                                            idx,
                                                                                            "workDetail",
                                                                                            e
                                                                                                .target
                                                                                                .value
                                                                                        )
                                                                                    }
                                                                                    placeholder="Work Detail"
                                                                                />
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                <Input
                                                                                    type="number"
                                                                                    min={
                                                                                        0
                                                                                    }
                                                                                    value={
                                                                                        item.amount
                                                                                    }
                                                                                    onChange={(
                                                                                        e
                                                                                    ) =>
                                                                                        handleBOQItemChange(
                                                                                            category,
                                                                                            idx,
                                                                                            "amount",
                                                                                            e
                                                                                                .target
                                                                                                .value
                                                                                        )
                                                                                    }
                                                                                    className="w-24"
                                                                                />
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                <Button
                                                                                    type="button"
                                                                                    variant="outline"
                                                                                    size="sm"
                                                                                    onClick={() =>
                                                                                        handleRemoveBOQItem(
                                                                                            category,
                                                                                            idx
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    Remove
                                                                                </Button>
                                                                            </TableCell>
                                                                        </TableRow>
                                                                    )
                                                                )}
                                                            </TableBody>
                                                        </Table>
                                                        <Button
                                                            type="button"
                                                            variant="secondary"
                                                            size="sm"
                                                            className="mt-2"
                                                            onClick={() =>
                                                                handleAddBOQItem(
                                                                    category
                                                                )
                                                            }
                                                        >
                                                            + Add Row
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                ))}
                                <Button
                                    onClick={handleUpload}
                                    className="w-full bg-black text-white hover:bg-gray-800"
                                    disabled={
                                        isUploading ||
                                        !selectedProject ||
                                        projectTags.length === 0
                                    }
                                >
                                    {isUploading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Uploading...
                                        </>
                                    ) : (
                                        "Upload BOQs"
                                    )}
                                </Button>
                            </div>
                        )
                    )}
                </div>
                <div>
                    <h2 className="text-xl font-semibold mb-4">
                        Uploaded BOQs
                    </h2>
                    <div className="overflow-x-auto">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-40">
                                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                            </div>
                        ) : !selectedProject ? (
                            <div className="text-center py-10 border rounded-lg bg-gray-50">
                                <p className="text-gray-500">
                                    Select a project to view uploaded BOQs.
                                </p>
                            </div>
                        ) : uploadedBOQs.length === 0 ? (
                            <div className="text-center py-10 border rounded-lg bg-gray-50">
                                <p className="text-gray-500">
                                    No BOQs uploaded for this project yet.
                                </p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Category</TableHead>
                                        <TableHead>File Name</TableHead>
                                        <TableHead>Notes</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {uploadedBOQs.map((boq) => (
                                        <TableRow key={boq.id}>
                                            <TableCell className="font-medium">
                                                {boq.category}
                                            </TableCell>
                                            <TableCell>
                                                {boq.fileName}
                                            </TableCell>
                                            <TableCell>
                                                {boq.notes || "No notes"}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <a
                                                        href={boq.downloadUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center text-blue-600 hover:text-blue-800"
                                                    >
                                                        <Download className="h-4 w-4 mr-1" />
                                                        Download
                                                    </a>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                                        onClick={() =>
                                                            handleDeleteBOQ(
                                                                boq.id
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-1" />
                                                        Delete
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
