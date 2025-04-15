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
// Removed unused import: useRouter from "next/navigation";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Added Card for form structure

// Define TypeScript interfaces
interface Project {
    id: number;
    name: string;
    description?: string;
    deadline?: string;
    tags?: string[]; // Assuming tags represent categories for the project
}

interface Performa {
    id: number;
    fileName: string;
    uploadedAt: string;
    notes?: string;
    totalAmount: number;
    status: "PENDING" | "ACCEPTED" | "REJECTED";
    downloadUrl?: string; // URL to download the file
    category?: string;
    boqItems?: any[]; // Added for potential future use if fetched
}

// Type for BOQ items (example structure)
interface BOQItem {
    id: number;
    slNo: number;
    workDetail: string;
    amount: number;
}

export default function PerformaPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProject, setSelectedProject] = useState<string>("");
    const [categories, setCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const [file, setFile] = useState<File | null>(null);
    const [notes, setNotes] = useState<string>("");
    const [totalAmount, setTotalAmount] = useState<string>(""); // Keep as string for input binding
    const [uploadedPerformas, setUploadedPerformas] = useState<Performa[]>([]);
    const [isLoadingProjects, setIsLoadingProjects] = useState<boolean>(false); // More specific loading
    const [isLoadingPerformas, setIsLoadingPerformas] =
        useState<boolean>(false); // More specific loading
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [boqItemsByPerforma, setBoqItemsByPerforma] = useState<{
        // Renamed for clarity
        [performaId: number]: BOQItem[];
    }>({});
    const [boqItems, setBoqItems] = useState<BOQItem[]>([]);
    // Removed unused state: isSending
    // Removed unused import: router

    // Fetch projects assigned to the current vendor
    useEffect(() => {
        async function fetchAssignedProjects() {
            setIsLoadingProjects(true);
            try {
                const sessionRes = await fetch("/api/auth/session");
                if (!sessionRes.ok) {
                    // Handle case where session endpoint itself fails
                    throw new Error("Failed to fetch session info.");
                }
                const session = await sessionRes.json();

                if (!session?.user?.id) {
                    toast.error("Authentication error. Please log in again.");
                    setIsLoadingProjects(false); // Stop loading on auth error
                    return;
                }
                const vendorId = session.user.id;

                // Fetch only projects assigned to this vendor
                // Assuming /api/clientuploads?vendorId=... returns Project[]
                const res = await fetch(
                    `/api/clientuploads?vendorId=${vendorId}`
                );
                if (!res.ok)
                    throw new Error(
                        `Failed to fetch projects (status: ${res.status})`
                    );
                const data = await res.json();
                setProjects(data || []); // Ensure projects is always an array
            } catch (error) {
                console.error("Error fetching assigned projects:", error);
                toast.error(
                    `Failed to load assigned projects: ${
                        error instanceof Error ? error.message : String(error)
                    }`
                );
                setProjects([]); // Clear projects on error
            } finally {
                setIsLoadingProjects(false);
            }
        }
        fetchAssignedProjects();
    }, []); // Run only once on mount

    // Fetch project categories when project changes
    useEffect(() => {
        if (!selectedProject) {
            setCategories([]);
            setSelectedCategory("");
            return;
        }

        async function fetchProjectDetails() {
            // Set loading state? Maybe not necessary if quick.
            try {
                const res = await fetch(`/api/projects/${selectedProject}`);
                if (!res.ok) throw new Error("Failed to fetch project details");
                const data: Project = await res.json(); // Assuming returns Project type

                // Extract unique categories/tags from the project
                if (data.tags && Array.isArray(data.tags)) {
                    setCategories(data.tags);
                } else {
                    setCategories([]); // Ensure it's an empty array if no tags
                }
                setSelectedCategory(""); // Reset category selection when project changes
            } catch (error) {
                console.error("Error fetching project details:", error);
                toast.error("Failed to load project categories");
                setCategories([]);
            }
        }

        fetchProjectDetails();
    }, [selectedProject]); // Run when selectedProject changes

    // Define refreshPerformas as a useCallback
    const refreshPerformas = useCallback(async () => {
        if (!selectedProject) {
            setUploadedPerformas([]); // Clear performas if no project selected
            return;
        }
        setIsLoadingPerformas(true);
        setBoqItemsByPerforma({}); // Clear old BOQ items

        try {
            const sessionRes = await fetch("/api/auth/session");
            if (!sessionRes.ok)
                throw new Error("Failed to fetch session info.");
            const session = await sessionRes.json();

            if (!session?.user?.id) {
                toast.error("Authentication error refreshing performas.");
                setIsLoadingPerformas(false);
                return; // Don't proceed without vendor ID
            }
            const vendorId = session.user.id;

            // Fetch performas for the selected project and vendor, including download URLs
            const res = await fetch(
                `/api/clientuploads?projectId=${selectedProject}&vendorId=${vendorId}&includeUrls=true`
            );

            if (!res.ok) throw new Error("Failed to refresh performas");
            const data: Performa[] = await res.json(); // Expecting an array of Performa
            setUploadedPerformas(data || []); // Ensure it's always an array

            // --- Fetch BOQ items for each performa (Optional: can be heavy) ---
            // Consider fetching BOQ only when needed (e.g., expanding a row)
            // For now, completing the original logic:
            const itemsByBOQ: { [performaId: number]: BOQItem[] } = {};
            await Promise.all(
                (data || []).map(async (performa) => {
                    try {
                        // Assuming /api/boqs/[performaId] returns { items: BOQItem[] }
                        const boqRes = await fetch(`/api/boqs/${performa.id}`);
                        if (boqRes.ok) {
                            const boqData = await boqRes.json();
                            itemsByBOQ[performa.id] = boqData.items || [];
                        } else {
                            // Don't fail all if one BOQ fetch fails, just log it
                            console.warn(
                                `Failed to fetch BOQ items for performa ${performa.id} (status: ${boqRes.status})`
                            );
                            itemsByBOQ[performa.id] = []; // Assign empty array on failure
                        }
                    } catch (boqError) {
                        console.error(
                            `Error fetching BOQ for performa ${performa.id}:`,
                            boqError
                        );
                        itemsByBOQ[performa.id] = [];
                    }
                })
            );
            setBoqItemsByPerforma(itemsByBOQ);
            // --- End BOQ Fetching ---
        } catch (error) {
            console.error("Error refreshing performas:", error);
            toast.error(
                `Failed to load performas: ${
                    error instanceof Error ? error.message : String(error)
                }`
            );
            setUploadedPerformas([]); // Clear performas on error
            setBoqItemsByPerforma({});
        } finally {
            setIsLoadingPerformas(false);
        }
    }, [selectedProject]); // Dependency: only selectedProject

    // Call refreshPerformas when selectedProject changes
    useEffect(() => {
        refreshPerformas();
    }, [refreshPerformas]); // refreshPerformas is stable due to useCallback

    // Fetch BOQ items when project and category are selected
    useEffect(() => {
        async function fetchBOQItems() {
            if (!selectedProject || !selectedCategory) {
                setBoqItems([]);
                return;
            }
            try {
                const res = await fetch(
                    `/api/boqs?projectId=${selectedProject}&category=${encodeURIComponent(
                        selectedCategory
                    )}`
                );
                if (!res.ok) throw new Error("Failed to fetch BOQ items");
                const data = await res.json();
                // Use the first matching BOQ (if multiple, pick the latest)
                if (Array.isArray(data) && data.length > 0 && data[0].items) {
                    setBoqItems(
                        data[0].items.map((item: any) => ({
                            slNo: item.slNo,
                            workDetail: item.workDetail,
                            amount: item.amount || 0,
                        }))
                    );
                } else {
                    setBoqItems([]);
                }
            } catch (err) {
                setBoqItems([]);
            }
        }
        fetchBOQItems();
    }, [selectedProject, selectedCategory]);

    // --- Handlers for Form Inputs ---
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setFile(event.target.files[0]);
        } else {
            setFile(null);
        }
    };

    const handleCategoryChange = (value: string) => {
        setSelectedCategory(value);
    };

    const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        // Allow only numbers and a single decimal point
        const value = event.target.value;
        if (/^\d*\.?\d*$/.test(value)) {
            setTotalAmount(value);
        }
    };

    const handleNotesChange = (
        event: React.ChangeEvent<HTMLTextAreaElement>
    ) => {
        setNotes(event.target.value);
    };

    // --- Handlers for BOQ Table ---
    const handleAddBOQItem = () => {
        setBoqItems((prev) => [
            ...prev,
            {
                id: Date.now(),
                slNo: prev.length + 1,
                workDetail: "",
                amount: 0,
            },
        ]);
    };
    const handleRemoveBOQItem = (idx: number) => {
        setBoqItems((prev) =>
            prev
                .filter((_, i) => i !== idx)
                .map((item, i) => ({ ...item, slNo: i + 1 }))
        );
    };
    // Only allow editing amount
    const handleBOQItemChange = (
        idx: number,
        field: keyof BOQItem,
        value: string | number
    ) => {
        if (field !== "amount") return;
        setBoqItems((prev) => {
            const items = [...prev];
            items[idx] = {
                ...items[idx],
                amount: Number(value),
            };
            return items;
        });
    };

    // --- Handle Performa Upload ---
    const handleUpload = async () => {
        if (!file || !selectedProject || !totalAmount) {
            toast.error(
                "Please select a project, choose a file, and enter the total amount."
            );
            return;
        }

        // Basic validation for amount
        const amount = parseFloat(totalAmount);
        if (isNaN(amount) || amount <= 0) {
            toast.error("Please enter a valid total amount greater than zero.");
            return;
        }

        setIsUploading(true);

        try {
            const sessionRes = await fetch("/api/auth/session");
            if (!sessionRes.ok)
                throw new Error("Failed to fetch session info.");
            const session = await sessionRes.json();

            if (!session?.user?.id) {
                toast.error("Authentication error during upload.");
                setIsUploading(false);
                return;
            }
            const vendorId = session.user.id;

            const formData = new FormData();
            formData.append("file", file);
            formData.append("projectId", selectedProject);
            formData.append("vendorId", String(vendorId)); // Ensure vendorId is string if required by backend
            formData.append("totalAmount", String(amount)); // Send parsed amount
            if (selectedCategory) {
                formData.append("category", selectedCategory);
            }
            if (notes) {
                formData.append("notes", notes);
            }
            if (boqItems.length > 0) {
                formData.append("boqItems", JSON.stringify(boqItems));
            }

            // Assume POST request to /api/clientuploads handles the file upload
            const res = await fetch("/api/clientuploads", {
                method: "POST",
                body: formData,
                // Do NOT set Content-Type header, browser does it for FormData
            });

            if (!res.ok) {
                // Try to get error message from backend response
                let errorMsg = `Upload failed (status: ${res.status})`;
                try {
                    const errorData = await res.json();
                    errorMsg = errorData.message || errorMsg;
                } catch (e) {
                    /* Ignore parsing error */
                }
                throw new Error(errorMsg);
            }

            // Success
            toast.success("Performa uploaded successfully!");
            // Reset form
            setFile(null);
            // Reset file input visually (find a better way if needed)
            const fileInput = document.getElementById(
                "performa-file-input"
            ) as HTMLInputElement | null;
            if (fileInput) fileInput.value = "";

            setNotes("");
            setTotalAmount("");
            setSelectedCategory("");
            setBoqItems([]);
            // Refresh the list of uploaded performas
            await refreshPerformas();
        } catch (error) {
            console.error("Error uploading performa:", error);
            toast.error(
                `Upload failed: ${
                    error instanceof Error ? error.message : String(error)
                }`
            );
        } finally {
            setIsUploading(false);
        }
    };

    // --- Helper function to format date ---
    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return "N/A";
        try {
            return new Date(dateString).toLocaleDateString();
        } catch (e) {
            return "Invalid Date";
        }
    };

    // --- Helper function to format currency ---
    const formatCurrency = (amount: number | string | null | undefined) => {
        if (amount == null) return "N/A";
        const num = typeof amount === "string" ? parseFloat(amount) : amount;
        if (isNaN(num)) return "Invalid Amount";
        return `₹${num.toLocaleString("en-IN")}`; // Indian Rupee format
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Upload Performa Invoice</h1>

            {/* Project Selection */}
            <div>
                <label
                    htmlFor="project-select"
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
                    Select Project
                </label>
                <Select
                    onValueChange={setSelectedProject}
                    value={selectedProject}
                    disabled={isLoadingProjects || projects.length === 0}
                >
                    <SelectTrigger
                        id="project-select"
                        className="w-full md:w-1/2"
                    >
                        <SelectValue
                            placeholder={
                                isLoadingProjects
                                    ? "Loading projects..."
                                    : projects.length === 0
                                    ? "No projects assigned"
                                    : "Select a project"
                            }
                        />
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
            </div>

            {/* Upload Form Card - Only show if a project is selected */}
            {selectedProject && (
                <Card>
                    <CardHeader>
                        <CardTitle>Submit New Performa</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Category Selection */}
                        {categories.length > 0 && (
                            <div>
                                <label
                                    htmlFor="category-select"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Category (Optional)
                                </label>
                                <Select
                                    onValueChange={handleCategoryChange}
                                    value={selectedCategory}
                                    disabled={isUploading}
                                >
                                    <SelectTrigger
                                        id="category-select"
                                        className="w-full"
                                    >
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((category, index) => (
                                            <SelectItem
                                                key={index}
                                                value={category}
                                            >
                                                {category}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* File Input */}
                        <div>
                            <label
                                htmlFor="performa-file-input"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Performa File (PDF, etc.)
                            </label>
                            <Input
                                id="performa-file-input"
                                type="file"
                                onChange={handleFileChange}
                                disabled={isUploading}
                                className="w-full"
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png" // Example accept types
                            />
                            {file && (
                                <p className="text-sm text-gray-500 mt-1">
                                    Selected: {file.name}
                                </p>
                            )}
                        </div>

                        {/* Total Amount */}
                        <div>
                            <label
                                htmlFor="total-amount"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Total Amount (₹)
                            </label>
                            <Input
                                id="total-amount"
                                type="text" // Use text to better control input with regex
                                placeholder="e.g., 15000.50"
                                value={totalAmount}
                                onChange={handleAmountChange}
                                disabled={isUploading}
                                className="w-full"
                                inputMode="decimal" // Hint for mobile keyboards
                            />
                        </div>

                        {/* Notes */}
                        <div>
                            <label
                                htmlFor="notes"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Notes (Optional)
                            </label>
                            <Textarea
                                id="notes"
                                placeholder="Add any relevant notes..."
                                value={notes}
                                onChange={handleNotesChange}
                                disabled={isUploading}
                                className="w-full"
                            />
                        </div>

                        {/* BOQ Items Table */}
                        <div>
                            <h4 className="font-semibold mb-1">BOQ Table</h4>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Sl. No</TableHead>
                                        <TableHead>Work Detail</TableHead>
                                        <TableHead>Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {boqItems.map((item, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    value={item.slNo}
                                                    readOnly
                                                    className="w-16 bg-gray-100 cursor-not-allowed"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    value={item.workDetail}
                                                    readOnly
                                                    className="bg-gray-100 cursor-not-allowed"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    value={item.amount}
                                                    onChange={(e) =>
                                                        handleBOQItemChange(
                                                            idx,
                                                            "amount",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-24"
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Submit Button */}
                        <Button
                            onClick={handleUpload}
                            disabled={
                                isUploading ||
                                !file ||
                                !selectedProject ||
                                !totalAmount
                            }
                            className="w-full md:w-auto"
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                "Upload Performa"
                            )}
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Uploaded Performas Table */}
            {selectedProject && (
                <div className="mt-8">
                    <h2 className="text-2xl font-semibold mb-4">
                        Uploaded Performas for Selected Project
                    </h2>
                    {isLoadingPerformas ? (
                        <div className="flex items-center justify-center h-32">
                            <Loader2 className="animate-spin h-8 w-8 text-primary" />
                            <span className="ml-2">Loading performas...</span>
                        </div>
                    ) : uploadedPerformas.length > 0 ? (
                        <div className="overflow-x-auto border rounded-lg">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>File Name</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Uploaded Date</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {uploadedPerformas.map((performa) => (
                                        <TableRow key={performa.id}>
                                            <TableCell className="font-medium">
                                                {performa.fileName}
                                            </TableCell>
                                            <TableCell>
                                                {performa.category || "N/A"}
                                            </TableCell>
                                            <TableCell>
                                                {formatDate(
                                                    performa.uploadedAt
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {formatCurrency(
                                                    performa.totalAmount
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        performa.status ===
                                                        "ACCEPTED"
                                                            ? "bg-green-100 text-green-800"
                                                            : performa.status ===
                                                              "REJECTED"
                                                            ? "bg-red-100 text-red-800"
                                                            : "bg-yellow-100 text-yellow-800"
                                                    }`}
                                                >
                                                    {performa.status}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                {performa.downloadUrl ? (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            window.open(
                                                                performa.downloadUrl,
                                                                "_blank"
                                                            )
                                                        }
                                                    >
                                                        <Download className="mr-1 h-4 w-4" />
                                                        Download
                                                    </Button>
                                                ) : (
                                                    <span className="text-xs text-gray-400">
                                                        No link
                                                    </span>
                                                )}
                                                {/* Placeholder for viewing BOQ items if needed */}
                                                {/* {boqItemsByPerforma[performa.id]?.length > 0 && (
                                                     <Button variant="ghost" size="sm" className="ml-2" onClick={() => alert('Show BOQ Items for ' + performa.fileName)}>
                                                         View BOQ
                                                     </Button>
                                                 )} */}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="mt-6 text-center p-6 bg-gray-50 rounded-lg">
                            <p className="text-gray-500">
                                No performas uploaded for this project yet.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
