"use client"

import { Board, Column, JobApplication } from "@/lib/models/models.types";
import { Award, Calendar, CheckCircle2, Mic, MoreVertical, Trash2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import CreateJobApplicationDialog from "./create-job-dialog";
import JobApplicationCard from "./job-application-card";

interface ColConfig {
  color: string;
  icon: React.ReactNode;
  // /allows the icon property to accept any valid React renderable, which includes:

// JSX elements / React components (e.g., <Calendar className="h-4 w-4" /> used in 

// COLUMN_CONFIG
// )
// Strings or numbers (rendered as text)
// Portals, Fragments, Arrays of nodes
// null or undefined (rendered as nothing)
// 
}
const COLUMN_CONFIG: Array<ColConfig> = [
  {
    color: "bg-black",
    icon: <Calendar className="h-4 w-4" />,
  },
  {
    color: "bg-[#14213d]",
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
  {
    color: "bg-[#fca311]",
    icon: <Mic className="h-4 w-4" />,
  },
  {
    color: "bg-[#252422]",
    icon: <Award className="h-4 w-4" />,
  },
  {
    color: "bg-[#00296B]",
    icon: <XCircle className="h-4 w-4" />,
  },
];

interface KanbanBoardProps{
  board: Board;
  userId: string;
}

function DroppableColumn({
  column,
  config,
  boardId,
  sortedColumns,
}:{
  column: Column;
  config: ColConfig;
  boardId: string;
  sortedColumns: Column[]
}){
  const sortedJobs =
    column.jobApplications?.sort((a, b) => a.order - b.order) || [];
  
  return (
  <div>
    <Card>
      <CardHeader className={`${config.color} flex items-center justify-between p-4 text-white`}>
        <div className="flex items-center gap-2">
          {config.icon}
          <CardTitle className="font-medium">{column.name}</CardTitle>
        </div>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" className="h-6 w-6 text-white"/>}>
                <MoreVertical className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Column
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
      </CardHeader>
      <CardContent className="space-y-2 pt-4 bg-gray-50/50 min-h-[400px] rounded-b-lg">
          {sortedJobs.map((job, key) => (
            <SortableJobCard
              key={key}
              job={{ ...job, columnId: job.columnId || column._id }}
              columns={sortedColumns}
            />
          ))}
          <CreateJobApplicationDialog columnId={column._id} boardId={boardId} />
      </CardContent>
    </Card>
  </div>
)

}

function SortableJobCard({
  job,
  columns,
}: {
  job: JobApplication;
  columns: Column[];
}){
  return(
    <div>
      <JobApplicationCard job={job} columns={columns} />
    </div>
  )
}

export default function KanbanBoard({ board }: KanbanBoardProps) {
  const columns = board.columns;

  const sortedColumns = columns.sort((a, b) => a.order - b.order);
  return (
    <div>
      <div>
        {columns.map((col, key) =>{
          const config = COLUMN_CONFIG[key] || {
              color: "bg-gray-500",
              icon: <Calendar className="h-4 w-4" />,
            };

          return(
           <DroppableColumn
                key={key}
                column={col}
                config={config}
                boardId={board._id}
                sortedColumns={sortedColumns}
              />
          )
        })}
      </div>
    </div>
  )
}