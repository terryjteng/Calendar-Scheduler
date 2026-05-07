'use client'

import { useState, useEffect } from 'react'
import { useUser, useClerk } from '@clerk/nextjs'
import AppNav from '@/app/_components/AppNav'
import Link from 'next/link'

type Project = {
  id: string
  name: string
  description: string | null
  color: string
  status: string
  owner_id: string
  member_ids: string[]
  created_at: string
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  active:    { bg: 'rgba(124,58,237,0.15)', text: '#a5b4fc' },
  planning:  { bg: 'rgba(14,165,233,0.15)', text: '#7dd3fc' },
  paused:    { bg: 'rgba(234,179,8,0.15)',  text: '#fde68a' },
  completed: { bg: 'rgba(34,197,94,0.15)',  text: '#86efac' },
}

export default function ProjectsPage() {
  const { user, isLoaded } = useUser()
  const { signOut } = useClerk()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [createName, setCreateName] = useState('')
  const [createDesc, setCreateDesc] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [])

  async function fetchProjects() {
    try {
      const res = await fetch('/api/projects')
      const data = await res.json()
      setProjects(data.projects ?? [])
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!createName.trim()) return
    setCreating(true)
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: createName.trim(), description: createDesc.trim() || null }),
      })
      const data = await res.json()
      if (data.project) {
        setProjects(prev => [data.project, ...prev])
        setCreateName('')
        setCreateDesc('')
        setShowCreate(false)
      }
    } finally {
      setCreating(false)
    }
  }

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: '#111827' }}>
        <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
      </div>
    )
  }

  const role = user?.publicMetadata?.role as string | undefined
  if (!role) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: '#111827' }}>
        <div className="max-w-md w-full mx-4 text-center">
          <div
            className="flex items-center justify-center w-16 h-16 rounded-2xl mx-auto mb-6 text-white text-2xl font-bold"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
          >K8</div>
          <h1 className="text-xl font-semibold mb-2" style={{ color: '#f1f5f9' }}>Access Pending</h1>
          <p className="text-sm mb-8" style={{ color: '#64748b' }}>A Kato.8 admin will approve your access shortly.</p>
          <button
            onClick={() => signOut({ redirectUrl: '/sign-in' })}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl transition-all"
            style={{ color: '#94a3b8', background: '#1e293b', border: '1px solid #2e3a57' }}
          >Sign out</button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: '#0f172a' }}>
      <AppNav />

      <div className="flex-1 overflow-y-auto px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold" style={{ color: '#f1f5f9' }}>Projects</h1>
            <p className="text-sm mt-0.5" style={{ color: '#64748b' }}>
              {projects.length} project{projects.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            New Project
          </button>
        </div>

        {/* Create project form */}
        {showCreate && (
          <form
            onSubmit={handleCreate}
            className="mb-6 p-5 rounded-xl"
            style={{ background: '#1e293b', border: '1px solid #2e3a57' }}
          >
            <h3 className="text-sm font-semibold mb-3" style={{ color: '#e2e8f0' }}>New Project</h3>
            <div className="flex gap-3 items-start">
              <input
                autoFocus
                type="text"
                placeholder="Project name"
                value={createName}
                onChange={e => setCreateName(e.target.value)}
                className="flex-1 px-3 py-2 text-sm rounded-lg outline-none"
                style={{
                  background: '#0f172a', border: '1px solid #334155',
                  color: '#e2e8f0',
                }}
              />
              <input
                type="text"
                placeholder="Description (optional)"
                value={createDesc}
                onChange={e => setCreateDesc(e.target.value)}
                className="flex-1 px-3 py-2 text-sm rounded-lg outline-none"
                style={{
                  background: '#0f172a', border: '1px solid #334155',
                  color: '#e2e8f0',
                }}
              />
              <button
                type="submit"
                disabled={creating || !createName.trim()}
                className="px-4 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
              >
                {creating ? 'Creating…' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => { setShowCreate(false); setCreateName(''); setCreateDesc('') }}
                className="px-3 py-2 text-sm rounded-lg transition-all"
                style={{ color: '#64748b', border: '1px solid #2e3a57' }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Project grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)' }}
            >
              <svg className="w-8 h-8" style={{ color: '#a5b4fc' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-sm font-medium mb-1" style={{ color: '#94a3b8' }}>No projects yet</p>
            <p className="text-xs" style={{ color: '#475569' }}>Create your first project to get started</p>
          </div>
        ) : (
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
            {projects.map(project => {
              const sc = STATUS_COLORS[project.status] ?? STATUS_COLORS.active
              return (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="block rounded-xl p-5 transition-all hover:translate-y-[-2px]"
                  style={{
                    background: '#1e293b',
                    border: '1px solid #2e3a57',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                    textDecoration: 'none',
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                      style={{ background: project.color || 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
                    >
                      {project.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span
                      className="text-xs font-medium px-2 py-1 rounded-full"
                      style={{ background: sc.bg, color: sc.text }}
                    >
                      {project.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold mb-1 truncate" style={{ color: '#e2e8f0' }}>
                    {project.name}
                  </h3>
                  {project.description && (
                    <p className="text-xs line-clamp-2" style={{ color: '#64748b' }}>
                      {project.description}
                    </p>
                  )}
                  <div className="mt-3 flex items-center gap-1.5" style={{ color: '#475569' }}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-xs">{(project.member_ids?.length ?? 0) + 1} member{(project.member_ids?.length ?? 0) !== 0 ? 's' : ''}</span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
