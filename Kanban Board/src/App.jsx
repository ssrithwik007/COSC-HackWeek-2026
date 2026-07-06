import './App.css'
import Footer from './components/Footer'
import Navbar from './components/NavBar'
import Board from './components/Board'
import AddTaskModal from './components/AddTaskModal'
import { useState } from 'react'

function App() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [draggedTask, setDraggedTask] = useState(null);
  const [tasks, setTasks] = useState({
      backlog: [],
      todo: [],
      inprogress: [],
      done: []
  });

  function handleAddTask(taskData) {
    const newTask = {
      id: crypto.randomUUID(),
      title: taskData.title?.trim() !== "" ? taskData.title : "New Task",
      description: taskData.description,
      priority: taskData.priority ?? "medium",
      createdAt: new Date().toLocaleDateString()
    }

    setTasks(prev => ({
      ...prev,
      [selectedCategory]: [
        newTask,
        ...prev[selectedCategory]
      ]
    }));

    setIsModalOpen(false);
    setSelectedCategory(null);
  }

  function handleDeleteTask(category, taskId) {
      setTasks(prev => ({
          ...prev,
          [category]:
              prev[category].filter(
                  task => task.id !== taskId
              )
      }));
  }

  function handleDragStart(task, category, index) {
    setDraggedTask({
        task,
        category,
        index
    });
  }

  function handleDrop(destinationCategory) {
      if (!draggedTask) return;

      setTasks(prev => {
          const source = [...prev[draggedTask.category]];
          const destination = [...prev[destinationCategory]];
          const [movedTask] = source.splice(draggedTask.index, 1);

          destination.push(movedTask);

          return {
              ...prev,
              [draggedTask.category]: source,
              [destinationCategory]: destination
          };
      });
      
      setDraggedTask(null);
  }
  
  function handleCardDrop(destinationCategory, destinationIndex) {
      if (!draggedTask) return;

      setTasks(prev => {
          const source = [...prev[draggedTask.category]];
          const destination =
              draggedTask.category === destinationCategory
                  ? source
                  : [...prev[destinationCategory]];

          const [movedTask] = source.splice(draggedTask.index, 1);

          let insertIndex = destinationIndex;

          if (
              draggedTask.category === destinationCategory &&
              draggedTask.index < destinationIndex
          ) {
              insertIndex--;
          }

          destination.splice(insertIndex, 0, movedTask);

          return {
              ...prev,
              [draggedTask.category]:
                  draggedTask.category === destinationCategory
                      ? destination
                      : source,

              [destinationCategory]: destination
          };

      });

      setDraggedTask(null);

  }
    
  return (
    <div className='h-screen overflow-hidden bg-bg mx-10'>
      <Navbar
          search={search}
          setSearch={setSearch}
          filter={filter}
          setFilter={setFilter}
          onAddTask={() => setIsModalOpen(true)}
      />
      <Board 
        onAddTask={(category) => {
            setSelectedCategory(category);
            setIsModalOpen(true);
        }}
        onDeleteTask={handleDeleteTask}
        onDragStart={handleDragStart}
        onDrop={handleDrop}
        onCardDrop={handleCardDrop}
        tasks = {tasks}
      />
      <Footer />
      <AddTaskModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleAddTask}
      />
    </div>
  )
}

export default App
