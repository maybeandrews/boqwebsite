"use client";

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
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, X } from "lucide-react";
import { vendors } from "@/data/vendors";
import { useState } from "react";

export function CreateProjectDialog() {
    const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState("");

    const handleVendorToggle = (vendorId: string) => {
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

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Project
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                    <DialogDescription>
                        Fill in the project details and select vendors.
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
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                            <Input
                                id="tags"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={handleAddTag}
                                placeholder="Type and press Enter to add tags"
                                className="border-0 outline-none focus-visible:ring-0"
                            />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label>Select Vendors</Label>
                        <div className="border rounded-lg p-4 space-y-2">
                            {vendors.map((vendor) => (
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
                                            handleVendorToggle(vendor.id)
                                        }
                                    />
                                    <Label
                                        htmlFor={`vendor-${vendor.id}`}
                                        className="flex items-center gap-2"
                                    >
                                        {vendor.name}
                                        <span className="text-sm text-muted-foreground">
                                            ({vendor.tags.join(", ")})
                                        </span>
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>
                </form>
                <DialogFooter>
                    <Button type="submit">Create Project</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
