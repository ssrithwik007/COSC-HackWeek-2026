import Card from "./Card";
import { Plus } from "lucide-react";

export default function Column({onAddTask, title, color, tasks, onDeleteTask, onDragStart, onDrop, onCardDrop }) {

    const bgMap = {
        backlog: "bg-backlog",
        todo: "bg-todo",
        inprogress: "bg-inprogress",
        done: "bg-done"
    };

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

            <div className={`flex-1 overflow-y-auto rounded-3xl border-2 border-black p-3 ${bgMap[color]} flex flex-col gap-3`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDrop(color)}
            >

                {tasks.length === 0 ? (
                    <div className="text-center opacity-50 mt-10">
                        No Tasks
                    </div>
                ) : (
                    tasks.map((task, index) => (
                        <Card
                            key={task.id}
                            taskName={task.title}
                            description={task.description}
                            priority={task.priority}
                            createdAt={task.createdAt}
                            onDelete={() => onDeleteTask(color, task.id)}
                            onDragStart={() => onDragStart(task, color, index)}
                            onDropCard={() => onCardDrop(color, index)}
                        />
                    ))
                )}

            </div>

        </div>
    );
}