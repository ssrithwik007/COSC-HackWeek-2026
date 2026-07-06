import Column from "./Column";
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

export default function Board({ onAddTask, tasks, onDeleteTask, draggable = true }){
    return (
        <div className="mb-5 h-[calc(100vh-96px)] pb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <SortableContext items={tasks.backlog.map(t => t.id)} strategy={verticalListSortingStrategy}>
            <Column
                title="Backlog"
                color="backlog"
                tasks={tasks.backlog}
                onAddTask={() => onAddTask("backlog")}
                onDeleteTask={onDeleteTask}
                draggable={draggable}
            />
        </SortableContext>

        <SortableContext items={tasks.todo.map(t => t.id)} strategy={verticalListSortingStrategy}>
            <Column
                title="To Do"
                color="todo"
                tasks={tasks.todo}
                onAddTask={() => onAddTask("todo")}
                onDeleteTask={onDeleteTask}
                draggable={draggable}
            />
        </SortableContext>

        <SortableContext items={tasks.inprogress.map(t => t.id)} strategy={verticalListSortingStrategy}>
            <Column
                title="In Progress"
                color="inprogress"
                tasks={tasks.inprogress}
                onAddTask={() => onAddTask("inprogress")}
                onDeleteTask={onDeleteTask}
                draggable={draggable}
            />
        </SortableContext>

        <SortableContext items={tasks.done.map(t => t.id)} strategy={verticalListSortingStrategy}>
            <Column
                title="Done"
                color="done"
                tasks={tasks.done}
                onAddTask={() => onAddTask("done")}
                onDeleteTask={onDeleteTask}
                draggable={draggable}
            />
        </SortableContext>
    </div>
    )
}