import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

export function CreateProjectDialog() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Project
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                    <DialogDescription>
                        Create a new project by filling out the details below.
                    </DialogDescription>
                </DialogHeader>
                <form className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Project Name</Label>
                        <Input id="name" placeholder="Enter project name" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Enter project description"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="deadline">Deadline</Label>
                        <Input id="deadline" type="date" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="tags">Tags (comma separated)</Label>
                        <Input
                            id="tags"
                            placeholder="e.g. Construction, Electrical"
                        />
                    </div>
                </form>
                <DialogFooter>
                    <Button type="submit">Create Project</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
