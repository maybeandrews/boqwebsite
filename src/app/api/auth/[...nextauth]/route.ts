import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

// Extend the built-in types
declare module "next-auth" {
    interface Session extends DefaultSession {
        user: {
            id: number;
            username: string;
            name: string;
        } & DefaultSession["user"];
    }

    interface User extends DefaultUser {
        id: number;
        username: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: number;
        username: string;
    }
}

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: {
                    label: "Username",
                    type: "text",
                    placeholder: "Your username",
                },
                password: {
                    label: "Password",
                    type: "password",
                    placeholder: "Your password",
                },
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) {
                    throw new Error("Username and password are required");
                }

                // Find the vendor in your database using Prisma
                const vendor = await prisma.vendor.findUnique({
                    where: { username: credentials.username },
                });

                if (!vendor) {
                    throw new Error("No user found with that username");
                }

                // Check if vendor is approved
                if (!vendor.approved) {
                    throw new Error("Account is pending approval");
                }

                // Compare the submitted password with the stored hashed password
                const isValid = await bcrypt.compare(
                    credentials.password,
                    vendor.password
                );
                if (!isValid) {
                    throw new Error("Invalid password");
                }

                // Return the vendor info (this object will be stored in the session)
                return {
                    id: vendor.id,
                    name: vendor.name,
                    username: vendor.username,
                };
            },
        }),
    ],
    pages: {
        signIn: "/login", // Custom sign-in page path
        error: "/login", // Error page
    },
    session: {
        strategy: "jwt" as const,
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    callbacks: {
        async jwt({ token, user }: { token: JWT; user: any }) {
            // When the user signs in, add their ID and username to the token
            if (user) {
                token.id = user.id;
                token.username = user.username;
            }
            return token;
        },
        async session({ session, token }: { session: any; token: JWT }) {
            // Add user information to the session
            if (session.user) {
                session.user.id = token.id;
                session.user.username = token.username;
            }
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
