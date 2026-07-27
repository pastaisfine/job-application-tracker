import KanbanBoard from "@/components/kanban-board";
import { getSession } from "@/lib/auth/auth";
import connectDB from "@/lib/db";
import { Board } from "@/lib/models";
import { redirect } from "next/navigation";
import { Suspense } from "react";

async function getBoard(userId: string){
  "use cache";

  await connectDB()

  const boardDoc = await Board.findOne({
    //Finds a single Board where userId matches the logged-in user and name is "Job Hunt".
    userId: userId,
    name: "Job Hunt"
  }).populate(
    //Populates the board with its columns
    {
      path: "columns",
      populate: {
        path: "jobApplications",
      },
    }
  )

  if (!boardDoc) return null;

  const board = JSON.parse(JSON.stringify(boardDoc))
  //Serialization: Convert Mongoose BSON types (like ObjectId and Date) into JS Object 
  // so Next.js can send them from the server to client component

  return board
}

async function DashboardPage(){
  const session = await getSession();
  const board = await getBoard(session?.user.id ?? "");

    if (!session?.user) {
    redirect("/sign-in")
  }

  return(
    <main className="min-h-[calc(100vh-4rem)] bg-stone-50">
      <div className="mx-auto max-w-[100rem] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-7 flex flex-col gap-2 border-b border-stone-200 pb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
            Application pipeline
          </p>
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">
            Job Hunt
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-stone-600 sm:text-base">
            Keep every opportunity moving. Drag applications between stages as your conversations progress.
          </p>
        </div>
        <KanbanBoard board={JSON.parse(JSON.stringify(board))} userId={session.user.id} />
      </div>
    </main>
  )
}

export default async function Dashboard(){
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <DashboardPage />
    </Suspense>
  )

}