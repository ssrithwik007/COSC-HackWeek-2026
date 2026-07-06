import { Trash2 } from "lucide-react";
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export default function Card({id, taskName, description, createdAt, priority, onDelete, draggable = true}){
        let attributes = {}
        let listeners = {}
        let setNodeRef = () => {}
        let style = {}

        if (draggable) {
            const sortable = useSortable({ id })
            attributes = sortable.attributes
            listeners = sortable.listeners
            setNodeRef = sortable.setNodeRef
            const transform = sortable.transform
            const transition = sortable.transition
            style = {
                transform: CSS.Transform.toString(transform),
                transition,
            }
        }
    const priorityBgMap = {
        "low": "bg-done",
        "medium": "bg-inprogress",
        "high": "bg-backlog"
    }
    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="rounded-xl bg-card-bg p-4 shadow hover:shadow-lg transform-gpu hover:-translate-y-[5px]"
        >
            <div className="flex flex-col gap-4">
                <div>
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-text">
                            {taskName}
                        </h2>
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
                            onPointerDown={(e) => e.stopPropagation()}
                            onPointerUp={(e) => e.stopPropagation()}
                            aria-label="Delete task"
                        >
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