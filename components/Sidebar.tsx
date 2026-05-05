'use client'

import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { PROJECTS } from '@/lib/seedData'
import { ProjectId } from '@/lib/types'

interface SidebarProps {
  activeProject: ProjectId
  onProjectChange: (id: ProjectId) => void
}

const projectIcons: Record<ProjectId, string> = {
  general: '◈',
  lastlight: '◐',
  corebound: '⬡',
  bigboss: '⬛',
}

export default function Sidebar({ activeProject, onProjectChange }: SidebarProps) {
  const { user } = useUser()

  return (
    <aside
      className="flex flex-col h-screen bg-[#1a2035] text-slate-300 select-none"
      style={{ width: '220px', minWidth: '220px', borderRight: '1px solid #2e3a57' }}
    >
      {/* Logo */}
      <div className="px-5 pt-5 pb-4" style={{ borderBottom: '1px solid #2e3a57' }}>
        <div className="flex items-center gap-2.5">
          <div
            className="flex items-center justify-center rounded-lg text-white font-bold text-sm"
            style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
          >
            K8
          </div>
          <div>
            <div className="text-white font-semibold text-sm leading-tight">Kato.8 Studios</div>
            <div className="text-slate-500 text-xs">Scheduler</div>
          </div>
        </div>
      </div>

      {/* Projects label */}
      <div className="px-5 pt-4 pb-1.5">
        <span className="text-xs font-semibold tracking-widest text-slate-500 uppercase">
          Projects
        </span>
      </div>

      {/* Project list */}
      <nav className="flex-1 px-2 overflow-y-auto sidebar-scroll">
        <ul className="space-y-0.5">
          {PROJECTS.map((project) => {
            const isActive = project.id === activeProject
            return (
              <li key={project.id}>
                <button
                  onClick={() => onProjectChange(project.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all text-sm ${
                    isActive
                      ? 'bg-[#2a3454] text-white'
                      : 'text-slate-400 hover:bg-[#232d47] hover:text-slate-200'
                  }`}
                >
                  {/* Color dot */}
                  <span
                    className="flex-shrink-0 w-2 h-2 rounded-full"
                    style={{ backgroundColor: isActive ? project.color : '#475569' }}
                  />
                  {/* Project name */}
                  <span className="flex-1 min-w-0 truncate font-medium">
                    {project.name}
                  </span>
                  {/* Member count badge */}
                  <span
                    className={`flex-shrink-0 text-xs px-1.5 py-0.5 rounded-full font-medium ${
                      isActive ? 'bg-white/10 text-slate-300' : 'bg-slate-700 text-slate-500'
                    }`}
                  >
                    {project.memberCount}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>

        {/* Other tools section */}
        <div className="mt-6 mb-2">
          <span className="px-3 text-xs font-semibold tracking-widest text-slate-500 uppercase">
            Suite
          </span>
        </div>
        <ul className="space-y-0.5">
          <li>
            <a
              href="http://localhost:5173"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-500 hover:bg-[#232d47] hover:text-slate-300 transition-all"
            >
              <span className="flex-shrink-0 w-2 h-2 rounded-full bg-slate-600" />
              <span className="flex-1 truncate">HR Tool</span>
              <svg className="w-3 h-3 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </li>
          <li>
            <a
              href="http://localhost:5174"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-500 hover:bg-[#232d47] hover:text-slate-300 transition-all"
            >
              <span className="flex-shrink-0 w-2 h-2 rounded-full bg-slate-600" />
              <span className="flex-1 truncate">Social Media Dash</span>
              <svg className="w-3 h-3 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </li>
        </ul>
      </nav>

      {/* User avatar at bottom */}
      <div className="px-3 py-3" style={{ borderTop: '1px solid #2e3a57' }}>
        {user ? (
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-[#232d47] cursor-pointer transition-all">
            <div
              className="flex-shrink-0 flex items-center justify-center rounded-full text-xs font-semibold text-white"
              style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
            >
              {user.firstName?.[0] ?? user.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium text-slate-300 truncate">
                {user.fullName ?? user.emailAddresses?.[0]?.emailAddress}
              </div>
              <div className="text-xs text-slate-500 truncate">
                {user.emailAddresses?.[0]?.emailAddress}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 px-2 py-2">
            <div
              className="flex-shrink-0 flex items-center justify-center rounded-full text-xs font-semibold text-white bg-slate-600"
              style={{ width: '28px', height: '28px' }}
            >
              ?
            </div>
            <Link href="/sign-in" className="text-xs text-slate-400 hover:text-slate-200">
              Sign in
            </Link>
          </div>
        )}
      </div>
    </aside>
  )
}
