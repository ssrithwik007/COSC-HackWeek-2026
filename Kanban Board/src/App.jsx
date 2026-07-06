import './App.css'
import Footer from './components/Footer'
import Navbar from './components/NavBar'
import Board from './components/Board'
import AddTaskModal from './components/AddTaskModal'
import { useState, useEffect } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'

function App() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem('kanban.tasks')
      if (saved) {
        const parsed = JSON.parse(saved)
        return {
          backlog: Array.isArray(parsed.backlog) ? parsed.backlog : parsed.backlog ?? [],
          todo: Array.isArray(parsed.todo) ? parsed.todo : parsed.todo ?? [],
          inprogress: Array.isArray(parsed.inprogress) ? parsed.inprogress : parsed.inprogress ?? [],
          done: Array.isArray(parsed.done) ? parsed.done : parsed.done ?? [],
        }
      }
    } catch (e) {
      console.error('Failed to parse saved tasks during init', e)
    }

    return {
      backlog: [],
      todo: [],
      inprogress: [],
      done: []
    }
  })

  // listen for storage events (sync across tabs)
  useEffect(() => {
    function onStorage(e) {
      if (e.key === 'kanban.tasks' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue)
          const normalized = {
            backlog: Array.isArray(parsed.backlog) ? parsed.backlog : parsed.backlog ?? [],
            todo: Array.isArray(parsed.todo) ? parsed.todo : parsed.todo ?? [],
            inprogress: Array.isArray(parsed.inprogress) ? parsed.inprogress : parsed.inprogress ?? [],
            done: Array.isArray(parsed.done) ? parsed.done : parsed.done ?? [],
          }
          setTasks(normalized)
        } catch (err) {
          console.error('Failed to parse storage event tasks', err)
        }
      }
    }

    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  // persist tasks to localStorage
  useEffect(() => {
    try {
      // sanitize tasks before saving: ensure arrays and ids exist
      const sanitized = {
        backlog: Array.isArray(tasks.backlog) ? tasks.backlog.map(t => ({
          id: t.id ?? crypto.randomUUID(),
          title: t.title ?? '',
          description: t.description ?? '',
          priority: t.priority ?? 'medium',
          createdAt: t.createdAt ?? new Date().toLocaleDateString()
        })) : [],
        todo: Array.isArray(tasks.todo) ? tasks.todo.map(t => ({
          id: t.id ?? crypto.randomUUID(),
          title: t.title ?? '',
          description: t.description ?? '',
          priority: t.priority ?? 'medium',
          createdAt: t.createdAt ?? new Date().toLocaleDateString()
        })) : [],
        inprogress: Array.isArray(tasks.inprogress) ? tasks.inprogress.map(t => ({
          id: t.id ?? crypto.randomUUID(),
          title: t.title ?? '',
          description: t.description ?? '',
          priority: t.priority ?? 'medium',
          createdAt: t.createdAt ?? new Date().toLocaleDateString()
        })) : [],
        done: Array.isArray(tasks.done) ? tasks.done.map(t => ({
          id: t.id ?? crypto.randomUUID(),
          title: t.title ?? '',
          description: t.description ?? '',
          priority: t.priority ?? 'medium',
          createdAt: t.createdAt ?? new Date().toLocaleDateString()
        })) : [],
      }

      // if sanitized is all-empty but storage already has non-empty data, skip overwrite
      const existingRaw = localStorage.getItem('kanban.tasks')
      let existing = null
      try { existing = existingRaw ? JSON.parse(existingRaw) : null } catch (e) { existing = null }

      const sanitizedIsEmpty = [sanitized.backlog, sanitized.todo, sanitized.inprogress, sanitized.done].every(arr => arr.length === 0)
      const existingHasData = existing && ([existing.backlog, existing.todo, existing.inprogress, existing.done].some(arr => Array.isArray(arr) && arr.length > 0))

      if (sanitizedIsEmpty && existingHasData) {
        console.debug('Skipping overwrite: in-memory tasks empty but storage has data')
      } else {
        console.debug('Saving kanban.tasks', sanitized)
        localStorage.setItem('kanban.tasks', JSON.stringify(sanitized))
      }
    } catch (e) {
      console.error('Failed to save tasks', e)
    }
  }, [tasks])

  const dragDisabled = search.trim() !== '' || filter !== 'all'

  const sensors = useSensors(useSensor(PointerSensor))

  function handleDragEnd(event) {
    const { active, over } = event
    if (!over) return
    if (active.id === over.id) return

    // find source
    const findSource = () => {
      for (const key of Object.keys(tasks)) {
        const idx = tasks[key].findIndex((t) => t.id === active.id)
        if (idx > -1) return { key, index: idx }
      }
      return null
    }

    const source = findSource()
    if (!source) return

    // determine destination column and index
    let destKey = null
    let destIndex = -1

    if (String(over.id).startsWith('column-')) {
      destKey = String(over.id).replace('column-', '')
      destIndex = tasks[destKey].length
    } else {
      // over is an item id
      for (const key of Object.keys(tasks)) {
        const idx = tasks[key].findIndex((t) => t.id === over.id)
        if (idx > -1) {
          destKey = key
          destIndex = idx
          break
        }
      }
    }

    if (!destKey) return

    setTasks((prev) => {
      const next = {
        backlog: [...prev.backlog],
        todo: [...prev.todo],
        inprogress: [...prev.inprogress],
        done: [...prev.done],
      }

      const [moved] = next[source.key].splice(source.index, 1)

      // adjust index when moving within same column and removing earlier item
      if (source.key === destKey && source.index < destIndex) destIndex--

      next[destKey].splice(destIndex, 0, moved)

      return next
    })
  }

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
    
  // derive displayed tasks based on search/filter
  const displayedTasks = Object.keys(tasks).reduce((acc, key) => {
    const list = tasks[key].filter((t) => {
      const matchesFilter = filter === 'all' ? true : t.priority === filter
      const q = search.trim().toLowerCase()
      const matchesSearch =
        q === '' || (t.title && t.title.toLowerCase().includes(q)) || (t.description && t.description.toLowerCase().includes(q))
      return matchesFilter && matchesSearch
    })
    acc[key] = list
    return acc
  }, {})

  return (
    <div className='h-screen overflow-hidden bg-bg mx-10'>
        <Navbar
          search={search}
          setSearch={setSearch}
          filter={filter}
          setFilter={setFilter}
          onAddTask={() => { setSelectedCategory('todo'); setIsModalOpen(true); }}
        />
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <Board 
          onAddTask={(category) => {
              setSelectedCategory(category);
              setIsModalOpen(true);
          }}
          onDeleteTask={handleDeleteTask}
          tasks={displayedTasks}
          draggable={!dragDisabled}
        />
      </DndContext>
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
