// Server-Side Auth Engine
// This file configures and manages authentication on the backend (Node.js /
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { initializeUserBoard } from "../init-user-board";
import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI");
}

const client = new MongoClient(MONGODB_URI);
await client.connect();

const db = client.db();

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client,
  }),
  emailAndPassword: {
    enabled: true,
    // Authentication Provider: Enables email/password authentication (emailAndPassword: { enabled: true }).
  },
  databaseHooks: {
    // User Onboarding Hook: Runs a database hook whenever a new user account is created (databaseHooks.user.create.after), automatically invoking initializeUserBoard(user.id) to set up initial board data for new users.
    user: {
      create:{
        after: async (user) => {
          if (user.id){
            await initializeUserBoard(user.id)

          }
        }
      }
    }
  }
});

// getSession(): Retrieves the current authenticated user's session from request headers in Server Components or API routes.
export async function getSession() {
  const result = await auth.api.getSession({
    headers: await headers()
  })

  return result
}
// signOut(): Logs out the user server-side and redirects them to /sign-in.
export async function signOut(){
  const result = await auth.api.signOut({
    headers: await headers()
  })

  if (result.success) {
    redirect("/sign-in")
  }
}

