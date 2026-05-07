'use client'

import { useState, useRef } from 'react'
import TaskDrawer from './TaskDrawer'

type Task = {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  assignee_id: string | null
  due_date: string | null
  stage: string | null
  size_estimate: number | null
  position: number
}

type Member = {
  user_id: string
  display_name: string
  role: string
}

interface KanbanBoardProps {
  projectId: string
  tasks: Task[]
  members: Member[]
  onTasksChange: (tasks: Task[]) => void
}

const COLUMNS: { id: string; label: string; color: string; dot: string }[] = [
  { id: 'backlog',     label: 'Backlog',     color: '#64748b', dot: '#475569' },
  { id: 'todo',        label: 'To Do',       color: '#7dd3fc', dot: '#38bdf8' },
  { id: 'in_progress', label: 'In Progress', color: '#818cf8', dot: '#6366f1' },
  { id: 'review',      label: 'Review',      color: '#fbbf24', dot: '#f59e0b' },
  { id: 'done',        label: 'Done',        color: '#4ade80', dot: '#22c55e' },
]

const PRIORITY_DOT: Record<string, string> = {
  critical: '#ef4444',
  high:     '#f97316',
  medium:   '#eab308',
  low:      '#64748b',
}

export default function KanbanBoard({ projectId, tasks, members, onTasksChange }: KanbanBoardProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [addingInCol, setAddingInCol] = useState<string | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const dragTask = useRef<Task | null>(null)
  const dragOverCol = useRef<string | null>(null)

  async function handleAddTask(colId: string) {
    if (!newTitle.trim()) { setAddingInCol(null); return }
    const res = await fetch(`/api/projects/${projectId}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle.trim(), status: colId }),
    })
    const data = await res.json()
    if (data.task) {
      onTasksChange([...tasks, data.task])
    }
    setNewTitle('')
    setAddingInCol(null)
  }

  async function handleStatusChange(taskId: string, newStatus: string) {
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    const data = await res.json()
    if (data.task) {
      onTasksChange(tasks.map(t => t.id === taskId ? data.task : t))
    }
  }

  function handleTaskUpdate(updated: Task) {
    onTasksChange(tasks.map(t => t.id === updated.id ? updated : t))
    setSelectedTask(updated)
  }

  function handleTaskDelete(id: string) {
    onTasksChange(tasks.filter(t => t.id !== id))
    setSelectedTask(null)
  }

  function handleDragStart(task: Task) {
    dragTask.current = task
  }

  function handleDragOver(e: React.DragEvent, colId: string) {
    e.preventDefault()
    dragOverCol.current = colId
  }

  async function handleDrop(colId: string) {
    const task = dragTask.current
    if (!task || task.status === colId) return
    await handleStatusChange(task.id, colId)
    dragTask.current = null
    dragOverCol.current = null
  }

  return (
    <div className="flex gap-4 h-full overflow-x-auto px-6 py-4">
      {COLUMNS.map(col => {
        const colTasks = tasks.filter(t => t.status === col.id).sort((a, b) => a.position - b.position)

        return (
          <div
            key={col.id}
            className="flex flex-col rounded-xl flex-shrink-0"
            style={{
              width: '260px',
              background: '#1e293b',
              border: '1px solid #2e3a57',
            }}
            onDragOver={e => handleDragOver(e, col.id)}
            onDrop={() => handleDrop(col.id)}
          >
            {/* Column header */}
            <div className="flex items-center justify-between px-3 py-3" style={{ borderBottom: '1px solid #2e3a57' }}>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: col.dot }} />
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: col.color }}>
                  {col.label}
                </span>
                <span
                  className="text-xs font-medium px-1.5 py-0.5 rounded-full"
                  style={{ background: '#0f172a', color: '#64748b' }}
                >
                  {colTasks.length}
                </span>
              </div>
              <button
                onClick={() => { setAddingInCol(col.id); setNewTitle('') }}
                className="p-1 rounded-md transition-all"
                style={{ color: '#64748b' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#a5b4fc')}
                onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}
                title="Add task"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            {/* Tasks */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {colTasks.map(task => {
                const assignee = members.find(m => m.user_id === task.assignee_id)
                const dot = PRIORITY_DOT[task.priority] ?? PRIORITY_DOT.medium
                const isOverdue = task.due_date && task.status !== 'done' && new Date(task.due_date) < new Date()

                return (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => handleDragStart(task)}
                    onClick={() => setSelectedTask(task)}
                    className="rounded-lg p-3 cursor-pointer transition-all"
                    style={{
                      background: '#0f172a',
                      border: '1px solid #1e293b',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = '#7c3aed'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = '#1e293b'
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5"
                        style={{ background: dot }}
                        title={task.priority}
                      />
                      <span className="text-xs font-medium leading-snug flex-1" style={{ color: '#e2e8f0' }}>
                        {task.title}
                      </span>
                    </div>
                    {(assignee || task.due_date) && (
                      <div className="flex items-center justify-between mt-2 pl-3.5">
                        {task.due_date && (
                          <span
                            className="text-xs"
                            style={{ color: isOverdue ? '#fca5a5' : '#64748b' }}
                          >
                            {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                        {assignee && (
                          <span
                            className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', fontSize: '9px' }}
                            title={assignee.display_name}
                          >
                            {assignee.display_name.slice(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Inline add form */}
              {addingInCol === col.id && (
                <div
                  className="rounded-lg p-2"
                  style={{ background: '#0f172a', border: '1px solid #7c3aed' }}
                >
                  <input
                    autoFocus
                    type="text"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleAddTask(col.id)
                      if (e.key === 'Escape') { setAddingInCol(null); setNewTitle('') }
                    }}
                    placeholder="Task title…"
                    className="w-full text-xs bg-transparent outline-none"
                    style={{ color: '#e2e8f0' }}
                  />
                  <div className="flex gap-1.5 mt-2">
                    <button
                      onClick={() => handleAddTask(col.id)}
                      className="px-2 py-1 text-xs font-medium rounded text-white"
                      style={{ background: '#7c3aed' }}
                    >Add</button>
                    <button
                      onClick={() => { setAddingInCol(null); setNewTitle('') }}
                      className="px-2 py-1 text-xs rounded"
                      style={{ color: '#64748b' }}
                    >Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      })}

      <TaskDrawer
        task={selectedTask}
        members={members}
        onClose={() => setSelectedTask(null)}
        onUpdate={handleTaskUpdate}
        onDelete={handleTaskDelete}
      />
    </div>
  )
}
