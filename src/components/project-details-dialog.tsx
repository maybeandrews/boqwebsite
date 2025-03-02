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
import { Trash2, Tag, AlertTriangle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

// Add Project type definition
type Project = {
    id: string | number;
    name: string;
    description: string;
    deadline: string;
    vendors: number;
    quotes: number;
    tags: string[];
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
    const [quotesByCategory, setQuotesByCategory] = useState<QuotesByCategory>(
        {}
    );
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch project details and quotes when the dialog opens
    useEffect(() => {
        const fetchProjectDetails = async () => {
            setIsLoading(true);
            setError(null);

            try {
                // Fetch quotes by category from API
                const response = await fetch(
                    `/api/projects/${project.id}/quotes-by-category`
                );

                if (!response.ok) {
                    throw new Error("Failed to load project details");
                }

                const data = await response.json();
                setQuotesByCategory(data);
            } catch (err) {
                console.error("Error fetching project details:", err);
                setError("Could not load project details");
                // Fallback to empty object if API fails
                setQuotesByCategory({});
            } finally {
                setIsLoading(false);
            }
        };

        fetchProjectDetails();
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

                {/* Quotes per Tag Section */}
                <div className="space-y-2">
                    <h3 className="text-sm font-medium">Quotes by Category</h3>
                    <ScrollArea className="h-[200px] rounded-md border p-4">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                <span className="ml-2">Loading quotes...</span>
                            </div>
                        ) : error ? (
                            <div className="flex items-center justify-center h-full text-destructive">
                                <AlertTriangle className="h-5 w-5 mr-2" />
                                <span>{error}</span>
                            </div>
                        ) : Object.keys(quotesByCategory).length > 0 ? (
                            <div className="space-y-2">
                                {Object.entries(quotesByCategory).map(
                                    ([category, count]) => (
                                        <div
                                            key={category}
                                            className="flex items-center justify-between p-3 border rounded-lg"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Tag className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-medium">
                                                    {category}
                                                </span>
                                            </div>
                                            <Badge variant="secondary">
                                                {count} quotes
                                            </Badge>
                                        </div>
                                    )
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                <p>No quotes available for this project yet.</p>
                            </div>
                        )}
                    </ScrollArea>
                </div>
            </div>
        </DialogContent>
    );
}
