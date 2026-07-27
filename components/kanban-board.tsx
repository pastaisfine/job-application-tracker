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
import DeleteColumnDialog from "./delete-column-dialog";

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
  canDelete,
  onDelete,
}:{
  column: Column;
  config: ColConfig;
  boardId: string;
  sortedColumns: Column[];
  canDelete: boolean;
  onDelete: (columnId: string) => Promise<{ success: boolean; error?: string }>;
}){
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const sortedJobs = [...(column.jobApplications ?? [])].sort(
    (a, b) => a.order - b.order
  );

    const { setNodeRef, isOver } = useDroppable({
    id: column._id,
    data: {
      type: "column",
      columnId: column._id,
    },
  });
  
  return (
  <div className="w-[min(85vw,22rem)] shrink-0 snap-start sm:w-80">
    <Card className="h-full gap-0 overflow-hidden border-black/5 bg-white py-0 shadow-sm">
      <CardHeader className={`${config.color} flex min-h-16 flex-row items-center justify-between gap-3 px-4 py-3 text-white`}>
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">{config.icon}</span>
          <div>
            <CardTitle className="text-sm font-semibold">{column.name}</CardTitle>
            <p className="mt-0.5 text-xs text-white/70">
              {sortedJobs.length} {sortedJobs.length === 1 ? "application" : "applications"}
            </p>
          </div>
        </div>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" className="h-6 w-6 text-white"/>}>
                <MoreVertical className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-destructive"
                disabled={!canDelete}
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {canDelete ? "Delete column" : "Keep at least one column"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
      </CardHeader>
      <CardContent  
        ref={setNodeRef}
        className={`flex min-h-[26rem] flex-col space-y-2 bg-stone-50/70 px-3 pt-3 ${
          isOver ? "ring-2 ring-blue-500" : ""
        }`}>
        <SortableContext 
          items={sortedJobs.map(job => job._id)}
          strategy={verticalListSortingStrategy}
        >
          {sortedJobs.map((job) => (
            <SortableJobCard
              key={job._id}
              job={{ ...job, columnId: job.columnId || column._id }}
              columns={sortedColumns}
            />
          ))}
          {sortedJobs.length === 0 ? (
            <div className="flex min-h-28 items-center justify-center rounded-xl border border-dashed border-stone-300 bg-white/60 px-4 text-center text-sm text-muted-foreground">
              Drop an application here or add a new one.
            </div>
          ) : null}
        </SortableContext>
        <div className="mt-auto pt-2">
          <CreateJobApplicationDialog columnId={column._id} boardId={boardId} />
        </div>
      </CardContent>
    </Card>
    <DeleteColumnDialog
      columnName={column.name}
      jobCount={sortedJobs.length}
      open={deleteDialogOpen}
      onOpenChange={setDeleteDialogOpen}
      onConfirm={() => onDelete(column._id)}
    />
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
  const { columns, moveJob, deleteColumn } = useBoard(board);

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
        [...(column.jobApplications ?? [])].sort((a, b) => a.order - b.order);
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
        [...targetColumn.jobApplications]
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
        [...targetColumnObj.jobApplications].sort((a, b) => a.order - b.order);

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
      id={`kanban-${board._id}`}
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-4">
        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-5">
        {sortedColumns.map((col, key) =>{
          const config = COLUMN_CONFIG[key] || {
              color: "bg-gray-500",
              icon: <Calendar className="h-4 w-4" />,
            };
 
          return(
           <DroppableColumn
                key={col._id}
                column={col}
                config={config}
                boardId={board._id}
                sortedColumns={sortedColumns}
                canDelete={sortedColumns.length > 1}
                onDelete={deleteColumn}
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
