

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-gray-50 to-gray-100">
            <div className="max-w-3xl text-center space-y-8">
                <h1 className="text-5xl font-bold text-gray-900">
                    Bill of Quantities Management System
                </h1>

                <p className="text-xl text-gray-600">
                    Streamline your construction project management with our
                    comprehensive BOQ solution
                </p>

                <div className="flex gap-4 justify-center">
                    <Link href="/admin/dashboard" passHref>
                        <Button asChild size="lg" variant="default"> 
                            <span>Go to Dashboard</span> 
                        </Button>
                    </Link>

                    <Link href="/login" passHref>
                        <Button asChild size="lg" variant="outline"> 
                            <span>Login</span> 
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
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
        <div className="p-6 bg-white rounded-lg shadow-sm">
            <h3 className="font-semibold text-lg mb-2">{title}</h3>
            <p className="text-gray-600">{description}</p>
        </div>
    );
}
