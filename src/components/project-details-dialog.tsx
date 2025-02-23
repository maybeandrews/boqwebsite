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
import { Trash2, Tag, AlertTriangle } from "lucide-react";

// Add Project type definition
type Project = {
    id: string;
    name: string;
    description: string;
    deadline: string;
    vendors: number;
    quotes: number;
    tags: string[];
};

type ProjectDetailsProps = {
    project: Project;
    onClose: () => void;
    onDelete: (projectId: string) => void;
};

// Temporary data structure for quotes per tag
const tempQuotesPerTag = {
    Construction: 5,
    Electrical: 3,
    Plumbing: 2,
    HVAC: 4,
    Furniture: 1,
};

export function ProjectDetailsDialog({
    project,
    onClose,
    onDelete,
}: ProjectDetailsProps) {
    return (
        <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
                <DialogTitle className="flex items-center">
                    <span className="flex-1">{project.name}</span>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDelete(project.id)}
                        className="mr-8" // Added margin to move button left
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
                                {new Date(
                                    project.deadline
                                ).toLocaleDateString()}
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
                        {project.tags.length > 0 ? (
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
                        <div className="space-y-2">
                            {Object.entries(tempQuotesPerTag).map(
                                ([tag, count]) => (
                                    <div
                                        key={tag}
                                        className="flex items-center justify-between p-3 border rounded-lg"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Tag className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium">
                                                {tag}
                                            </span>
                                        </div>
                                        <Badge variant="secondary">
                                            {count} quotes
                                        </Badge>
                                    </div>
                                )
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </div>
        </DialogContent>
    );
}
