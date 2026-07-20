"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/lib/auth/auth-client";
import { useRouter } from "next/dist/client/components/navigation";
import Link from "next/dist/client/link";
import { useState } from "react";

export default function SignIn(){
    const [ email, setEmail ] = useState("");
    const [ password, setPassword ] = useState("");
    const [ loading, setLoading ] = useState(false);
    const [ error, setError ] = useState("");

    const router = useRouter();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            const result = await signIn.email({
                email,
                password
            }

            );
            if (result.error) {
                setError(result.error.message ?? "Failed to Sign In.");
            } else {
                router.push("/dashboard");
            }
        } catch {
            setError("An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    }

    return(
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-white p-4">
            <Card className="w-full max-w-md border-gray-200 shadow-lg">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-black">
                        Sign In
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                        Enter your credentials to access your account.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit} className="space-y-4 p-4">
                    <CardContent className="space-y-4">
                        {error && (
                            <div>
                                {error}
                            </div>
                        )}
                        <div>
                            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                onChange={(e) => setEmail(e.target.value)}
                                value={email}
                            />
                        </div>
                        <div>
                            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                                Password
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                onChange={(e) => setPassword(e.target.value)}
                                value={password}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <Button
                            type="submit"
                            className="w-full bg-blue-600 text-white hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                            disabled={loading}
                        >
                            {loading ? "Signing in..." : "Sign In"}
                        </Button>
                        <p>
                            No account?{" "}
                            <Link href="/sign-up" className="text-blue-600 hover:underline">
                                Sign Up
                            </Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}