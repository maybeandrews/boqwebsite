"use client";

import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, PlusCircle, Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Toaster, toast } from "sonner";

interface VendorProject {
    id: number;
    project: {
        id: number;
        name: string;
    };
}

interface Vendor {
    id: number;
    name: string;
    contact: string;
    approved: boolean;
    username: string;
    password: string;
    projects: VendorProject[];
}

export default function Page() {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [newVendor, setNewVendor] = useState({
        name: "",
        contact: "",
        username: "",
        password: "",
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Fetch vendors on component mount
    useEffect(() => {
        fetchVendors();
    }, []);

    // Fetch all vendors
    const fetchVendors = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/vendor`);

            if (!response.ok) {
                throw new Error("Failed to fetch vendors");
            }

            const data = await response.json();

            // Filter out admin vendor
            const filteredVendors = data.filter(
                (vendor: Vendor) => vendor.username.toLowerCase() !== "admin"
            );

            setVendors(filteredVendors);
        } catch (error) {
            console.error("Error fetching vendors:", error);
            toast.error("Failed to load vendors. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // Add a new vendor
    const handleAddVendor = async () => {
        if (
            !newVendor.name ||
            !newVendor.contact ||
            !newVendor.username ||
            !newVendor.password
        ) {
            toast.error("Please fill in all required fields.");
            return;
        }

        // Prevent creating admin users from this interface
        if (newVendor.username.toLowerCase() === "admin") {
            toast.error("Cannot create user with username 'admin'");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch("/api/vendor", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: newVendor.name,
                    contact: newVendor.contact,
                    username: newVendor.username,
                    password: newVendor.password,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to add vendor");
            }

            const data = await response.json();

            // Refresh vendor list
            await fetchVendors();

            // Reset form and close dialog
            setNewVendor({
                name: "",
                contact: "",
                username: "",
                password: "",
            });
            setIsDialogOpen(false);

            toast.success("Vendor added successfully.");
        } catch (error) {
            console.error("Error adding vendor:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to add vendor. Please try again."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    // Delete a vendor
    const handleDeleteVendor = async (id: number) => {
        try {
            const response = await fetch(`/api/vendor/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to delete vendor");
            }

            // Refresh vendor list
            await fetchVendors();

            toast.success("Vendor deleted successfully.");
        } catch (error) {
            console.error("Error deleting vendor:", error);
            toast.error("Failed to delete vendor. Please try again.");
        }
    };

    // Toggle vendor approval status
    const handleApprovalToggle = async (id: number, currentStatus: boolean) => {
        try {
            const response = await fetch(`/api/vendor/${id}/approve`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Failed to update vendor approval status");
            }

            // Update local state to avoid a full refetch
            setVendors(
                vendors.map((vendor) =>
                    vendor.id === id
                        ? { ...vendor, approved: !currentStatus }
                        : vendor
                )
            );

            toast.success(
                `Vendor ${!currentStatus ? "approved" : "approval revoked"}.`
            );
        } catch (error) {
            console.error("Error updating approval status:", error);
            toast.error("Failed to update approval status. Please try again.");
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Add Sonner Toaster component */}
            <Toaster position="top-right" />

            <div className="grid grid-cols-[1fr_auto] gap-4">
                {/* Left side content */}
                <div>
                    <h1 className="text-2xl font-bold mb-6">
                        Vendor Management
                    </h1>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-10">
                            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                        </div>
                    ) : vendors.length === 0 ? (
                        <div className="text-center py-10 border rounded-lg bg-gray-50">
                            <p className="text-gray-500">No vendors found.</p>
                            <p className="text-sm text-gray-400 mt-1">
                                Click "Add Vendor" to create a new vendor.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {vendors.map((vendor) => (
                                <Card key={vendor.id} className="p-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold">
                                                    @{vendor.username}
                                                </h3>
                                                <span className="text-sm text-gray-500">
                                                    ({vendor.name})
                                                </span>
                                            </div>
                                            {vendor.projects.length > 0 && (
                                                <div className="mt-2">
                                                    <span className="text-xs text-gray-500">
                                                        Assigned to projects:
                                                    </span>
                                                    <div className="flex flex-wrap gap-2 mt-1">
                                                        {vendor.projects.map(
                                                            (vp) => (
                                                                <Badge
                                                                    key={vp.id}
                                                                    variant="secondary"
                                                                >
                                                                    {
                                                                        vp
                                                                            .project
                                                                            .name
                                                                    }
                                                                </Badge>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    checked={vendor.approved}
                                                    onCheckedChange={() =>
                                                        handleApprovalToggle(
                                                            vendor.id,
                                                            vendor.approved
                                                        )
                                                    }
                                                    className="mr-2"
                                                />

                                                <Badge
                                                    variant={
                                                        vendor.approved
                                                            ? "success"
                                                            : "destructive"
                                                    }
                                                >
                                                    {vendor.approved
                                                        ? "Approved"
                                                        : "Pending"}
                                                </Badge>
                                            </div>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-red-500 hover:text-red-700"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>
                                                            Are you sure?
                                                        </AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This action cannot
                                                            be undone. This will
                                                            permanently delete
                                                            the vendor and
                                                            remove their data
                                                            from the system.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>
                                                            Cancel
                                                        </AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() =>
                                                                handleDeleteVendor(
                                                                    vendor.id
                                                                )
                                                            }
                                                            className="bg-red-600 hover:bg-red-700"
                                                        >
                                                            Delete
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right side content */}
                <div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="flex items-center gap-2">
                                <PlusCircle className="w-4 h-4" />
                                Add Vendor
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Add New Vendor</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Company Name*</Label>
                                    <Input
                                        id="name"
                                        value={newVendor.name}
                                        onChange={(e) =>
                                            setNewVendor({
                                                ...newVendor,
                                                name: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="contact">
                                        Contact Email*
                                    </Label>
                                    <Input
                                        id="contact"
                                        value={newVendor.contact}
                                        onChange={(e) =>
                                            setNewVendor({
                                                ...newVendor,
                                                contact: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="username">Username*</Label>
                                    <Input
                                        id="username"
                                        value={newVendor.username}
                                        onChange={(e) =>
                                            setNewVendor({
                                                ...newVendor,
                                                username: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="password">Password*</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={newVendor.password}
                                        onChange={(e) =>
                                            setNewVendor({
                                                ...newVendor,
                                                password: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <Button
                                    onClick={handleAddVendor}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Adding...
                                        </>
                                    ) : (
                                        "Add Vendor"
                                    )}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </div>
    );
}
