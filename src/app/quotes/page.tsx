import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const quotes = [
  { id: 1, vendor: "Vendor A", project: "Project X", status: "approved", submittedDate: "2023-07-10" },
  { id: 2, vendor: "Vendor B", project: "Project Y", status: "pending", submittedDate: "2023-07-12" },
  { id: 3, vendor: "Vendor C", project: "Project Z", status: "rejected", submittedDate: "2023-07-14" },
]

export default function QuotesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Quotes Summary</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Vendor</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Submitted Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quotes.map((quote) => (
            <TableRow key={quote.id}>
              <TableCell>{quote.vendor}</TableCell>
              <TableCell>{quote.project}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    quote.status === "approved" ? "default" : quote.status === "pending" ? "secondary" : "destructive"
                  }
                >
                  {quote.status}
                </Badge>
              </TableCell>
              <TableCell>{quote.submittedDate}</TableCell>
              <TableCell className="text-right">
                <Button variant="outline" size="sm">
                  View Quote
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

