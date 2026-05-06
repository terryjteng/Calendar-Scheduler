'use client'

import { useState, useEffect, useRef } from 'react'
import { useUser } from '@clerk/nextjs'
import { TASKS, PROJECTS } from '@/lib/seedData'
import { ProjectId, Task, TaskStatus, TaskPriority, TaskNote } from '@/lib/types'

interface TaskBoardProps {
  projectId: ProjectId
}

const COLUMNS: { id: TaskStatus; label: string }[] = [
  { id: 'backlog',     label: 'Backlog'     },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'review',      label: 'Review'      },
  { id: 'done',        label: 'Done'        },
]

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; dotClass: string; textClass: string; bgClass: string }> = {
  urgent: { label: 'Urgent', dotClass: 'bg-red-500',    textClass: 'text-red-700',    bgClass: 'bg-red-50 border-red-200'     },
  high:   { label: 'High',   dotClass: 'bg-orange-500', textClass: 'text-orange-700', bgClass: 'bg-orange-50 border-orange-200'},
  medium: { label: 'Medium', dotClass: 'bg-yellow-500', textClass: 'text-yellow-700', bgClass: 'bg-yellow-50 border-yellow-200'},
  low:    { label: 'Low',    dotClass: 'bg-slate-400',  textClass: 'text-slate-500',  bgClass: 'bg-slate-50 border-slate-200' },
}

const COLUMN_HEADER_COLORS: Record<TaskStatus, string> = {
  backlog:      'text-slate-500',
  'in-progress':'text-blue-600',
  review:       'text-orange-500',
  done:         'text-green-600',
}

const COLUMN_INDICATOR: Record<TaskStatus, string> = {
  backlog:      'bg-slate-300',
  'in-progress':'bg-blue-500',
  review:       'bg-orange-400',
  done:         'bg-green-500',
}

const LOCAL_STORAGE_KEY = 'kato8-tasks-v1'

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function formatDueDate(dateStr: string): { label: string; urgent: boolean } {
  const today = new Date(); today.setHours(0,0,0,0)
  const due = new Date(dateStr + 'T00:00:00')
  const diff = Math.round((due.getTime() - today.getTime()) / 86_400_000)
  if (diff < 0)  return { label: `${Math.abs(diff)}d overdue`, urgent: true }
  if (diff === 0) return { label: 'Due today', urgent: true }
  if (diff === 1) return { label: 'Due tomorrow', urgent: true }
  if (diff <= 7)  return { label: `${diff}d left`, urgent: false }
  return { label: due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), urgent: false }
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60_000)
  if (m < 1)  return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

// ─── Task Card ────────────────────────────────────────────────────────────────

