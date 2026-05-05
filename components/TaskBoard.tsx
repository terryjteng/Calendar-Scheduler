'use client'

import { useState, useEffect } from 'react'
import { TASKS, PROJECTS } from '@/lib/seedData'
import { ProjectId, Task, TaskStatus, TaskPriority } from '@/lib/types'

interface TaskBoardProps {
  projectId: ProjectId
}

const COLUMNS: { id: TaskStatus; label: string }[] = [
  { id: 'backlog', label: 'Backlog' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'review', label: 'Review' },
  { id: 'done', label: 'Done' },
]

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; dotClass: string; textClass: string; bgClass: string }> = {
  urgent: {
    label: 'Urgent',
    dotClass: 'bg-red-500',
    textClass: 'text-red-700',
    bgClass: 'bg-red-50 border-red-200',
  },
  high: {
    label: 'High',
    dotClass: 'bg-orange-500',
    textClass: 'text-orange-700',
    bgClass: 'bg-orange-50 border-orange-200',
  },
  medium: {
    label: 'Medium',
    dotClass: 'bg-yellow-500',
    textClass: 'text-yellow-700',
    bgClass: 'bg-yellow-50 border-yellow-200',
  },
  low: {
    label: 'Low',
    dotClass: 'bg-slate-400',
    textClass: 'text-slate-500',
    bgClass: 'bg-slate-50 border-slate-200',
  },
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function formatDueDate(dateStr: string): { label: string; urgent: boolean } {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dateStr + 'T00:00:00')
  const diffMs = due.getTime() - today.getTime()
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return { label: `${Math.abs(diffDays)}d overdue`, urgent: true }
  if (diffDays === 0) return { label: 'Due today', urgent: true }
  if (diffDays === 1) return { label: 'Due tomorrow', urgent: true }
  if (diffDays <= 7) return { label: `${diffDays}d left`, urgent: false }
  return {
    label: due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    urgent: false,
  }
}

function TaskCard({ task, onMove }: { task: Task; onMove: (id: string, status: TaskStatus) => void }) {
  const [showMenu, setShowMenu] = useState(false)
  const priority = PRIORITY_CONFIG[task.priority]
  const dueInfo = task.dueDate ? formatDueDate(task.dueDate) : null

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group">
      {/* Priority badge + menu */}
      <div className="flex items-center justify-between mb-2">
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full border ${priority.bgClass} ${priority.textClass}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${priority.dotClass}`} />
          {priority.label}
        </span>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-100 text-slate-400 transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 7a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 7a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
            </svg>
          </button>
          {showMenu && (
            <div className="absolute right-0 top-6 z-20 bg-white border border-slate-200 rounded-lg shadow-lg py-1 w-36">
              {COLUMNS.filter((c) => c.id !== task.status).map((col) => (
                <button
                  key={col.id}
                  onClick={() => { onMove(task.id, col.id); setShowMenu(false) }}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
                >
                  Move to {col.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Title */}
      <p className="text-sm font-medium text-slate-800 leading-snug mb-2">{task.title}</p>

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {task.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
        {/* Assignee */}
        <div className="flex items-center gap-1.5">
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
          >
            {getInitials(task.assignee)}
          </div>
          <span className="text-xs text-slate-500 truncate max-w-[80px]">
            {task.assignee.split(' ')[0]}
          </span>
        </div>

        {/* Due date */}
        {dueInfo && (
          <span className={`text-xs font-medium ${dueInfo.urgent ? 'text-red-600' : 'text-slate-400'}`}>
            {dueInfo.label}
          </span>
        )}
      </div>
    </div>
  )
}

const COLUMN_HEADER_COLORS: Record<TaskStatus, string> = {
  backlog: 'text-slate-500',
  'in-progress': 'text-blue-600',
  review: 'text-orange-500',
  done: 'text-green-600',
}

const COLUMN_INDICATOR_COLORS: Record<TaskStatus, string> = {
  backlog: 'bg-slate-300',
  'in-progress': 'bg-blue-500',
  review: 'bg-orange-400',
  done: 'bg-green-500',
}

const LOCAL_STORAGE_KEY = 'kato8-tasks-v1'

export default function TaskBoard({ projectId }: TaskBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(TASKS)
  const project = PROJECTS.find((p) => p.id === projectId)!

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (stored) {
        setTasks(JSON.parse(stored))
      }
    } catch {
      // ignore
    }
  }, [])

  // Persist to localStorage on change
  const updateTasks = (updated: Task[]) => {
    setTasks(updated)
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated))
    } catch {
      // ignore
    }
  }

  const handleMove = (taskId: string, newStatus: TaskStatus) => {
    updateTasks(tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)))
  }

  const projectTasks = tasks.filter((t) => t.projectId === projectId)

  const tasksByStatus = COLUMNS.reduce((acc, col) => {
    acc[col.id] = projectTasks.filter((t) => t.status === col.id)
    return acc
  }, {} as Record<TaskStatus, Task[]>)

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-3" style={{ borderBottom: '1px solid #e2e8f0' }}>
        <div className="flex items-center gap-4">
          <h2 className="text-base font-semibold text-slate-900">{project.name} — Tasks</h2>
          <span className="text-xs text-slate-400">{projectTasks.length} tasks total</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          {COLUMNS.map((col) => (
            <span key={col.id} className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${COLUMN_INDICATOR_COLORS[col.id]}`} />
              {tasksByStatus[col.id].length} {col.label}
            </span>
          ))}
        </div>
      </div>

      {/* Kanban board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-4 h-full px-6 py-4" style={{ minWidth: '900px' }}>
          {COLUMNS.map((col) => {
            const colTasks = tasksByStatus[col.id]
            return (
              <div key={col.id} className="flex flex-col flex-1 min-w-[200px]">
                {/* Column header */}
                <div className="flex items-center gap-2 mb-3">
                  <span className={`w-2 h-2 rounded-full ${COLUMN_INDICATOR_COLORS[col.id]}`} />
                  <span className={`text-sm font-semibold uppercase tracking-wide ${COLUMN_HEADER_COLORS[col.id]}`}>
                    {col.label}
                  </span>
                  <span className="ml-auto text-xs font-medium text-slate-400 bg-slate-100 rounded-full px-2 py-0.5">
                    {colTasks.length}
                  </span>
                </div>

                {/* Task cards */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                  {colTasks.map((task) => (
                    <TaskCard key={task.id} task={task} onMove={handleMove} />
                  ))}
                  {colTasks.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="text-slate-300 text-2xl mb-1">—</div>
                      <span className="text-xs text-slate-400">No tasks</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
