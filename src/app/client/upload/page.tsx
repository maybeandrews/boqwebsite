"use client";

import { useCallback, useEffect, useState } from "react";
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
import { useRouter } from "next/navigation";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

// Define TypeScript interfaces
interface Project {
    id: number;
    name: string;
    description?: string;
    deadline?: string;
    tags?: string[];
}

interface Performa {
    id: number;
    fileName: string;
    uploadedAt: string;
    notes?: string;
    totalAmount: number;
    status: "PENDING" | "ACCEPTED" | "REJECTED";
    downloadUrl?: string;
    category?: string; // Make sure this is defined
}

export default function PerformaPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProject, setSelectedProject] = useState<string>("");
    const [categories, setCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const [file, setFile] = useState<File | null>(null);
    const [notes, setNotes] = useState<string>("");
    const [totalAmount, setTotalAmount] = useState<string>("");
    const [uploadedPerformas, setUploadedPerformas] = useState<Performa[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const router = useRouter();

    // Fetch projects assigned to the current vendor
    useEffect(() => {
        async function fetchAssignedProjects() {
            setIsLoading(true);
            try {
                // Get the current session to extract vendorId
                const sessionRes = await fetch("/api/auth/session");
                const session = await sessionRes.json();

                if (!session?.user?.id) {
                    toast.error("You must be logged in to view projects");
                    return;
                }

                // Fetch only projects assigned to this vendor
                const res = await fetch(
                    `/api/clientuploads?vendorId=${session.user.id}`
                );
                if (!res.ok) throw new Error("Failed to fetch projects");
                const data = await res.json();
                setProjects(data);
            } catch (error) {
                console.error("Error fetching assigned projects:", error);
                toast.error("Failed to load assigned projects");
            } finally {
                setIsLoading(false);
            }
        }
        fetchAssignedProjects();
    }, []);

    // Fetch project categories when project changes
    useEffect(() => {
        if (!selectedProject) {
            setCategories([]);
            setSelectedCategory("");
            return;
        }

        async function fetchProjectDetails() {
            try {
                const res = await fetch(`/api/projects/${selectedProject}`);
                if (!res.ok) throw new Error("Failed to fetch project details");
                const data = await res.json();

                // Extract unique categories/tags from the project
                if (data.tags && Array.isArray(data.tags)) {
                    setCategories(data.tags);
                } else {
                    setCategories([]);
                }
            } catch (error) {
                console.error("Error fetching project details:", error);
                toast.error("Failed to load project categories");
            }
        }

        fetchProjectDetails();
    }, [selectedProject]);

    // Define refreshPerformas as a useCallback
    const refreshPerformas = useCallback(async () => {
        if (!selectedProject) return;
        setIsLoading(true);
        try {
            const sessionRes = await fetch("/api/auth/session");
            const session = await sessionRes.json();

            if (!session?.user?.id) return;

            const res = await fetch(
                `/api/clientuploads?projectId=${selectedProject}&vendorId=${session.user.id}&includeUrls=true`
            );

            if (!res.ok) throw new Error("Failed to refresh performas");
            const data = await res.json();
            setUploadedPerformas(data);
        } catch (error) {
            console.error("Error refreshing performas:", error);
        } finally {
            setIsLoading(false);
        }
    }, [selectedProject]);

    // Call refreshPerformas when selectedProject changes
    useEffect(() => {
        if (!selectedProject) {
            setUploadedPerformas([]);
            return;
        }

        refreshPerformas();
    }, [selectedProject, refreshPerformas]);

    // Handle file change
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    // Handle file upload
    async function handleUpload() {
        if (!file || !selectedProject) {
            toast.error("Please select a project and choose a file");
            return;
        }

        if (
            !totalAmount ||
            isNaN(parseFloat(totalAmount)) ||
            parseFloat(totalAmount) <= 0
        ) {
            toast.error("Please enter a valid amount");
            return;
        }

        if (categories.length > 0 && !selectedCategory) {
            toast.error("Please select a category for this performa");
            return;
        }

        setIsUploading(true);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("projectId", selectedProject);
        formData.append("totalAmount", totalAmount);
        if (notes) formData.append("notes", notes);
        if (selectedCategory) formData.append("category", selectedCategory);

        // Add vendorId from session (required by API)
        try {
            // Get the current session to extract vendorId
            const sessionRes = await fetch("/api/auth/session");
            const session = await sessionRes.json();

            if (!session || !session.user || !session.user.id) {
                toast.error("You must be logged in to upload performas");
                setIsUploading(false);
                return;
            }

            formData.append("vendorId", session.user.id.toString());

            // Continue with upload
            const res = await fetch("/api/clientuploads", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Upload failed");
            }

            toast.success("Performa uploaded successfully!");

            // Reset form
            setFile(null);
            setNotes("");
            setTotalAmount("");
            setSelectedCategory("");

            // Refresh the list using our dedicated function
            await refreshPerformas();
        } catch (error) {
            console.error("Error uploading performa:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to upload performa"
            );
        } finally {
            setIsUploading(false);
        }
    }

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
        }).format(amount);
    };

    return (
        <div className="space-y-6 p-6">
            <h1 className="text-2xl font-bold">Performa Invoice Management</h1>

            {/* Upload Form */}
            <div className="grid gap-6 md:grid-cols-2">
                <div>
                    <h2 className="text-xl font-semibold mb-4">
                        Upload New Performa
                    </h2>
                    <div className="space-y-4">
                        {/* Project Dropdown */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Select Project
                            </label>
                            <Select
                                value={selectedProject}
                                onValueChange={(value) => {
                                    setSelectedProject(value);
                                    setSelectedCategory(""); // Reset category when project changes
                                }}
                                disabled={isLoading || projects.length === 0}
                            >
                                <SelectTrigger className="w-full">
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
                            {projects.length === 0 && !isLoading && (
                                <p className="text-xs text-amber-600 mt-1">
                                    No projects assigned to your account
                                </p>
                            )}
                        </div>

                        {/* Category Dropdown - Only show if project has categories */}
                        {categories.length > 0 && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Select Category
                                </label>
                                <Select
                                    value={selectedCategory}
                                    onValueChange={setSelectedCategory}
                                    disabled={!selectedProject || isUploading}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((category) => (
                                            <SelectItem
                                                key={category}
                                                value={category}
                                            >
                                                {category}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* File Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Upload Performa Document
                            </label>
                            <Input
                                type="file"
                                onChange={handleFileChange}
                                accept=".pdf,.doc,.docx,.xls,.xlsx"
                                disabled={isUploading || !selectedProject}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Supported formats: PDF, Word, Excel
                            </p>
                        </div>

                        {/* Amount */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Total Amount
                            </label>
                            <Input
                                type="number"
                                placeholder="Enter total amount"
                                value={totalAmount}
                                onChange={(e) => setTotalAmount(e.target.value)}
                                disabled={isUploading || !selectedProject}
                                step="0.01"
                                min="0"
                            />
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Notes (Optional)
                            </label>
                            <Textarea
                                placeholder="Add notes or remarks"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                disabled={isUploading || !selectedProject}
                            />
                        </div>

                        <Button
                            onClick={handleUpload}
                            disabled={
                                isUploading ||
                                !selectedProject ||
                                !file ||
                                !totalAmount ||
                                (categories.length > 0 && !selectedCategory)
                            }
                        >
                            {isUploading && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {isUploading ? "Uploading..." : "Upload Performa"}
                        </Button>
                    </div>
                </div>

                {/* Uploaded Performas */}
                <div>
                    <h2 className="text-xl font-semibold mb-4">
                        Uploaded Performas
                    </h2>

                    {isLoading ? (
                        <div className="flex items-center justify-center h-40">
                            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                        </div>
                    ) : !selectedProject ? (
                        <div className="text-center py-10 border rounded-lg bg-gray-50">
                            <p className="text-gray-500">
                                Select a project to view uploaded performas.
                            </p>
                        </div>
                    ) : uploadedPerformas.length === 0 ? (
                        <div className="text-center py-10 border rounded-lg bg-gray-50">
                            <p className="text-gray-500">
                                No performas uploaded for this project yet.
                            </p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>File Name</TableHead>
                                    <TableHead>Amount</TableHead>
                                    {categories.length > 0 && (
                                        <TableHead>Category</TableHead>
                                    )}
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {uploadedPerformas.map((performa) => (
                                    <TableRow key={performa.id}>
                                        <TableCell className="font-medium">
                                            {performa.fileName}
                                        </TableCell>
                                        <TableCell>
                                            {formatCurrency(
                                                performa.totalAmount
                                            )}
                                        </TableCell>
                                        {categories.length > 0 && (
                                            <TableCell>
                                                {performa.category || "—"}{" "}
                                                {/* Use an em dash instead of "N/A" for better UX */}
                                            </TableCell>
                                        )}
                                        <TableCell>
                                            <span
                                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                                    performa.status
                                                )}`}
                                            >
                                                {performa.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <a
                                                href={performa.downloadUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center text-blue-600 hover:text-blue-800"
                                            >
                                                <Download className="h-4 w-4 mr-1" />
                                                Download
                                            </a>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </div>
        </div>
    );
}

// Helper function to get status color - simplified to just three states
function getStatusColor(status: string): string {
    switch (status) {
        case "PENDING":
            return "bg-yellow-100 text-yellow-800";
        case "ACCEPTED":
            return "bg-green-100 text-green-800";
        case "REJECTED":
            return "bg-red-100 text-red-800";
        default:
            return "bg-gray-100 text-gray-800";
    }
}
