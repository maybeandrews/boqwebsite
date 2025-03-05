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
import { Trash2, Tag, AlertTriangle, Loader2, Users } from "lucide-react";
import { useEffect, useState } from "react";

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
};

export function ProjectDetailsDialog({
    project,
    onClose,
    onDelete,
}: ProjectDetailsProps) {
    const [projectVendors, setProjectVendors] = useState<Vendor[]>([]);
    const [isLoadingVendors, setIsLoadingVendors] = useState(true);
    const [vendorError, setVendorError] = useState<string | null>(null);

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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
                <DialogTitle className="flex items-center">
                    <span className="flex-1">{project.name}</span>
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
        </DialogContent>
    );
}
