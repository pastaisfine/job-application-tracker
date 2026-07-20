import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL!,
});

export const { signIn, signUp, signOut, useSession } = authClient;

// Client Instance: Initializes authClient using createAuthClient from better-auth/react, pointing to process.env.NEXT_PUBLIC_BETTER_AUTH_URL.
// Exported React Helpers:
// useSession(): A React hook to access authentication status, user details, and loading state inside client components.
// signIn(): Triggers user sign-in from client forms.
// signUp(): Triggers user registration from client forms.
// signOut(): Triggers logout from client-side buttons/components.