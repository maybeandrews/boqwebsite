"use client";

import { useState, useEffect } from "react";
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
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "@/components/ui/accordion";

// Define types based on our API and schema
type Project = {
    id: number;
    name: string;
};

type Vendor = {
    id: number;
    name: string;
    contact: string;
};

type Quote = {
    id: number;
    vendorId: number;
    projectId: number;
    fileName: string;
    filePath: string;
    fileKey: string;
    fileSize: number;
    mimeType: string;
    uploadedAt: string;
    totalAmount: number;
    status: string;
    notes: string | null;
    category: string | null;
    validUntil: string | null;
    termsAccepted: boolean;
    project: {
        id: number;
        name: string;
        description: string | null;
    };
    vendor: {
        id: number;
        name: string;
        contact: string | null;
    };
    presignedUrl?: string;
    boqItems?: any[];
};

export default function QuotesPage() {
    // State variables
    const [loading, setLoading] = useState<boolean>(true);
    const [projects, setProjects] = useState<Project[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [selectedProject, setSelectedProject] = useState<string>("");
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [filteredQuotes, setFilteredQuotes] = useState<Quote[]>([]);
    const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
    const [isQuoteModalOpen, setIsQuoteModalOpen] = useState<boolean>(false);
    const [quoteNotes, setQuoteNotes] = useState<string>("");
    const [newCategoryName, setNewCategoryName] = useState<string>("");
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    // Category filter for compare section
    const [selectedCompareCategory, setSelectedCompareCategory] =
        useState<string>("");

    // Fetch all quotes and related data
    useEffect(() => {
        async function fetchQuotes() {
            try {
                setLoading(true);
                const res = await fetch("/api/quotes");

                if (!res.ok) {
                    throw new Error("Failed to fetch quotes");
                }

                const data = await res.json();
                setQuotes(data.quotes);
                setProjects(data.projects);
                setCategories(data.categories);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching quotes:", error);
                toast.error("Failed to load quotes");
                setLoading(false);
            }
        }

        fetchQuotes();
    }, []);

    // Filter quotes when project is selected
    useEffect(() => {
        if (selectedProject) {
            const projectId = parseInt(selectedProject);
            setFilteredQuotes(
                quotes.filter((quote) => quote.projectId === projectId)
            );
        } else {
            setFilteredQuotes(quotes);
        }
    }, [selectedProject, quotes]);

    // Handle approve/reject quote
    const handleUpdateQuoteStatus = async (status: string) => {
        if (!selectedQuote) return;

        try {
            const res = await fetch(`/api/quotes/${selectedQuote.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    status,
                    notes: quoteNotes,
                }),
            });

            if (!res.ok) {
                throw new Error("Failed to update quote status");
            }

            const { quote: updatedQuote } = await res.json();

            // Update quotes list with updated quote (more fault tolerant)
            setQuotes(
                quotes.map((quote) => {
                    if (quote.id === updatedQuote.id) {
                        // Keep existing project and vendor information if not in the response
                        return {
                            ...updatedQuote,
                            project: updatedQuote.project || quote.project,
                            vendor: updatedQuote.vendor || quote.vendor,
                        };
                    }
                    return quote;
                })
            );

            toast.success(`Quote ${status.toLowerCase()} successfully`);
            setIsQuoteModalOpen(false);
        } catch (error) {
            console.error("Error updating quote:", error);
            toast.error("Failed to update quote status");
        }
    };

    const handleViewQuote = (quote: Quote) => {
        setSelectedQuote(quote);
        setQuoteNotes(quote.notes || "");
        setIsQuoteModalOpen(true);
    };

    const handleApproveQuote = () => {
        handleUpdateQuoteStatus("APPROVED");
    };

    const handleRejectQuote = () => {
        handleUpdateQuoteStatus("REJECTED");
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    // View PDF link
    const handleViewPDF = (quote: Quote) => {
        // Use the presignedUrl instead of filePath
        if (quote.presignedUrl) {
            window.open(quote.presignedUrl, "_blank");
        } else {
            toast.error("Cannot access PDF file");
        }
    };

    // Add delete handler
    const handleDeleteQuote = async (quoteId: number) => {
        if (!window.confirm("Are you sure you want to delete this quote?"))
            return;
        try {
            const res = await fetch(`/api/quotes/${quoteId}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Failed to delete quote");
            setQuotes((prev) => prev.filter((q) => q.id !== quoteId));
            toast.success("Quote deleted successfully");
        } catch (err) {
            toast.error("Failed to delete quote");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin h-8 w-8 text-primary" />
                <span className="ml-2">Loading quotes...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Quotes Management</h1>
            <div className="grid gap-6 md:grid-cols-2">
                <div>
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

                    {/* Cards to show quotes when project is selected */}
                    {selectedProject && (
                        <div className="space-y-4 mt-4">
                            {filteredQuotes.length > 0 ? (
                                filteredQuotes.map((quote) => (
                                    <div key={quote.id}>
                                        <Card
                                            className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 rounded-lg"
                                            onClick={() =>
                                                handleViewQuote(quote)
                                            }
                                        >
                                            <CardContent className="pt-6">
                                                <div className="rounded-md mb-4">
                                                    <p>
                                                        <strong>Vendor:</strong>{" "}
                                                        {quote.vendor.name}
                                                    </p>
                                                    <p>
                                                        <strong>
                                                            Category:
                                                        </strong>{" "}
                                                        {quote.category ||
                                                            "General"}
                                                    </p>
                                                    <p>
                                                        <strong>
                                                            Submitted Date:
                                                        </strong>{" "}
                                                        {formatDate(
                                                            quote.uploadedAt
                                                        )}
                                                    </p>
                                                    <p>
                                                        <strong>Amount:</strong>{" "}
                                                        ₹
                                                        {parseFloat(
                                                            quote.totalAmount.toString()
                                                        ).toLocaleString()}
                                                    </p>
                                                    <p>
                                                        <strong>Status:</strong>{" "}
                                                        <span
                                                            className={
                                                                quote.status ===
                                                                "APPROVED"
                                                                    ? "text-green-600 font-medium"
                                                                    : quote.status ===
                                                                      "REJECTED"
                                                                    ? "text-red-600 font-medium"
                                                                    : "text-yellow-600 font-medium"
                                                            }
                                                        >
                                                            {quote.status}
                                                        </span>
                                                    </p>
                                                    {quote.boqItems &&
                                                        quote.boqItems.length >
                                                            0 && (
                                                            <div className="mt-2 p-2 bg-gray-50 rounded">
                                                                <span className="text-xs text-gray-500">
                                                                    BOQ Items:{" "}
                                                                    {
                                                                        quote
                                                                            .boqItems
                                                                            .length
                                                                    }{" "}
                                                                    | Total: ₹
                                                                    {quote.boqItems
                                                                        .reduce(
                                                                            (
                                                                                sum,
                                                                                item
                                                                            ) =>
                                                                                sum +
                                                                                (item.amount ||
                                                                                    0),
                                                                            0
                                                                        )
                                                                        .toLocaleString()}
                                                                </span>
                                                            </div>
                                                        )}
                                                    <div className="mb-4"></div>
                                                    <Button
                                                        className="mb-4 mr-2"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleViewPDF(
                                                                quote
                                                            );
                                                        }}
                                                    >
                                                        View File
                                                    </Button>
                                                    <Button
                                                        className="mb-4 bg-red-500 hover:bg-red-700 text-white"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteQuote(
                                                                quote.id
                                                            );
                                                        }}
                                                    >
                                                        Delete
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                ))
                            ) : (
                                <div className="mt-6 text-center p-6 bg-gray-50 rounded-lg">
                                    <p className="text-gray-500">
                                        No quotes found for this project
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Table showing quotes */}
                <div className="overflow-x-auto">
                    <Table className="w-full">
                        <TableHeader>
                            <TableRow>
                                <TableHead>Vendor</TableHead>
                                <TableHead>Project</TableHead>
                                <TableHead>Submitted Date</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {quotes.map((quote) => (
                                <TableRow key={quote.id}>
                                    <TableCell>{quote.vendor.name}</TableCell>
                                    <TableCell>{quote.project.name}</TableCell>
                                    <TableCell>
                                        {formatDate(quote.uploadedAt)}
                                    </TableCell>
                                    <TableCell>
                                        {quote.category || "General"}
                                    </TableCell>
                                    <TableCell>
                                        <span
                                            className={
                                                quote.status === "APPROVED"
                                                    ? "text-green-600 font-medium"
                                                    : quote.status ===
                                                      "REJECTED"
                                                    ? "text-red-600 font-medium"
                                                    : "text-yellow-600 font-medium"
                                            }
                                        >
                                            {quote.status}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                handleViewQuote(quote)
                                            }
                                            className="mr-2"
                                        >
                                            View
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() =>
                                                handleDeleteQuote(quote.id)
                                            }
                                        >
                                            Delete
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Modal for viewing quote */}
            <Dialog open={isQuoteModalOpen} onOpenChange={setIsQuoteModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Quote Details</DialogTitle>
                    </DialogHeader>
                    {selectedQuote && (
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Vendor
                                    </p>
                                    <p className="font-medium">
                                        {selectedQuote.vendor.name}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Project
                                    </p>
                                    <p className="font-medium">
                                        {selectedQuote.project.name}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Category
                                    </p>
                                    <p className="font-medium">
                                        {selectedQuote.category || "General"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Submitted On
                                    </p>
                                    <p className="font-medium">
                                        {formatDate(selectedQuote.uploadedAt)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Amount
                                    </p>
                                    <p className="font-medium">
                                        ₹
                                        {parseFloat(
                                            selectedQuote.totalAmount.toString()
                                        ).toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Status
                                    </p>
                                    <p
                                        className={`font-medium ${
                                            selectedQuote.status === "APPROVED"
                                                ? "text-green-600"
                                                : selectedQuote.status ===
                                                  "REJECTED"
                                                ? "text-red-600"
                                                : "text-yellow-600"
                                        }`}
                                    >
                                        {selectedQuote.status}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <Button
                                    onClick={() => handleViewPDF(selectedQuote)}
                                    className="mt-2 w-full"
                                >
                                    View PDF
                                </Button>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500 mb-1">
                                    Notes
                                </p>
                                <Textarea
                                    placeholder="Add comments or notes about this quote"
                                    value={quoteNotes}
                                    onChange={(e) =>
                                        setQuoteNotes(e.target.value)
                                    }
                                    className="mb-4"
                                />
                            </div>

                            {/* BOQ Items Accordion */}
                            {selectedQuote?.boqItems &&
                                selectedQuote.boqItems.length > 0 && (
                                    <div className="mt-4">
                                        <h4 className="font-semibold mb-2">
                                            Bill of Quantities
                                        </h4>
                                        <Table className="border rounded">
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>
                                                        Sl. No
                                                    </TableHead>
                                                    <TableHead>
                                                        Work Detail
                                                    </TableHead>
                                                    <TableHead>
                                                        Amount (₹)
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {selectedQuote.boqItems.map(
                                                    (item, idx) => (
                                                        <TableRow
                                                            key={item.id || idx}
                                                        >
                                                            <TableCell>
                                                                {item.slNo}
                                                            </TableCell>
                                                            <TableCell>
                                                                {
                                                                    item.workDetail
                                                                }
                                                            </TableCell>
                                                            <TableCell>
                                                                ₹
                                                                {item.amount.toLocaleString()}
                                                            </TableCell>
                                                        </TableRow>
                                                    )
                                                )}
                                            </TableBody>
                                        </Table>
                                        <div className="text-right mt-2 text-sm text-gray-700 font-medium">
                                            Total: ₹
                                            {selectedQuote.boqItems
                                                .reduce(
                                                    (sum, item) =>
                                                        sum +
                                                        (item.amount || 0),
                                                    0
                                                )
                                                .toLocaleString()}
                                        </div>
                                    </div>
                                )}
                        </div>
                    )}
                    <DialogFooter className="flex justify-between">
                        {selectedQuote &&
                            selectedQuote.status === "PENDING" && (
                                <>
                                    <Button
                                        onClick={handleApproveQuote}
                                        className="bg-green-500 text-white hover:bg-green-700"
                                    >
                                        Approve
                                    </Button>
                                    <Button
                                        onClick={handleRejectQuote}
                                        className="bg-red-500 text-white hover:bg-red-700"
                                    >
                                        Reject
                                    </Button>
                                </>
                            )}
                        <Button onClick={() => setIsQuoteModalOpen(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Compare Quotes Section */}
            {selectedProject && filteredQuotes.length > 0 && (
                <div className="mt-10">
                    <h2 className="text-2xl font-bold mb-4">Compare Quotes</h2>
                    {/* Category filter for compare section */}
                    <div className="mb-4 flex flex-wrap gap-2">
                        <Button
                            variant={
                                selectedCompareCategory === ""
                                    ? "default"
                                    : "outline"
                            }
                            onClick={() => setSelectedCompareCategory("")}
                            size="sm"
                        >
                            All Categories
                        </Button>
                        {Array.from(
                            new Set(
                                filteredQuotes.map(
                                    (q) => q.category || "General"
                                )
                            )
                        ).map((cat) => (
                            <Button
                                key={cat}
                                variant={
                                    selectedCompareCategory === cat
                                        ? "default"
                                        : "outline"
                                }
                                onClick={() => setSelectedCompareCategory(cat)}
                                size="sm"
                            >
                                {cat}
                            </Button>
                        ))}
                    </div>
                    {(() => {
                        // Filter quotes by selected category for comparison
                        const compareQuotes = selectedCompareCategory
                            ? filteredQuotes.filter(
                                  (q) =>
                                      (q.category || "General") ===
                                      selectedCompareCategory
                              )
                            : filteredQuotes;
                        if (compareQuotes.length === 0) {
                            return (
                                <div className="p-6 text-center text-gray-500 bg-gray-50 rounded-lg">
                                    No quotes found for this category
                                </div>
                            );
                        }
                        // Gather all unique BOQ items (by slNo + workDetail)
                        const allBoqItemsMap = new Map();
                        compareQuotes.forEach((quote) => {
                            (quote.boqItems || []).forEach((item) => {
                                const key = `${item.slNo}||${item.workDetail}`;
                                if (!allBoqItemsMap.has(key)) {
                                    allBoqItemsMap.set(key, {
                                        slNo: item.slNo,
                                        workDetail: item.workDetail,
                                    });
                                }
                            });
                        });
                        // Sort by slNo
                        const allBoqItems = Array.from(
                            allBoqItemsMap.values()
                        ).sort((a, b) => {
                            if (a.slNo && b.slNo) return a.slNo - b.slNo;
                            return 0;
                        });
                        // Sort vendors by total price
                        const sortedQuotes = [...compareQuotes].sort(
                            (a, b) =>
                                (a.totalAmount || 0) - (b.totalAmount || 0)
                        );
                        return (
                            <div className="overflow-x-auto">
                                <Table className="w-full border">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Sl. No</TableHead>
                                            <TableHead>Work Detail</TableHead>
                                            {sortedQuotes.map((quote) => (
                                                <TableHead
                                                    key={
                                                        quote.vendor.id +
                                                        "-" +
                                                        quote.id
                                                    }
                                                    className="text-center"
                                                >
                                                    {quote.vendor.name}
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {allBoqItems.map((boq, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell>
                                                    {boq.slNo}
                                                </TableCell>
                                                <TableCell>
                                                    {boq.workDetail}
                                                </TableCell>
                                                {sortedQuotes.map((quote) => {
                                                    const item = (
                                                        quote.boqItems || []
                                                    ).find(
                                                        (i) =>
                                                            i.slNo ===
                                                                boq.slNo &&
                                                            i.workDetail ===
                                                                boq.workDetail
                                                    );
                                                    return (
                                                        <TableCell
                                                            key={
                                                                quote.vendor
                                                                    .id +
                                                                "-" +
                                                                quote.id
                                                            }
                                                            className="text-right"
                                                        >
                                                            {item ? (
                                                                `₹${item.amount.toLocaleString()}`
                                                            ) : (
                                                                <span className="text-gray-400">
                                                                    -
                                                                </span>
                                                            )}
                                                        </TableCell>
                                                    );
                                                })}
                                            </TableRow>
                                        ))}
                                        {/* Total row */}
                                        <TableRow className="font-bold bg-gray-50">
                                            <TableCell
                                                colSpan={2}
                                                className="text-right"
                                            >
                                                Total
                                            </TableCell>
                                            {sortedQuotes.map((quote) => (
                                                <TableCell
                                                    key={
                                                        quote.vendor.id +
                                                        "-" +
                                                        quote.id
                                                    }
                                                    className="text-right"
                                                >
                                                    ₹
                                                    {(
                                                        quote.totalAmount || 0
                                                    ).toLocaleString()}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>
                        );
                    })()}
                </div>
            )}
        </div>
    );
}
