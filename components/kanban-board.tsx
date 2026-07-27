"use client"

import { Board, Column, JobApplication } from "@/lib/models/models.types";
import { Award, Calendar, CheckCircle2, Mic, MoreVertical, Trash2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import CreateJobApplicationDialog from "./create-job-dialog";
import JobApplicationCard from "./job-application-card";
import { useBoard } from "@/lib/hooks/useBoard";
import { closestCorners, DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor,  useDroppable, useSensor, useSensors } from "@dnd-kit/core";
import { useState } from "react";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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

    const { setNodeRef, isOver } = useDroppable({
    id: column._id,
    data: {
      type: "column",
      columnId: column._id,
    },
  });
  
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
      <CardContent  
        ref={setNodeRef}
        className={`space-y-2 pt-4 bg-gray-50/50 min-h-[400px] rounded-b-lg ${
          isOver ? "ring-2 ring-blue-500" : ""
        }`}>
        <SortableContext 
          items={sortedJobs.map(job => job._id)}
          strategy={verticalListSortingStrategy}
        >
          {sortedJobs.map((job, key) => (
            <SortableJobCard
              key={key}
              job={{ ...job, columnId: job.columnId || column._id }}
              columns={sortedColumns}
            />
          ))}
        </SortableContext>
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
    const {
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
    setNodeRef,
  } = useSortable({
    id: job._id,
    data: {
      type: "job",
      job,
    },
  });
    const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return(
    <div ref={setNodeRef} style={style}>
      <JobApplicationCard 
        job={job} 
        columns={columns}
        dragHandleProps={{ ...attributes, ...listeners }} />
    </div>
  )
}

export default function KanbanBoard({ board }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const { columns, moveJob } = useBoard(board);

  const sortedColumns = [...columns].sort((a, b) => a.order - b.order);

    const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  async function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    setActiveId(null);

    if (!over || !board._id) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    let draggedJob: JobApplication | null = null;
    let sourceColumn: Column | null = null;
    let sourceIndex = -1;

    for (const column of sortedColumns) {
      const jobs =
        column.jobApplications.sort((a, b) => a.order - b.order) || [];
      const jobIndex = jobs.findIndex((j) => j._id === activeId);
      if (jobIndex !== -1) {
        draggedJob = jobs[jobIndex];
        sourceColumn = column;
        sourceIndex = jobIndex;
        break;
      }
    }

    if (!draggedJob || !sourceColumn) return;

    // Check if dropped in a column or another job
    const targetColumn = sortedColumns.find((col) => col._id === overId);
    //Look through all the columns on the board and check if the user released (dropped) the card directly onto a column area
    
    const targetJob = sortedColumns
      .flatMap((col) => col.jobApplications || [])
      //Example: [[Job A, Job B], [Job C]] becomes [Job A, Job B, Job C]
      .find((job) => job._id === overId);

    let targetColumnId: string;
    let newOrder: number;

    if (targetColumn) {
      targetColumnId = targetColumn._id;
      const jobsInTarget =
        targetColumn.jobApplications
          .filter((j) => j._id !== activeId)
          .sort((a, b) => a.order - b.order) || [];
      newOrder = jobsInTarget.length;
    } else if (targetJob) {
      const targetJobColumn = sortedColumns.find((col) =>
        col.jobApplications.some((j) => j._id === targetJob._id)
      ); //Find out which column owns the card we dropped on (targetJob). If we can't find the column, abort.
      targetColumnId = targetJob.columnId || targetJobColumn?._id || "";
      if (!targetColumnId) return;

      const targetColumnObj = sortedColumns.find(
        (col) => col._id === targetColumnId
      );

      if (!targetColumnObj) return;

      const allJobsInTargetOriginal =
        targetColumnObj.jobApplications.sort((a, b) => a.order - b.order) || [];

      const allJobsInTargetFiltered =
        allJobsInTargetOriginal.filter((j) => j._id !== activeId) || [];

      const targetIndexInOriginal = allJobsInTargetOriginal.findIndex(
        (j) => j._id === overId
      );

      const targetIndexInFiltered = allJobsInTargetFiltered.findIndex(
        (j) => j._id === overId
      );

      if (targetIndexInFiltered !== -1) {
        if (sourceColumn._id === targetColumnId) {
          if (sourceIndex < targetIndexInOriginal) {
            newOrder = targetIndexInFiltered + 1;
          } else {
            newOrder = targetIndexInFiltered;
          }
        } else {
          newOrder = targetIndexInFiltered;
        }
      } else {
        newOrder = allJobsInTargetFiltered.length;
      }
    } else {
      return;
    }

    if (!targetColumnId) {
      return;
    }

    await moveJob(activeId, targetColumnId, newOrder);
  }

    const activeJob = sortedColumns
    .flatMap((col) => col.jobApplications || [])
    .find((job) => job._id === activeId);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-4">
        <div className="flex gap-4 overflow-x-auto pb-4">
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
      <DragOverlay>
        {activeJob ? (
          <div className="opacity-50">
            <JobApplicationCard job={activeJob} columns={sortedColumns} />
          </div>
        ) : null}
      </DragOverlay>
      
    </DndContext>
  )
}