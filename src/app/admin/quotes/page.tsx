"use client";

import { useState, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const initialProjects = ["Project A", "Project B", "Project C"];
const initialBoqCategories = ["Electrical", "Plumbing", "Mechanical", "Civil Works"];

type BOQ = {
    project: string;
    category: string;
    file: string;
    notes: string;
    uploadDate: string;
};

type Quote = {
    vendor: string;
    project: string;
    submissionDate: string;
    pdf: string;
    comments: string;
    status: string;
    category: string;
};

const initialQuotes: Quote[] = [
    { vendor: "Vendor A", project: "Project A", submissionDate: "2023-07-10", pdf: "quoteA.pdf", comments: "", status: "", category: "Electrical" },
    { vendor: "Vendor B", project: "Project B", submissionDate: "2023-07-12", pdf: "quoteB.pdf", comments: "", status: "", category: "Plumbing" },
    { vendor: "Vendor C", project: "Project C", submissionDate: "2023-07-14", pdf: "quoteC.pdf", comments: "", status: "", category: "Mechanical" },
];

export default function BOQPage() {
    const [projects, setProjects] = useState<string[]>(initialProjects);
    const [boqCategories, setBoqCategories] = useState<string[]>(initialBoqCategories);
    const [selectedProject, setSelectedProject] = useState<string>("");
    const [uploadedBOQs, setUploadedBOQs] = useState<BOQ[]>([]);
    const [files, setFiles] = useState<{ [key: string]: File | null }>({});
    const [notes, setNotes] = useState<{ [key: string]: string }>({});
    const [newCategoryName, setNewCategoryName] = useState<string>("");
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isQuoteModalOpen, setIsQuoteModalOpen] = useState<boolean>(false);
    const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
    const [quotes, setQuotes] = useState<Quote[]>(initialQuotes);
    const [acceptedQuotes, setAcceptedQuotes] = useState<Quote[]>([]);
    const [rejectedQuotes, setRejectedQuotes] = useState<Quote[]>([]);
    const [tableRows, setTableRows] = useState<Quote[]>([]);

    const handleNoteChange = (category: string, event: ChangeEvent<HTMLTextAreaElement>) => {
        setNotes({ ...notes, [category]: event.target.value });
    };

    const handleUpload = () => {
        if (!selectedProject) return alert("Please select a project");

        const newUploads = boqCategories
            .map((category) => ({
                project: selectedProject,
                category,
                file: "No file uploaded",
                notes: notes[category] || "No notes",
                uploadDate: new Date().toISOString().split("T")[0],
            }));

        setUploadedBOQs((prevUploads) => [...prevUploads, ...newUploads]);
        setNotes({});
    };

    const handleDelete = (index: number) => {
        setUploadedBOQs((prevUploads) => prevUploads.filter((_, i) => i !== index));
    };

    const handleAddBoqCategory = () => {
        if (!newCategoryName.trim()) {
            return alert("Please enter a category name.");
        }
        setBoqCategories([...boqCategories, newCategoryName]);
        setNewCategoryName("");
        setIsModalOpen(false);
    };

    const handleRenameCategory = (oldCategory: string, newCategory: string) => {
        setBoqCategories((prevCategories) =>
            prevCategories.map((category) => (category === oldCategory ? newCategory : category))
        );
        setNotes((prevNotes) => {
            const newNotes = { ...prevNotes, [newCategory]: prevNotes[oldCategory] };
            delete newNotes[oldCategory];
            return newNotes;
        });
    };

    const handleDeleteCategory = (category: string) => {
        setBoqCategories((prevCategories) => prevCategories.filter((cat) => cat !== category));
        setNotes((prevNotes) => {
            const newNotes = { ...prevNotes };
            delete newNotes[category];
            return newNotes;
        });
    };

    const handleViewQuote = (quote: Quote) => {
        setSelectedQuote(quote);
        setIsQuoteModalOpen(true);
    };

    const handleApproveQuote = () => {
        if (selectedQuote) {
            const updatedQuote = { ...selectedQuote, status: "Approved" };
            setAcceptedQuotes([...acceptedQuotes, updatedQuote]);
            setQuotes(quotes.filter((quote) => quote !== selectedQuote));
            setTableRows([...tableRows, updatedQuote]);
            setIsQuoteModalOpen(false);
        }
    };

    const handleRejectQuote = () => {
        if (selectedQuote) {
            const updatedQuote = { ...selectedQuote, status: "Rejected" };
            setRejectedQuotes([...rejectedQuotes, updatedQuote]);
            setQuotes(quotes.filter((quote) => quote !== selectedQuote));
            setTableRows([...tableRows, updatedQuote]);
            setIsQuoteModalOpen(false);
        }
    };

    const handleViewPDF = (pdf: string) => {
        window.open(pdf, "_blank");
    };

    const handleCommentChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        if (selectedQuote) {
            setSelectedQuote({ ...selectedQuote, comments: event.target.value });
        }
    };

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
                            {projects.map((project, index) => (
                                <SelectItem key={index} value={project}>{project}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {selectedProject && (
                        <div className="space-y-4 mt-4">
                            {boqCategories.map((category, index) => (
                                <div key={category}>
                                    <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 rounded-lg">
                                        <CardContent>
                                            <div className="rounded-md mb-4">
                                                <p><strong>Vendor:</strong> Vendor {String.fromCharCode(65 + index)}</p>
                                                <p><strong>Category:</strong> {category}</p>
                                                <p><strong>Submitted Date:</strong> {new Date().toISOString().split("T")[0]}</p>
                                                <div className="mb-4"></div>
                                                <Button className="mb-4">View File</Button>
                                                <Textarea placeholder="Add notes or remarks" onChange={(e) => handleNoteChange(category, e)} className="mb-2" />
                                            </div>
                                            <div className="flex justify-center space-x-4">
                                                <Button onClick={handleApproveQuote} className="bg-green-500 text-white hover:bg-green-700 w-full">Accept</Button>
                                                <Button onClick={handleRejectQuote} className="bg-red-500 text-white hover:bg-red-700 w-full">Reject</Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                {selectedProject && (
                    <div className="overflow-x-auto">
                        <Table className="w-full">
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Vendor</TableHead>
                                    <TableHead>Project</TableHead>
                                    <TableHead>Submitted Date</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tableRows.map((quote, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{quote.vendor}</TableCell>
                                        <TableCell>{quote.project}</TableCell>
                                        <TableCell>{quote.submissionDate}</TableCell>
                                        <TableCell>{quote.category}</TableCell>
                                        <TableCell>{quote.status}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>

            {/* Modal for adding new BOQ category */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New BOQ Category</DialogTitle>
                    </DialogHeader>
                    <Input
                        type="text"
                        placeholder="New BOQ Category Name"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        className="mb-2"
                    />
                    <DialogFooter>
                        <Button onClick={handleAddBoqCategory} className="bg-green-500 text-white hover:bg-green-700">Add</Button>
                        <Button onClick={() => setIsModalOpen(false)} className="bg-gray-500 text-white hover:bg-gray-700">Cancel</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal for viewing quote */}
            <Dialog open={isQuoteModalOpen} onOpenChange={setIsQuoteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>View Quote</DialogTitle>
                    </DialogHeader>
                    {selectedQuote && (
                        <div className="quote-details-container">
                            <p><strong>Vendor:</strong> {selectedQuote.vendor}</p>
                            <p><strong>Project:</strong> {selectedQuote.project}</p>
                            <p><strong>Submitted Date:</strong> {selectedQuote.submissionDate}</p>
                            <p><strong>PDF:</strong> <Button onClick={() => handleViewPDF(selectedQuote.pdf)} className="bg-blue-500 text-white hover:bg-blue-700">View PDF</Button></p>
                            <p><strong>Comments:</strong></p>
                            <Textarea
                                placeholder="Add comments"
                                value={selectedQuote.comments}
                                onChange={handleCommentChange}
                                className="mb-2"
                            />
                        </div>
                    )}
                    <DialogFooter>
                        <Button onClick={handleApproveQuote} className="bg-green-500 text-white hover:bg-green-700">Approve</Button>
                        <Button onClick={handleRejectQuote} className="bg-red-500 text-white hover:bg-red-700">Reject</Button>
                        <Button onClick={() => setIsQuoteModalOpen(false)} className="bg-gray-500 text-white hover:bg-gray-700">Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
