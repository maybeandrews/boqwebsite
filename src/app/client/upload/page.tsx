import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"

const boqDocuments = [
  { id: 1, name: "Invoice1.pdf", uploadDate: "2023-07-15", notes: "Required materials " },
  { id: 2, name: "Invoice2.pdf", uploadDate: "2023-07-16", notes: "Revised quantities" },
]

export default function BOQPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Performa Invoice & Management</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold mb-4">Upload New Invoice</h2>
          <div className="space-y-4">
            <Input type="file" />
            <Textarea placeholder="Add notes or remarks" />
            <Button>Upload BOQ</Button>
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">Uploaded  Invoices</h2>
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
              {boqDocuments.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>{doc.name}</TableCell>
                  <TableCell>{doc.uploadDate}</TableCell>
                  <TableCell>{doc.notes}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
