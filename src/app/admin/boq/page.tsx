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
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import {
    Dialog,
    DialogPortal,
    DialogOverlay,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

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
    const [newProjectName, setNewProjectName] = useState<string>("");
    const [newBoqCategory, setNewBoqCategory] = useState<string>("");

    const handleFileChange = (category: string, event: ChangeEvent<HTMLInputElement>) => {
        setFiles({ ...files, [category]: event.target.files ? event.target.files[0] : null });
    };

    const handleNoteChange = (category: string, event: ChangeEvent<HTMLTextAreaElement>) => {
        setNotes({ ...notes, [category]: event.target.value });
    };

    const handleUpload = () => {
        if (!selectedProject) return alert("Please select a project");

        const newUploads = boqCategories
            .filter((category) => files[category]) // Ensure only categories with files are added
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

    const handleAddProject = () => {
        if (newProjectName) {
            setProjects([...projects, newProjectName]);
            setNewProjectName("");
        }
        if (newBoqCategory) {
            setBoqCategories([...boqCategories, newBoqCategory]);
            setNewBoqCategory("");
        }
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
                                <Button onClick={() => handleDeleteCategory(category)} className="bg-red-500 text-white hover:bg-red-700 mb-2">Delete BOQ</Button>
                                <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 rounded-lg">
                                    <CardContent>
                                        <div className="rounded-md mb-4">
                                            <h3 className="text-lg font-semibold mb-2 mt-2">{category} BOQ</h3>
                                            <Input type="file" onChange={(e) => handleFileChange(category, e)} className="mb-2" />
                                            <Textarea placeholder="Add notes or remarks" onChange={(e) => handleNoteChange(category, e)} className="mb-2" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        ))}
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button className="bg-black text-white hover:bg-gray-800">+</Button>
                            </DialogTrigger>
                            <DialogPortal>
                                <DialogOverlay className="bg-black opacity-50" />
                                <DialogContent className="flex items-center justify-center p-4">
                                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                                        <DialogHeader>
                                            <DialogTitle>Add New BOQ Category</DialogTitle>
                                            <DialogDescription>
                                                Enter the BOQ category to add them to the list.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                            <Input
                                                placeholder="BOQ Category"
                                                value={newBoqCategory}
                                                onChange={(e) => setNewBoqCategory(e.target.value)}
                                            />
                                        </div>
                                        <DialogFooter className="mt-4">
                                            <Button onClick={handleAddProject} className="bg-black text-white hover:bg-gray-800">Add</Button>
                                        </DialogFooter>
                                    </div>
                                </DialogContent>
                            </DialogPortal>
                        </Dialog>
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
                            {uploadedBOQs.map((doc, index) => (
                                <TableRow key={index}>
                                    <TableCell>{doc.project}</TableCell>
                                    <TableCell>{doc.category}</TableCell>
                                    <TableCell>{doc.file}</TableCell>
                                    <TableCell>{doc.uploadDate}</TableCell>
                                    <TableCell>{doc.notes}</TableCell>
                                    <TableCell>
                                        <Button variant="destructive" onClick={() => handleDelete(index)} className="bg-black text-white hover:bg-gray-800">Delete</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
