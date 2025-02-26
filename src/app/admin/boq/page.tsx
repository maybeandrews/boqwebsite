"use client"

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
    const [selectedQuote, setSelectedQuote] = useState<BOQ | null>(null);

    const handleFileChange = (category: string, event: ChangeEvent<HTMLInputElement>) => {
        setFiles({ ...files, [category]: event.target.files ? event.target.files[0] : null });
    };

    const handleNoteChange = (category: string, event: ChangeEvent<HTMLTextAreaElement>) => {
        setNotes({ ...notes, [category]: event.target.value });
    };

    const handleUpload = () => {
        if (!selectedProject) return alert("Please select a project");

        const newUploads = boqCategories
            .filter((category) => files[category])
            .map((category) => ({
                project: selectedProject,
                category,
                file: files[category]?.name || "No file uploaded",
                notes: notes[category] || "No notes",
                uploadDate: new Date().toISOString().split("T")[0],
            }));

        if (newUploads.length === 0) {
            return alert("Please upload at least one BOQ file.");
        }

        setUploadedBOQs((prevUploads) => [...prevUploads, ...newUploads]);
        setFiles({});
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
        setFiles((prevFiles) => {
            const newFiles = { ...prevFiles, [newCategory]: prevFiles[oldCategory] };
            delete newFiles[oldCategory];
            return newFiles;
        });
        setNotes((prevNotes) => {
            const newNotes = { ...prevNotes, [newCategory]: prevNotes[oldCategory] };
            delete newNotes[oldCategory];
            return newNotes;
        });
    };

    const handleDeleteCategory = (category: string) => {
        setBoqCategories((prevCategories) => prevCategories.filter((cat) => cat !== category));
        setFiles((prevFiles) => {
            const newFiles = { ...prevFiles };
            delete newFiles[category];
            return newFiles;
        });
        setNotes((prevNotes) => {
            const newNotes = { ...prevNotes };
            delete newNotes[category];
            return newNotes;
        });
    };

    const handleViewQuote = (quote: BOQ) => {
        setSelectedQuote(quote);
        setIsQuoteModalOpen(true);
    };

    const handleApproveQuote = () => {
        // Implement approval logic here
        setIsQuoteModalOpen(false);
    };

    const handleRejectQuote = () => {
        // Implement rejection logic here
        setIsQuoteModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">BOQ Upload & Management</h1>
            <div className="grid gap-6 md:grid-cols-2">
                <div>
                    <h2 className="text-xl font-semibold mb-4">Upload New BOQ</h2>
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
                    <div className="space-y-4 mt-4">
                        {boqCategories.map((category) => (
                            <div key={category}>
                                <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 rounded-lg">
                                    <CardContent>
                                        <div className="rounded-md mb-4">
                                            <Input
                                                type="text"
                                                defaultValue={category}
                                                onBlur={(e) => handleRenameCategory(category, e.target.value)}
                                                className="mb-2"
                                            />
                                            <Input type="file" onChange={(e) => handleFileChange(category, e)} className="mb-2" />
                                            <Textarea placeholder="Add notes or remarks" onChange={(e) => handleNoteChange(category, e)} className="mb-2" />
                                            <Button variant="destructive" onClick={() => handleDeleteCategory(category)} className="bg-red-500 text-white hover:bg-red-700">Delete</Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        ))}
                        <Button onClick={() => setIsModalOpen(true)} className="w-full bg-green-500 text-white hover:bg-green-700">+ Add New BOQ</Button>
                        <Button onClick={handleUpload} className="w-full bg-black text-white hover:bg-gray-800">Upload BOQs</Button>
                    </div>
                </div>
                <div>
                    <h2 className="text-xl font-semibold mb-4">Uploaded BOQs</h2>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Project</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>File Name</TableHead>
                                <TableHead>Upload Date</TableHead>
                                <TableHead>Notes</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {uploadedBOQs.filter((doc) => doc.project === selectedProject).map((doc, index) => (
                                <TableRow key={index}>
                                    <TableCell>{doc.project}</TableCell>
                                    <TableCell>{doc.category}</TableCell>
                                    <TableCell>{doc.file}</TableCell>
                                    <TableCell>{doc.uploadDate}</TableCell>
                                    <TableCell>{doc.notes}</TableCell>
                                    <TableCell>
                                        <Button onClick={() => handleViewQuote(doc)} className="bg-blue-500 text-white hover:bg-blue-700">View Quote</Button>
                                        <Button variant="destructive" onClick={() => handleDelete(index)} className="bg-black text-white hover:bg-gray-800">Delete</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
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
                        <div>
                            <p><strong>Project:</strong> {selectedQuote.project}</p>
                            <p><strong>Category:</strong> {selectedQuote.category}</p>
                            <p><strong>File:</strong> {selectedQuote.file}</p>
                            <p><strong>Upload Date:</strong> {selectedQuote.uploadDate}</p>
                            <p><strong>Notes:</strong> {selectedQuote.notes}</p>
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