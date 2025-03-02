"use client";
import { useState } from "react";
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

export default function SignupPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [successMessage, setSuccessMessage] = useState<string>("");

    async function onSubmit(event: React.SyntheticEvent) {
        event.preventDefault();
        setIsLoading(true);
        setErrorMessage("");
        setSuccessMessage("");

        // Simulate signup (replace with your actual signup logic)
        setTimeout(() => {
            // Here you would typically make an API call to your backend to create the user
            // For this example, we'll just simulate a successful signup
            setIsLoading(false);
            setSuccessMessage(
                "Your account has been created successfully. Please check your email inbox for a confirmation link to activate your account."
            );
            // In a real application, you might want to redirect the user to a login page or a confirmation page
        }, 1000); // Simulate network delay
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Card className="w-[400px]">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl text-center">
                        Sign Up
                    </CardTitle>
                    <CardDescription className="text-center">
                        Create an account to continue
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {successMessage ? (
                        <p className="text-green-600 text-center">
                            {successMessage}
                        </p>
                    ) : (
                        <form onSubmit={onSubmit}>
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        autoComplete="email"
                                        disabled={isLoading}
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        disabled={isLoading}
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                    />
                                </div>

                                {errorMessage && (
                                    <p className="text-red-500 text-center">
                                        {errorMessage}
                                    </p>
                                )}

                                <Button disabled={isLoading}>
                                    {isLoading && (
                                        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    Sign Up
                                </Button>
                            </div>
                        </form>
                    )}
                    <div className="mt-4 text-center text-sm">
                        Already have an account?{" "}
                        <Link
                            href="/login"
                            className="text-blue-600 hover:text-blue-800"
                        >
                            Log in
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