function TaskCard({
  task,
  onMove,
  onOpen,
}: {
  task: Task
  onMove: (id: string, status: TaskStatus) => void
  onOpen: (task: Task) => void
}) {
  const [showMenu, setShowMenu] = useState(false)
  const priority = PRIORITY_CONFIG[task.priority]
  const dueInfo  = task.dueDate ? formatDueDate(task.dueDate) : null
  const noteCount = task.notes?.length ?? 0

  return (
    <div
      className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group cursor-pointer"
      onClick={() => onOpen(task)}
    >
      <div className="flex items-center justify-between mb-2">
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full border ${priority.bgClass} ${priority.textClass}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${priority.dotClass}`} />
          {priority.label}
        </span>
        <div className="relative" onClick={e => e.stopPropagation()}>
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
              {COLUMNS.filter(c => c.id !== task.status).map(col => (
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

      <p className="text-sm font-medium text-slate-800 leading-snug mb-2">{task.title}</p>

      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {task.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-1.5">
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
          >
            {getInitials(task.assignee)}
          </div>
          <span className="text-xs text-slate-500 truncate max-w-[80px]">{task.assignee.split(' ')[0]}</span>
        </div>
        <div className="flex items-center gap-2">
          {noteCount > 0 && (
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {noteCount}
            </span>
          )}
          {dueInfo && (
            <span className={`text-xs font-medium ${dueInfo.urgent ? 'text-red-600' : 'text-slate-400'}`}>
              {dueInfo.label}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Task Detail Drawer ───────────────────────────────────────────────────────

function TaskDrawer({
  task,
  onClose,
  onMove,
  onAddNote,
}: {
  task: Task
  onClose: () => void
  onMove: (id: string, status: TaskStatus) => void
  onAddNote: (taskId: string, note: TaskNote) => void
}) {
  const { user } = useUser()
  const [noteText, setNoteText] = useState('')
  const notesEndRef = useRef<HTMLDivElement>(null)
  const priority = PRIORITY_CONFIG[task.priority]
  const dueInfo  = task.dueDate ? formatDueDate(task.dueDate) : null

  useEffect(() => {
    notesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [task.notes?.length])

  const submitNote = () => {
    if (!noteText.trim()) return
    const authorName = user?.fullName
      ?? user?.emailAddresses?.[0]?.emailAddress?.split('@')[0]
      ?? 'Team Member'
    onAddNote(task.id, {
      id: `note-${Date.now()}`,
      author: authorName,
      text: noteText.trim(),
      timestamp: new Date().toISOString(),
    })
    setNoteText('')
  }

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      style={{ background: 'rgba(0,0,0,0.3)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-4" style={{ borderBottom: '1px solid #f1f5f9' }}>
          <div className="flex-1 min-w-0 pr-3">
            <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full border mb-2 ${priority.bgClass} ${priority.textClass}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${priority.dotClass}`} />
              {priority.label}
            </span>
            <h2 className="text-base font-semibold text-slate-900 leading-snug">{task.title}</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 flex-shrink-0 mt-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Meta */}
        <div className="px-5 py-4 space-y-3 text-sm" style={{ borderBottom: '1px solid #f1f5f9' }}>
          {task.description && (
            <p className="text-slate-600 text-sm">{task.description}</p>
          )}
          <div className="flex items-center gap-6 flex-wrap">
            <div>
              <div className="text-xs text-slate-400 mb-0.5">Assignee</div>
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
                  {getInitials(task.assignee)}
                </div>
                <span className="text-slate-700 font-medium text-xs">{task.assignee}</span>
              </div>
            </div>
            {dueInfo && (
              <div>
                <div className="text-xs text-slate-400 mb-0.5">Due date</div>
                <span className={`text-xs font-medium ${dueInfo.urgent ? 'text-red-600' : 'text-slate-700'}`}>
                  {task.dueDate}
                </span>
              </div>
            )}
            <div>
              <div className="text-xs text-slate-400 mb-0.5">Status</div>
              <select
                value={task.status}
                onChange={e => onMove(task.id, e.target.value as TaskStatus)}
                className="text-xs text-slate-700 border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:border-violet-400 bg-white"
              >
                {COLUMNS.map(col => (
                  <option key={col.id} value={col.id}>{col.label}</option>
                ))}
              </select>
            </div>
          </div>
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {task.tags.map(tag => (
                <span key={tag} className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{tag}</span>
              ))}
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
            Notes {task.notes?.length ? `· ${task.notes.length}` : ''}
          </div>

          {(!task.notes || task.notes.length === 0) && (
            <div className="text-center py-8">
              <div className="text-2xl mb-1">💬</div>
              <p className="text-sm text-slate-400">No notes yet. Be the first.</p>
            </div>
          )}

          <div className="space-y-3">
            {(task.notes ?? []).map(note => (
              <div key={note.id} className="flex gap-2.5">
                <div
                  className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
                >
                  {getInitials(note.author)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-0.5">
                    <span className="text-xs font-semibold text-slate-800">{note.author}</span>
                    <span className="text-xs text-slate-400">{relativeTime(note.timestamp)}</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{note.text}</p>
                </div>
              </div>
            ))}
            <div ref={notesEndRef} />
          </div>
        </div>

        {/* Note composer */}
        <div className="px-5 py-4" style={{ borderTop: '1px solid #f1f5f9' }}>
          <div className="flex gap-2.5 items-end">
            <div
              className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
            >
              {user ? getInitials(user.fullName ?? user.emailAddresses?.[0]?.emailAddress ?? 'U') : '?'}
            </div>
            <div className="flex-1 flex items-end gap-2">
              <textarea
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submitNote()
                }}
                placeholder="Add a note… (⌘↵ to send)"
                rows={2}
                className="flex-1 text-sm text-slate-700 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-200 resize-none placeholder-slate-300 bg-white"
              />
              <button
                onClick={submitNote}
                disabled={!noteText.trim()}
                className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl text-white disabled:opacity-30 transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── TaskBoard ────────────────────────────────────────────────────────────────

