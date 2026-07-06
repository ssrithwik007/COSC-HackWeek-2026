import Card from "./Card";
import { Plus } from "lucide-react";
import { useDroppable } from '@dnd-kit/core'

export default function Column({onAddTask, title, color, tasks, onDeleteTask, draggable = true }) {

    const bgMap = {
        backlog: "bg-backlog",
        todo: "bg-todo",
        inprogress: "bg-inprogress",
        done: "bg-done"
    };

    const { setNodeRef, isOver } = useDroppable({ id: `column-${color}` })

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full ${bgMap[color]} flex items-center justify-center font-semibold`}>
                        {tasks.length}
                    </div>

                    <h2 className="text-3xl font-medium">
                        {title}
                    </h2>

                </div>
                <button onClick={onAddTask}> <Plus size={28}/> </button>
            </div>

            {/** droppable container for dnd-kit **/}
            <div
                ref={setNodeRef}
                className={`flex-1 overflow-y-auto rounded-3xl border-2 border-black p-3 ${bgMap[color]} flex flex-col gap-3 ${isOver ? 'ring-4 ring-offset-2 ring-black/20' : ''}`}
            >
                {tasks.length === 0 ? (
                    <div className="text-center opacity-50 mt-10">
                        No Tasks
                    </div>
                ) : (
                    tasks.map((task, index) => (
                        <Card
                            key={task.id}
                            id={task.id}
                            taskName={task.title}
                            description={task.description}
                            priority={task.priority}
                            createdAt={task.createdAt}
                            onDelete={() => onDeleteTask(color, task.id)}
                            draggable={draggable}
                        />
                    ))
                )}

            </div>

        </div>
    );
}