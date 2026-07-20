"use client";

import { Button } from "@/components/ui/button";
import { Card, 
        CardDescription, 
        CardHeader, 
        CardTitle, 
        CardContent, 
        CardFooter 
    } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { signUp } from "@/lib/auth/auth-client";
import { useRouter } from "next/dist/client/components/navigation";
import { useState } from "react";

export default function SignUp() {
        const [ name, setName ] = useState("")
        const [ email, setEmail ] = useState("");
        const [ password, setPassword ] = useState("");
        const [ loading, setLoading ] = useState(false);
        const [ error, setError ] = useState("");
    
        const router = useRouter();

        async function handleSubmit( e: React.FormEvent<HTMLFormElement> ){
            e.preventDefault();

            setError("");
            setLoading(true)

            try {
                const result = await signUp.email({
                    name,
                    email,
                    password,
                });
                if (result.error) {
                    setError(result.error.message ?? "Failed to Sign Up.");
                } else { //if no error, redirect to dashboard
                    router.push("/dashboard");
                }
            } catch (err) {
                setError("An unexpected error occurred.");
            } finally {
                setLoading(false);
            }
        }


    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-white p-4">
            <Card className="w-full max-w-md border-gray-200 shadow-lg">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-black">
                        Sign Up
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                        Create a new account to get started.
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
                            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                                Name
                            </Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="John Doe"
                                value={name}
                                onChange={e => setName(e.target.value)}
                            />
                        </div>
                        <div>
                            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
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
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <Button
                            type="submit"
                            className="w-full bg-blue-600 text-white hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                            disabled={loading}
                        >
                            {loading ? "Creating account.." : "Sign Up"}
                        </Button>
                        <p>
                            Have an account?{" "}
                            <Link href="/sign-in" className="text-blue-600 hover:underline">
                                Sign In
                            </Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}