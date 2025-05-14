"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/ui/icons";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string>("");

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsLoading(true);
        setError(""); // Clear any previous errors

        try {
            const result = await signIn("credentials", {
                username,
                password,
                redirect: false, // We'll handle redirection manually
            });

            if (result?.ok) {
                // Redirect based on username
                if (username.toLowerCase() === "admin") {
                    router.push("/admin/dashboard");
                } else {
                    router.push("/client/dashboard");
                }
            } else {
                setError(
                    "Login failed. Please check your credentials and try again."
                );
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Bottom right - Arohana logo */}
            <div className="absolute bottom-9 right-7 z-30 bg-white/70 rounded-md shadow-md p-1.5">
                <Image
                    src="/arohanalogo.jpeg"
                    alt="Arohana Logo"
                    width={100}
                    height={60}
                />
            </div>
            <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
                {/* Grey background overlay */}
                <div
                    className="absolute top-0 left-0 w-full h-full bg-[#5A5A5A] z-0"
                    style={{ backgroundColor: "#5A5A5A" }}
                ></div>

                {/* Background image with reduced opacity */}
                <Image
                    src="/lifescapelogo.png"
                    alt="Background"
                    width={1920}
                    height={1080}
                    priority
                    className="absolute top-0 left-0 w-full h-full object-cover opacity-100 z-1"
                />
                <Card className="w-[400px] z-10 ml-[550px] mb-[100px] shadow-2xl border-0 bg-white">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl text-center text-gray-800">
                            Welcome back
                        </CardTitle>
                        <CardDescription className="text-center text-gray-600">
                            Enter your credentials to sign in to your account
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit}>
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="username">Username</Label>
                                    <Input
                                        id="username"
                                        type="text"
                                        placeholder="Enter your username"
                                        autoCapitalize="none"
                                        autoCorrect="off"
                                        disabled={isLoading}
                                        value={username}
                                        onChange={(e) =>
                                            setUsername(e.target.value)
                                        }
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        disabled={isLoading}
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        required
                                    />
                                </div>

                                {error && (
                                    <p className="text-red-500 text-center">
                                        {error}
                                    </p>
                                )}
                                <Button
                                    disabled={isLoading}
                                    className="w-full bg-gray-700 text-white hover:bg-gray-800 rounded-none"
                                >
                                    {isLoading && (
                                        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    Sign In
                                </Button>
                            </div>
                        </form>

                        <div className="mt-4 text-center text-sm">
                            <Link
                                href="/forgot-password"
                                className="text-gray-600 hover:text-gray-700"
                            >
                                Forgot password?
                            </Link>
                        </div>

                        <div className="mt-2 text-center text-sm">
                            Don't have an account?{" "}
                            <Link
                                href="/signup"
                                className="text-gray-600 hover:text-gray-700"
                            >
                                Sign Up
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
