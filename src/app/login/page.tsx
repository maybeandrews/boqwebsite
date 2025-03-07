"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = await signIn("credentials", {
            username,
            password,
            redirect: false, // We'll handle redirection manually
        });

        if (result?.ok) {
            // Redirect the user to a protected page, e.g., dashboard
            router.push("/dashboard");
        } else {
            alert("Login failed. Please check your credentials and try again.");
        }
    };

    return (
        <div style={{ maxWidth: "400px", margin: "2rem auto" }}>
            <h1>Vendor Login</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    style={{
                        display: "block",
                        width: "100%",
                        marginBottom: "1rem",
                    }}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{
                        display: "block",
                        width: "100%",
                        marginBottom: "1rem",
                    }}
                />
                <button type="submit" style={{ width: "100%" }}>
                    Login
                </button>
            </form>
        </div>
    );
}
