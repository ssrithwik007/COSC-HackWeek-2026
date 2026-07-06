import Column from "./Column";

export default function Board({ onAddTask, tasks, onDeleteTask, onDragStart, onDrop, onCardDrop }){
    return (
        <div className="mb-5 h-[calc(100vh-96px)] pb-8 grid grid-cols-4 gap-6">
        <Column
            title="Backlog"
            color="backlog"
            tasks={tasks.backlog}
            onAddTask={() => onAddTask("backlog")}
            onDeleteTask={onDeleteTask}
            onDragStart={onDragStart}
            onDrop={onDrop}
            onCardDrop={onCardDrop}
        />

        <Column
            title="To Do"
            color="todo"
            tasks={tasks.todo}
            onAddTask={() => onAddTask("todo")}
            onDeleteTask={onDeleteTask}
            onDragStart={onDragStart}
            onDrop={onDrop}
            onCardDrop={onCardDrop}
        />

        <Column
            title="In Progress"
            color="inprogress"
            tasks={tasks.inprogress}
            onAddTask={() => onAddTask("inprogress")}
            onDeleteTask={onDeleteTask}
            onDragStart={onDragStart}
            onDrop={onDrop}
            onCardDrop={onCardDrop}
        />

        <Column
            title="Done"
            color="done"
            tasks={tasks.done}
            onAddTask={() => onAddTask("done")}
            onDeleteTask={onDeleteTask}
            onDragStart={onDragStart}
            onDrop={onDrop}
            onCardDrop={onCardDrop}
        />
    </div>
    )
}