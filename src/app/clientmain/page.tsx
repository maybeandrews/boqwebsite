import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button"
import Link from "next/link"
const projects = [
  { name: "Project 1", status:"pending" },
  { name: "Project 2",status:"Approved" },
  { name: "Project 3",status:"Not proceeding with the qoute" },
  { name: "Project 4",status:"Not proceeding with the qoute"} 
];

export default function ClientDashboard() {
  return (
    <><div><h1 className="text-3xl font-bold mb-10  ">Main Dashboard</h1>
      </div>
      <div className="flex justify-between space-x-6 margin -0 p-0">
                <div className="w-[440px] h-screen flex flex-col justify-start items-center gap-4">
                    <h1 className="text-lg font-semibold">Projects Open</h1>
                    <Link href="#"><span>Download BOQ</span> </Link>
                </div>


              <div className="grid gap-1 md:grid-cols-1 lg:grid-cols-1 w-1/2 h-full ">
                  {projects.map((project) => (
                      <Card key={project.name} className="shadow-md">
                          <CardHeader>
                              <CardTitle>{project.name}</CardTitle>
                          </CardHeader>
                          <CardContent className="text-sm">
                              <p><span className="font-semibold">Qoute for:</span> {project.name}-</p><p>{project.status}</p>
                          </CardContent>
                      </Card>
                  ))}
              </div>
            <div className="relative h-screen">
                <Button className="absolute bottom-40 right-4 z-100">+</Button>
            </div>


    </div></>
  );
}
