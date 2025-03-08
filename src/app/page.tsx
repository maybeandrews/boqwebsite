

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center">
            <div className="absolute h-full w-full inset-0 bg-gradient-to-b from-blue-100 via-blue-200 to-blue-400 z-[-10]"></div>
            <div className="max-w-3xl text-center space-y-8">
                <h1 className="text-5xl font-bold text-gray-900">
                    Bill of Quantities Management System
                </h1>

                <p className="text-xl text-gray-600">
                    Streamline your construction project management with our
                    comprehensive BOQ solution
                </p>

                <div className="flex gap-4 justify-center items-center">
                   { /* <Link href="/admin/dashboard" passHref>
                        <Button asChild size="lg" variant="default"> 
                            <span>Go to Dashboard</span> 
                        </Button>
                    </Link> */}

                    <Link href="/login" passHref>
                        <Button asChild size="lg" variant="outline" className="bg-blue-500 text-white hover:bg-blue-600 hover:text-white"> 
                            <span>Login</span> 
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 ">
                    <FeatureCard
                        title="Project Management"
                        description="Manage multiple construction projects efficiently"
                    />
                    <FeatureCard
                        title="Vendor Integration"
                        description="Connect with vendors and manage quotations"
                    />
                    <FeatureCard
                        title="Cost Tracking"
                        description="Track and analyze project costs in real-time"
                    />
                </div>
            </div>
        </div>
    );
}

// ✅ Extracted to avoid hydration mismatch
function FeatureCard({ title, description }: { title: string; description: string }) {
    return (
        <div className="p-6 bg-blue-100 rounded-lg shadow-lg">
            <h3 className="font-semibold text-lg mb-2">{title}</h3>
            <p className="text-gray-600">{description}</p>
        </div>
    );
}
