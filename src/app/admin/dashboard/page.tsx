import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Send } from "lucide-react";
import { CreateProjectDialog } from "@/components/create-project-dialog";

type Project = {
    id: string;
    name: string;
    description: string;
    vendors: number;
    quotes: number;
    deadline: string;
    tags: string[];
    status: string;
};

const projects: Project[] = [
    {
        id: "1",
        name: "Project A",
        description: "Construction of new office building",
        vendors: 5,
        quotes: 3,
        deadline: "2023-08-31",
        tags: ["Construction", "Electrical"],
        status: "draft",
    },
    {
        id: "2",
        name: "Project B",
        vendors: 8,
        quotes: 6,
        deadline: "2023-09-15",
        description: "",
        tags: [],
        status: "draft",
    },
    {
        id: "3",
        name: "Project C",
        vendors: 3,
        quotes: 2,
        deadline: "2023-09-30",
        description: "",
        tags: [],
        status: "active",
    },
];

export default function DashboardPage() {
    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Projects Dashboard</h1>
                <CreateProjectDialog />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {projects.map((project) => (
                    <Card
                        key={project.id}
                        className="hover:shadow-lg transition-shadow"
                    >
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle>{project.name}</CardTitle>
                                    <CardDescription className="mt-2">
                                        {project.description}
                                    </CardDescription>
                                </div>
                                <Badge
                                    variant={
                                        project.status === "draft"
                                            ? "secondary"
                                            : "default"
                                    }
                                >
                                    {project.status}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex flex-wrap gap-2">
                                    {project.tags.map((tag) => (
                                        <Badge key={tag} variant="outline">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium">
                                            Vendors
                                        </p>
                                        <p className="text-2xl font-bold">
                                            {project.vendors}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">
                                            Quotes
                                        </p>
                                        <p className="text-2xl font-bold">
                                            {project.quotes}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Deadline:{" "}
                                        {new Date(
                                            project.deadline
                                        ).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2">
                            <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </Button>
                            {project.status === "draft" && (
                                <Button size="sm">
                                    <Send className="h-4 w-4 mr-2" />
                                    Publish
                                </Button>
                            )}
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
