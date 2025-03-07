"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";

// Define types
type Project = {
  id: number;
  name: string;
};

type Invoice = {
  id: number;
  fileName: string;
  uploadDate: string;
  notes: string;
  filePath: string;
};

export default function BOQPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState<string>("");
  const [uploadedInvoices, setUploadedInvoices] = useState<Invoice[]>([]);
  const router = useRouter();

  // ✅ Fetch projects & invoices from `/api/clientupload`
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/clientupload");
        if (!res.ok) throw new Error("Failed to fetch data");
        const data = await res.json();
        setProjects(data.projects); // Ensure API returns `{ projects: [...] }`
        setUploadedInvoices(data.invoices); // Ensure API returns `{ invoices: [...] }`
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    fetchData();
  }, []);

  // ✅ Handle file upload (POST to `/api/clientupload`)
  async function handleUpload() {
    if (!file || !selectedProject) {
      alert("Please select a project and choose a file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("projectId", selectedProject);
    formData.append("notes", notes);

    try {
      const res = await fetch("/api/clientupload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      alert("Invoice uploaded successfully!");

      // Refresh uploaded invoices
      router.refresh();
    } catch (error) {
      console.error("Error uploading invoice:", error);
      alert("Failed to upload invoice.");
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Performa Invoice & Management</h1>

      {/* Upload Form */}
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold mb-4">Upload New Invoice</h2>
          <div className="space-y-4">
            {/* ✅ Select Project Dropdown */}
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="border p-2 w-full"
            >
              <option value="">Select a project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>

            {/* ✅ File Upload */}
            <Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />

            {/* ✅ Notes */}
            <Textarea placeholder="Add notes or remarks" value={notes} onChange={(e) => setNotes(e.target.value)} />

            <Button onClick={handleUpload}>Upload Invoice</Button>
          </div>
        </div>

        {/* Uploaded Invoices */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Uploaded Invoices</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Upload Date</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {uploadedInvoices.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>{doc.fileName}</TableCell>
                  <TableCell>{new Date(doc.uploadDate).toLocaleDateString()}</TableCell>
                  <TableCell>{doc.notes}</TableCell>
                  <TableCell className="text-right">
                    <a href={doc.filePath} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm">View</Button>
                    </a>
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
