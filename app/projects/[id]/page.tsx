'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import AppNav from '@/app/_components/AppNav'
import KanbanBoard from '@/app/projects/_components/KanbanBoard'
import Link from 'next/link'

type Project = {
  id: string
  name: string
  description: string | null
  color: string
  status: string
}

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

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { isLoaded } = useUser()
  const [project, setProject] = useState<Project | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    Promise.all([
      fetch(`/api/projects/${id}`).then(r => r.json()),
      fetch(`/api/projects/${id}/tasks`).then(r => r.json()),
      fetch('/api/members').then(r => r.json()),
    ]).then(([projectData, tasksData, membersData]) => {
      setProject(projectData.project ?? null)
      setTasks(tasksData.tasks ?? [])
      setMembers(membersData.members ?? [])
    }).finally(() => setLoading(false))
  }, [id])

  if (!isLoaded || loading) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: '#0f172a' }}>
        <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex flex-col h-screen" style={{ background: '#0f172a' }}>
        <AppNav />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-sm mb-4" style={{ color: '#94a3b8' }}>Project not found.</p>
            <Link href="/projects" className="text-sm" style={{ color: '#a5b4fc' }}>← Back to Projects</Link>
          </div>
        </div>
      </div>
    )
  }

  const backlogCount = tasks.filter(t => t.status === 'backlog').length
  const doneCount    = tasks.filter(t => t.status === 'done').length
  const totalCount   = tasks.length

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: '#0f172a' }}>
      <AppNav />

      {/* Project sub-header */}
      <div
        className="flex items-center gap-4 px-6 py-3"
        style={{ background: '#1a2035', borderBottom: '1px solid #2e3a57' }}
      >
        <Link
          href="/projects"
          className="flex items-center gap-1 text-xs transition-all"
          style={{ color: '#64748b', textDecoration: 'none' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#a5b4fc')}
          onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Projects
        </Link>

        <span style={{ color: '#2e3a57' }}>/</span>

        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0"
            style={{ background: project.color || 'linear-gradient(135deg, #7c3aed, #4f46e5)', fontSize: '10px' }}
          >
            {project.name.slice(0, 2).toUpperCase()}
          </div>
          <span className="text-sm font-semibold" style={{ color: '#e2e8f0' }}>{project.name}</span>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <span className="text-xs" style={{ color: '#64748b' }}>
            {doneCount}/{totalCount} done
          </span>
          {totalCount > 0 && (
            <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ background: '#2e3a57' }}>
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${(doneCount / totalCount) * 100}%`,
                  background: 'linear-gradient(90deg, #7c3aed, #4f46e5)',
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Kanban */}
      <div className="flex-1 overflow-hidden">
        <KanbanBoard
          projectId={id}
          tasks={tasks}
          members={members}
          onTasksChange={setTasks}
        />
      </div>
    </div>
  )
}
