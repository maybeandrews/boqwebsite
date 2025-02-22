"use client";
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
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

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string>("");

    async function onSubmit(event: React.SyntheticEvent) {
        event.preventDefault();
        setIsLoading(true);
        setErrorMessage("");

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        setIsLoading(false);

        if (error) {
            if (error.message.includes("Invalid login credentials")) {
                setErrorMessage("No such user found. Please sign up.");
            } else {
                setErrorMessage(error.message);
            }
        } else {
            router.push("/admin/dashboard");
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Card className="w-[400px]">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl text-center">
                        Welcome back
                    </CardTitle>
                    <CardDescription className="text-center">
                        Enter your credentials to sign in to your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={onSubmit}>
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    autoCapitalize="none"
                                    autoComplete="email"
                                    autoCorrect="off"
                                    disabled={isLoading}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    disabled={isLoading}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>

                            {errorMessage && (
                                <p className="text-red-500 text-center">{errorMessage}</p>
                            )}

                            <Button disabled={isLoading} className="w-full">
                                {isLoading && (
                                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Sign In
                            </Button>
                        </div>
                    </form>

                    <div className="mt-4 text-center text-sm">
                        <Link href="/forgot-password" className="text-blue-600 hover:text-blue-800">
                            Forgot password?
                        </Link>
                    </div>

                    <div className="mt-2 text-center text-sm">
                        Don't have an account?{" "}
                        <Link href="/signup" className="text-blue-600 hover:text-blue-800">
                            Sign Up
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
