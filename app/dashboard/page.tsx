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
    <div>
      <div className="min-h-screen bg-white">
        <div className="container mx-auto p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-black">Job Hunt</h1>
            <p className="text-gray-600">Track your job applications</p>
          </div>
          <KanbanBoard board={JSON.parse(JSON.stringify(board))} userId={session.user.id} />
        </div>
      </div>
    </div>
  )
}

export default async function Dashboard(){
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <DashboardPage />
    </Suspense>
  )

}