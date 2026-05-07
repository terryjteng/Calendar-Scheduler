'use client'

import { useState, useEffect } from 'react'

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
}

type Member = {
  user_id: string
  display_name: string
  role: string
}

interface TaskDrawerProps {
  task: Task | null
  members: Member[]
  onClose: () => void
  onUpdate: (updated: Task) => void
  onDelete: (id: string) => void
}

const PRIORITY_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  critical: { bg: 'rgba(239,68,68,0.15)',  text: '#fca5a5', dot: '#ef4444' },
  high:     { bg: 'rgba(249,115,22,0.15)', text: '#fdba74', dot: '#f97316' },
  medium:   { bg: 'rgba(234,179,8,0.15)',  text: '#fde68a', dot: '#eab308' },
  low:      { bg: 'rgba(100,116,139,0.15)',text: '#94a3b8', dot: '#64748b' },
}

const STATUS_OPTIONS = ['backlog', 'todo', 'in_progress', 'review', 'done']
const PRIORITY_OPTIONS = ['low', 'medium', 'high', 'critical']

export default function TaskDrawer({ task, members, onClose, onUpdate, onDelete }: TaskDrawerProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('backlog')
  const [priority, setPriority] = useState('medium')
  const [assigneeId, setAssigneeId] = useState<string>('')
  const [dueDate, setDueDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description ?? '')
      setStatus(task.status)
      setPriority(task.priority)
      setAssigneeId(task.assignee_id ?? '')
      setDueDate(task.due_date ?? '')
      setConfirmDelete(false)
    }
  }, [task])

  if (!task) return null

  async function handleSave() {
    if (!task) return
    setSaving(true)
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          status,
          priority,
          assignee_id: assigneeId || null,
          due_date: dueDate || null,
        }),
      })
      const data = await res.json()
      if (data.task) onUpdate(data.task)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!task) return
    await fetch(`/api/tasks/${task.id}`, { method: 'DELETE' })
    onDelete(task.id)
  }

  const pc = PRIORITY_COLORS[priority] ?? PRIORITY_COLORS.medium

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(0,0,0,0.5)' }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 h-full z-50 flex flex-col overflow-hidden"
        style={{ width: '420px', background: '#1e293b', borderLeft: '1px solid #2e3a57' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #2e3a57' }}>
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#64748b' }}>Task Detail</span>
          <button
            onClick={onClose}
            className="p-1 rounded-lg transition-all"
            style={{ color: '#64748b' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#e2e8f0')}
            onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#94a3b8' }}>Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg outline-none"
              style={{ background: '#0f172a', border: '1px solid #334155', color: '#e2e8f0' }}
              onFocus={e => (e.currentTarget.style.borderColor = '#7c3aed')}
              onBlur={e => (e.currentTarget.style.borderColor = '#334155')}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#94a3b8' }}>Description</label>
            <textarea
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Add a description…"
              className="w-full px-3 py-2 text-sm rounded-lg outline-none resize-none"
              style={{ background: '#0f172a', border: '1px solid #334155', color: '#e2e8f0' }}
              onFocus={e => (e.currentTarget.style.borderColor = '#7c3aed')}
              onBlur={e => (e.currentTarget.style.borderColor = '#334155')}
            />
          </div>

          {/* Status + Priority row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#94a3b8' }}>Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg outline-none"
                style={{ background: '#0f172a', border: '1px solid #334155', color: '#e2e8f0' }}
              >
                {STATUS_OPTIONS.map(s => (
                  <option key={s} value={s}>{s.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#94a3b8' }}>Priority</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg outline-none"
                style={{ background: '#0f172a', border: '1px solid #334155', color: '#e2e8f0' }}
              >
                {PRIORITY_OPTIONS.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Assignee */}
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#94a3b8' }}>Assignee</label>
            <select
              value={assigneeId}
              onChange={e => setAssigneeId(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg outline-none"
              style={{ background: '#0f172a', border: '1px solid #334155', color: '#e2e8f0' }}
            >
              <option value="">Unassigned</option>
              {members.map(m => (
                <option key={m.user_id} value={m.user_id}>{m.display_name}</option>
              ))}
            </select>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#94a3b8' }}>Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg outline-none"
              style={{ background: '#0f172a', border: '1px solid #334155', color: '#e2e8f0', colorScheme: 'dark' }}
            />
          </div>

          {/* Priority badge */}
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
              style={{ background: pc.bg, color: pc.text }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: pc.dot }} />
              {priority}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderTop: '1px solid #2e3a57' }}>
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: '#94a3b8' }}>Delete this task?</span>
              <button
                onClick={handleDelete}
                className="px-3 py-1.5 text-xs font-medium rounded-lg"
                style={{ background: 'rgba(239,68,68,0.2)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)' }}
              >Confirm</button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg"
                style={{ color: '#64748b', border: '1px solid #2e3a57' }}
              >Cancel</button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all"
              style={{ color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          )}

          <button
            onClick={handleSave}
            disabled={saving || !title.trim()}
            className="px-4 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-50 transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </>
  )
}
