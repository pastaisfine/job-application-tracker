"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/auth";
import connectDB from "@/lib/db";
import { Board, Column, JobApplication } from "@/lib/models";

export type DeleteColumnResult =
  | { success: true; deletedJobCount: number }
  | { success: false; error: string };

export async function deleteColumn(columnId: string): Promise<DeleteColumnResult> {
  const session = await getSession();
  if (!session?.user) return { success: false, error: "Unauthorized" };
  if (!columnId) return { success: false, error: "Column is required" };

  await connectDB();
  const column = await Column.findById(columnId).select("boardId").lean();
  if (!column) return { success: false, error: "Column not found" };

  const board = await Board.findOne({
    _id: column.boardId,
    userId: session.user.id,
    columns: columnId,
  }).select("_id columns").lean();

  if (!board) return { success: false, error: "Column not found" };
  if (board.columns.length <= 1) {
    return { success: false, error: "The final column cannot be deleted" };
  }

  const updatedBoard = await Board.findOneAndUpdate(
    {
      _id: board._id,
      userId: session.user.id,
      columns: columnId,
      "columns.1": { $exists: true },
    },
    { $pull: { columns: columnId } },
    { new: true }
  );

  if (!updatedBoard) {
    return { success: false, error: "The final column cannot be deleted" };
  }

  const deletedJobs = await JobApplication.deleteMany({
    columnId,
    boardId: board._id,
    userId: session.user.id,
  });
  await Column.deleteOne({ _id: columnId, boardId: board._id });

  revalidatePath("/dashboard");
  return { success: true, deletedJobCount: deletedJobs.deletedCount };
}