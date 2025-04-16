import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function HomePage() {
    return (
        <div className="min-h-screen flex flex-col bg-[#E5E5E5] relative">


            {/* Bottom right - Lifescape logo */}
            <div className="absolute bottom-7 right-4">
                <Image
                    src="/logo.png"
                    alt="Lifescape Logo"
                    width={100}
                    height={60}
                />
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col items-center justify-center">
                <div className="max-w-3xl text-center space-y-8">
                    <div className="relative bg-blue-900 text-white inline-block px-10 py-5 shadow-lg">
                        <h1 className="text-5xl font-bold tracking-wider uppercase">
                            LIFESCAPE SOLUTIONS
                        </h1>
                        <p className="absolute right-4 bottom-1 text-sm font-bold text-white">
                            an Arohana Venture
                        </p>
                    </div>

                    <p className="text-xl text-gray-700">
                        Streamline your construction project with our comprehensive management solution
                    </p>

                    <div className="flex gap-4 justify-center items-center">
                        <Link href="/login" passHref>
                            <Button
                                asChild
                                size="lg"
                                className="bg-orange-600 text-white hover:bg-orange-700 rounded-none"
                            >
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
                            title="Turnkey Solutions"
                            description="Seamless hassle free handover of properties"
                        />
                        <FeatureCard
                            title="Cost Tracking"
                            description="Track and analyze project costs in real-time"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

function FeatureCard({
    title,
    description,
}: {
    title: string;
    description: string;
}) {
    return (
        <div className="p-6 bg-white rounded-lg shadow-lg border border-black border-opacity-20">
            <h3 className="font-semibold text-lg mb-2 text-blue-900">
                {title}
            </h3>
            <p className="text-gray-700">{description}</p>
        </div>
    );
}
