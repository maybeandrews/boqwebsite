"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(""); // Clear any previous errors

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
    };

    return (
        <div style={{ maxWidth: "400px", margin: "2rem auto" }}>
            <h1>Login</h1>
            {error && (
                <div
                    style={{
                        color: "red",
                        backgroundColor: "#ffeeee",
                        padding: "10px",
                        borderRadius: "5px",
                        marginBottom: "1rem",
                    }}
                >
                    {error}
                </div>
            )}
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
                        padding: "8px",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
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
                        padding: "8px",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                    }}
                />
                <button
                    type="submit"
                    style={{
                        width: "100%",
                        padding: "10px",
                        backgroundColor: "#0070f3",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                    }}
                >
                    Login
                </button>
            </form>
        </div>
    );
}
