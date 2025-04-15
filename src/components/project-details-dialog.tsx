import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Trash2,
    Tag,
    AlertTriangle,
    Loader2,
    Users,
    Pencil,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

// Update Project type definition to match the dashboard expectations
type Project = {
    id: string | number;
    name: string;
    description: string;
    deadline: string;
    vendors: number;
    quotes: number;
    tags: string[];
};

// Define vendor type that matches your API response
type Vendor = {
    id: number;
    name: string;
    contact: string;
    approved: boolean;
    username: string;
    projects: any[];
};

type QuotesByCategory = {
    [category: string]: number;
};

type ProjectDetailsProps = {
    project: Project;
    onClose: () => void;
    onDelete: (projectId: string | number) => void;
    onProjectUpdated?: () => void;
};

export function ProjectDetailsDialog({
    project,
    onClose,
    onDelete,
    onProjectUpdated,
}: ProjectDetailsProps) {
    const [projectVendors, setProjectVendors] = useState<Vendor[]>([]);
    const [isLoadingVendors, setIsLoadingVendors] = useState(true);
    const [vendorError, setVendorError] = useState<string | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: project.name,
        description: project.description,
        deadline: project.deadline ? project.deadline.slice(0, 10) : "",
    });
    const [selectedVendors, setSelectedVendors] = useState<number[]>([]);
    const [tags, setTags] = useState<string[]>(project.tags || []);
    const [tagInput, setTagInput] = useState("");
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    // Fetch project vendors when the dialog opens
    useEffect(() => {
        const fetchProjectVendors = async () => {
            setIsLoadingVendors(true);
            setVendorError(null);

            try {
                // Fetch vendors associated with this project
                const response = await fetch(
                    `/api/projects/${project.id}/vendors`
                );

                if (!response.ok) {
                    throw new Error("Failed to load vendors");
                }

                const data = await response.json();
                setProjectVendors(data.vendors || []);
            } catch (err) {
                console.error("Error fetching project vendors:", err);
                setVendorError("Could not load vendor information");
                setProjectVendors([]);
            } finally {
                setIsLoadingVendors(false);
            }
        };

        fetchProjectVendors();
    }, [project.id]);

    // Fetch all vendors and set selected vendors when edit opens
    useEffect(() => {
        if (isEditOpen) {
            fetchVendors();
            // Set selected vendors from projectVendors
            setSelectedVendors(projectVendors.map((v) => v.id));
        }
    }, [isEditOpen]);

    const fetchVendors = async () => {
        setIsLoadingVendors(true);
        setVendorError(null);
        try {
            const response = await fetch("/api/vendor");
            if (!response.ok) throw new Error("Failed to fetch vendors");
            const data = await response.json();
            setVendors(data.filter((v: Vendor) => v.approved));
        } catch (error) {
            setVendorError("Failed to load vendors");
            toast.error("Failed to load vendors");
        } finally {
            setIsLoadingVendors(false);
        }
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
    };

    const handleVendorToggle = (vendorId: number) => {
        setSelectedVendors((current) =>
            current.includes(vendorId)
                ? current.filter((id) => id !== vendorId)
                : [...current, vendorId]
        );
    };

    const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && tagInput.trim()) {
            e.preventDefault();
            if (!tags.includes(tagInput.trim())) {
                setTags([...tags, tagInput.trim()]);
            }
            setTagInput("");
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter((tag) => tag !== tagToRemove));
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
                <DialogTitle className="flex items-center">
                    <span className="flex-1">{project.name}</span>
                    <Button
                        variant="outline"
                        size="icon"
                        className="mr-2"
                        onClick={() => setIsEditOpen(true)}
                        aria-label="Edit Project"
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDelete(project.id)}
                        className="mr-8"
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Project
                    </Button>
                </DialogTitle>
                <DialogDescription>{project.description}</DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
                {/* Project Status Section */}
                <div className="space-y-2">
                    <h3 className="text-sm font-medium">Project Status</h3>
                    <div className="flex gap-4">
                        <div className="flex-1 p-3 border rounded-lg">
                            <p className="text-sm text-muted-foreground">
                                Deadline
                            </p>
                            <p className="font-medium">
                                {formatDate(project.deadline)}
                            </p>
                        </div>
                        <div className="flex-1 p-3 border rounded-lg">
                            <p className="text-sm text-muted-foreground">
                                Total Quotes
                            </p>
                            <p className="font-medium">{project.quotes}</p>
                        </div>
                    </div>
                </div>

                {/* Tags Section */}
                <div className="space-y-2">
                    <h3 className="text-sm font-medium">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                        {project.tags && project.tags.length > 0 ? (
                            project.tags.map((tag) => (
                                <Badge key={tag} variant="secondary">
                                    {tag}
                                </Badge>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                No tags added
                            </p>
                        )}
                    </div>
                </div>

                {/* Vendors Section */}
                <div className="space-y-2">
                    <h3 className="text-sm font-medium">Associated Vendors</h3>
                    <ScrollArea className="h-[150px] rounded-md border p-4">
                        {isLoadingVendors ? (
                            <div className="flex items-center justify-center h-full">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                <span className="ml-2">Loading vendors...</span>
                            </div>
                        ) : vendorError ? (
                            <div className="flex items-center justify-center h-full text-destructive">
                                <AlertTriangle className="h-5 w-5 mr-2" />
                                <span>{vendorError}</span>
                            </div>
                        ) : projectVendors.length > 0 ? (
                            <div className="space-y-2">
                                {projectVendors.map((vendor) => (
                                    <div
                                        key={vendor.id}
                                        className="flex items-center justify-between p-3 border rounded-lg"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium">
                                                {vendor.name}
                                            </span>
                                        </div>
                                        <Badge
                                            variant={
                                                vendor.approved
                                                    ? "default"
                                                    : "outline"
                                            }
                                        >
                                            {vendor.approved
                                                ? "Approved"
                                                : "Pending"}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                <p>No vendors associated with this project.</p>
                            </div>
                        )}
                    </ScrollArea>
                </div>
            </div>

            {/* Edit Project Dialog */}
            {isEditOpen && (
                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Edit Project</DialogTitle>
                            <DialogDescription>
                                Update project details and select vendors.
                            </DialogDescription>
                        </DialogHeader>
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                setIsSaving(true);
                                try {
                                    const res = await fetch(
                                        `/api/projects/${project.id}`,
                                        {
                                            method: "PUT",
                                            headers: {
                                                "Content-Type":
                                                    "application/json",
                                            },
                                            body: JSON.stringify({
                                                ...formData,
                                                tags,
                                                vendors: selectedVendors,
                                            }),
                                        }
                                    );
                                    if (!res.ok)
                                        throw new Error(
                                            "Failed to update project"
                                        );
                                    toast.success("Project updated!");
                                    setIsEditOpen(false);
                                    if (onProjectUpdated) onProjectUpdated();
                                } catch (err: any) {
                                    toast.error(
                                        err.message || "Error updating project"
                                    );
                                } finally {
                                    setIsSaving(false);
                                }
                            }}
                            className="grid gap-4 py-4"
                        >
                            <div className="grid gap-2">
                                <Label htmlFor="name">Project Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="deadline">Deadline</Label>
                                <Input
                                    id="deadline"
                                    type="date"
                                    value={formData.deadline}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="tags">Tags</Label>
                                <div className="flex flex-wrap gap-2 p-2 border rounded-lg">
                                    {tags.map((tag) => (
                                        <div
                                            key={tag}
                                            className="flex items-center gap-1 bg-secondary px-2 py-1 rounded-md"
                                        >
                                            <span>{tag}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeTag(tag)}
                                                className="hover:text-destructive"
                                            >
                                                <span className="sr-only">
                                                    Remove
                                                </span>
                                                X
                                            </button>
                                        </div>
                                    ))}
                                    <Input
                                        id="tags"
                                        value={tagInput}
                                        onChange={(e) =>
                                            setTagInput(e.target.value)
                                        }
                                        onKeyDown={handleAddTag}
                                        placeholder="Type and press Enter to add tags"
                                        className="border-0 outline-none focus-visible:ring-0"
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label>Select Vendors</Label>
                                <div className="border rounded-lg p-4 space-y-2">
                                    {isLoadingVendors ? (
                                        <div className="py-4 text-center text-muted-foreground">
                                            Loading vendors...
                                        </div>
                                    ) : vendorError ? (
                                        <div className="py-4 text-center text-destructive">
                                            {vendorError}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={fetchVendors}
                                                className="ml-2"
                                            >
                                                Retry
                                            </Button>
                                        </div>
                                    ) : vendors.length === 0 ? (
                                        <div className="py-4 text-center text-muted-foreground">
                                            No approved vendors available
                                        </div>
                                    ) : (
                                        vendors.map((vendor) => (
                                            <div
                                                key={vendor.id}
                                                className="flex items-center space-x-2"
                                            >
                                                <Checkbox
                                                    id={`vendor-${vendor.id}`}
                                                    checked={selectedVendors.includes(
                                                        vendor.id
                                                    )}
                                                    onCheckedChange={() =>
                                                        handleVendorToggle(
                                                            vendor.id
                                                        )
                                                    }
                                                />
                                                <Label
                                                    htmlFor={`vendor-${vendor.id}`}
                                                    className="flex items-center gap-2"
                                                >
                                                    {vendor.name}
                                                </Label>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsEditOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSaving}>
                                    {isSaving ? "Saving..." : "Save"}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            )}
        </DialogContent>
    );
}