export default function TaskBoard({ projectId }: TaskBoardProps) {
  const [tasks, setTasks]           = useState<Task[]>(TASKS)
  const [openTask, setOpenTask]     = useState<Task | null>(null)
  const project = PROJECTS.find(p => p.id === projectId)!

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (stored) setTasks(JSON.parse(stored))
    } catch {}
  }, [])

  const save = (updated: Task[]) => {
    setTasks(updated)
    try { localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated)) } catch {}
  }

  const handleMove = (taskId: string, newStatus: TaskStatus) => {
    const updated = tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t)
    save(updated)
    // Keep drawer open with updated task
    if (openTask?.id === taskId) setOpenTask(prev => prev ? { ...prev, status: newStatus } : prev)
  }

  const handleAddNote = (taskId: string, note: TaskNote) => {
    const updated = tasks.map(t =>
      t.id === taskId ? { ...t, notes: [...(t.notes ?? []), note] } : t
    )
    save(updated)
    setOpenTask(prev => prev?.id === taskId ? { ...prev, notes: [...(prev.notes ?? []), note] } : prev)
  }

  const projectTasks   = tasks.filter(t => t.projectId === projectId)
  const tasksByStatus  = COLUMNS.reduce((acc, col) => {
    acc[col.id] = projectTasks.filter(t => t.status === col.id)
    return acc
  }, {} as Record<TaskStatus, Task[]>)

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-3" style={{ borderBottom: '1px solid #e2e8f0' }}>
        <div className="flex items-center gap-4">
          <h2 className="text-base font-semibold text-slate-900">{project.name} — Tasks</h2>
          <span className="text-xs text-slate-400">{projectTasks.length} tasks</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          {COLUMNS.map(col => (
            <span key={col.id} className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${COLUMN_INDICATOR[col.id]}`} />
              {tasksByStatus[col.id].length} {col.label}
            </span>
          ))}
        </div>
      </div>

      {/* Kanban */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-4 h-full px-6 py-4" style={{ minWidth: '900px' }}>
          {COLUMNS.map(col => {
            const colTasks = tasksByStatus[col.id]
            return (
              <div key={col.id} className="flex flex-col flex-1 min-w-[200px]">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`w-2 h-2 rounded-full ${COLUMN_INDICATOR[col.id]}`} />
                  <span className={`text-sm font-semibold uppercase tracking-wide ${COLUMN_HEADER_COLORS[col.id]}`}>
                    {col.label}
                  </span>
                  <span className="ml-auto text-xs font-medium text-slate-400 bg-slate-100 rounded-full px-2 py-0.5">
                    {colTasks.length}
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                  {colTasks.map(task => (
                    <TaskCard key={task.id} task={task} onMove={handleMove} onOpen={setOpenTask} />
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

      {/* Task detail drawer */}
      {openTask && (
        <TaskDrawer
          task={openTask}
          onClose={() => setOpenTask(null)}
          onMove={handleMove}
          onAddNote={handleAddNote}
        />
      )}
    </div>
  )
}
