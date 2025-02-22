import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const vendors = [
  { id: 1, name: "Vendor A", document: "Sagar-name.pdf", approved: true },
  { id: 2, name: "Vendor B", document: "Gweaver-name.pdf", approved: false },
  { id: 3, name: "Vendor C", document: "Vendor-C-doc.pdf", approved: true },
]

export default function VendorsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Vendor Management</h1>
      <Tabs defaultValue="electrical">
        <TabsList>
          <TabsTrigger value="electrical">Electrical BOQ</TabsTrigger>
          <TabsTrigger value="plumbing">Plumbing BOQ</TabsTrigger>
        </TabsList>
        <TabsContent value="electrical">
          <VendorTable vendors={vendors} />
        </TabsContent>
        <TabsContent value="plumbing">
          <VendorTable vendors={vendors} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function VendorTable({ vendors }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <Input className="w-[300px]" placeholder="Search vendors..." />
        <Button>Add Vendor</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Approved</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Document</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vendors.map((vendor) => (
            <TableRow key={vendor.id}>
              <TableCell>
                <Checkbox checked={vendor.approved} />
              </TableCell>
              <TableCell>{vendor.name}</TableCell>
              <TableCell>{vendor.document}</TableCell>
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
  )
}

