import { Trash2 } from "lucide-react";

export default function Card({taskName, description, createdAt, priority, onDelete, onDragStart, onDragOver, onDropCard}){
    const priorityBgMap = {
        "low": "bg-done",
        "medium": "bg-inprogress",
        "high": "bg-backlog"
    }
    return (
        <div 
            draggable 
            onDragStart={onDragStart} 
            onDragOver={(e) => {
                e.preventDefault();
                onDragOver?.(e);
            }}
            onDrop={(e) => {
                e.stopPropagation();
                onDropCard?.();
            }}
            className="rounded-xl bg-card-bg p-4 shadow"
        >
            <div className="flex flex-col gap-4">
                <div>
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-text">
                            {taskName}
                        </h2>
                        <button onClick={onDelete}>
                            <Trash2 size={22}></Trash2>
                        </button>
                    </div>
                    
                    <p className="mt-2 text-sm text-text/80">
                        {description}
                    </p>
                </div>

                <div className="flex items-center justify-between text-xs text-text">
                    <p>Created: {createdAt}</p>
                    <span
                        className={`rounded-md px-2 py-1 text-white capitalize ${priorityBgMap[priority]}`}
                    >
                        {priority}
                    </span>
                </div>
            </div>
        </div>
    );
}