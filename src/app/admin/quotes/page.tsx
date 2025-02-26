"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const quotesData = [
  { 
    id: 1, 
    vendor: "Vendor A", 
    project: "Project X", 
    status: "approved", 
    submittedDate: "2023-07-10", 
    subsections: {
      construction: "/path/to/construction.pdf",
      electrical: "/path/to/electrical.pdf",
      plumbing: "/path/to/plumbing.pdf"
    }
  },
  { 
    id: 2, 
    vendor: "Vendor B", 
    project: "Project Y", 
    status: "pending", 
    submittedDate: "2023-07-12", 
    subsections: {
      construction: "/path/to/construction2.pdf",
      electrical: "/path/to/electrical2.pdf",
      plumbing: "/path/to/plumbing2.pdf"
    }
  },
  { 
    id: 3, 
    vendor: "Vendor C", 
    project: "Project Z", 
    status: "rejected", 
    submittedDate: "2023-07-14", 
    subsections: {
      construction: "/path/to/construction3.pdf",
      electrical: "/path/to/electrical3.pdf",
      plumbing: "/path/to/plumbing3.pdf"
    }
  },
]

export default function QuotesPage() {
  const [quotes, setQuotes] = useState(quotesData)
  const [selectedQuote, setSelectedQuote] = useState<any | null>(null)
  const [comments, setComments] = useState<string>("")
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleViewQuoteClick = (quote: any) => {
    setSelectedQuote(quote)
  }

  const handleAcceptClick = () => {
    setQuotes(quotes.map(q => q.id === selectedQuote.id ? { ...q, status: "approved" } : q))
    setSelectedQuote(null)
  }

  const handleRejectClick = () => {
    setQuotes(quotes.map(q => q.id === selectedQuote.id ? { ...q, status: "rejected" } : q))
    setSelectedQuote(null)
  }

  if (!isClient) {
    return null
  }

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
                <Button size="sm" onClick={() => handleViewQuoteClick(quote)}>
                  View Quote
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedQuote && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-lg w-1/2 h-3/4 overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Quote Details</h2>
            <div className="mb-4">
              <h3 className="font-semibold text-lg">Vendor</h3>
              <p className="text-gray-700">{selectedQuote.vendor}</p>
            </div>
            <div className="mb-4">
              <h3 className="font-semibold text-lg">Project</h3>
              <p className="text-gray-700">{selectedQuote.project}</p>
            </div>
            <div className="mb-4">
              <h3 className="font-semibold text-lg">Status</h3>
              <p className="text-gray-700">{selectedQuote.status}</p>
            </div>
            <div className="mb-4">
              <h3 className="font-semibold text-lg">Submitted Date</h3>
              <p className="text-gray-700">{selectedQuote.submittedDate}</p>
            </div>
            <div className="mb-6">
              <h3 className="font-semibold text-lg">Quotations</h3>
              <div className="space-y-2">
                {Object.entries(selectedQuote.subsections).map(([section, pdfUrl]) => (
                  <div key={section} className="flex justify-between items-center">
                    <span className="text-gray-700 capitalize">{section}</span>
                    <Button size="sm" className="bg-blue-600 text-white">
                      View PDF
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            <div className="mb-6">
              <h3 className="font-semibold text-lg">Comments</h3>
              <textarea
                className="w-full p-3 border rounded-lg"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <Button size="sm" onClick={() => setSelectedQuote(null)} className="bg-gray-500 text-white">
                Close
              </Button>
              <Button size="sm" onClick={handleRejectClick} className="bg-red-600 text-white">
                Reject
              </Button>
              <Button size="sm" onClick={handleAcceptClick} className="bg-green-600 text-white">
                Accept
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}