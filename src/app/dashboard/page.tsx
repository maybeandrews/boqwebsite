import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const projects = [
  { name: "Project A", vendors: 5, quotes: 3, deadline: "2023-08-31" },
  { name: "Project B", vendors: 8, quotes: 6, deadline: "2023-09-15" },
  { name: "Project C", vendors: 3, quotes: 2, deadline: "2023-09-30" },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.name}>
            <CardHeader>
              <CardTitle>{project.name}</CardTitle>
              <CardDescription>Deadline: {project.deadline}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Vendors</p>
                  <p className="text-2xl font-bold">{project.vendors}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Quotes</p>
                  <p className="text-2xl font-bold">{project.quotes}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

