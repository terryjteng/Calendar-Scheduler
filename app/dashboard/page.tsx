'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import Sidebar from '@/components/Sidebar'
import Calendar from '@/components/Calendar'
import TaskBoard from '@/components/TaskBoard'
import TeamSchedule from '@/components/TeamSchedule'
import { PROJECTS } from '@/lib/seedData'
import { ProjectId, TabId } from '@/lib/types'

const LOCAL_STORAGE_PROJECT_KEY = 'kato8-active-project'
const LOCAL_STORAGE_VIEW_KEY = 'kato8-active-view'

const VIEW_LABEL: Record<TabId, string> = {
  calendar: 'Calendar',
  tasks: 'Tasks',
  team: 'Team Schedule',
}

export default function DashboardPage() {
  const { user } = useUser()
  const [activeProject, setActiveProject] = useState<ProjectId>('general')
  const [activeView, setActiveView] = useState<TabId>('calendar')

  useEffect(() => {
    try {
      const savedProject = localStorage.getItem(LOCAL_STORAGE_PROJECT_KEY) as ProjectId
      const savedView = localStorage.getItem(LOCAL_STORAGE_VIEW_KEY) as TabId
      if (savedProject && ['general', 'lastlight', 'corebound', 'bigboss'].includes(savedProject)) {
        setActiveProject(savedProject)
      }
      if (savedView && ['calendar', 'tasks', 'team'].includes(savedView)) {
        setActiveView(savedView)
      }
    } catch {
      // ignore
    }
  }, [])

  const handleProjectChange = (id: ProjectId) => {
    setActiveProject(id)
    try { localStorage.setItem(LOCAL_STORAGE_PROJECT_KEY, id) } catch {}
  }

  const handleViewChange = (view: TabId) => {
    setActiveView(view)
    try { localStorage.setItem(LOCAL_STORAGE_VIEW_KEY, view) } catch {}
  }

  const project = PROJECTS.find((p) => p.id === activeProject)!

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fafc]">
      {/* Sidebar */}
      <Sidebar
        activeProject={activeProject}
        onProjectChange={handleProjectChange}
        activeView={activeView}
        onViewChange={handleViewChange}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top header */}
        <header
          className="flex items-center justify-between px-6 py-3 bg-white"
          style={{ borderBottom: '1px solid #e2e8f0', minHeight: '56px' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: project.color }}
            />
            <h1 className="text-lg font-semibold text-slate-900">{project.name}</h1>
            <span className="text-slate-300">·</span>
            <span className="text-sm font-medium text-slate-500">{VIEW_LABEL[activeView]}</span>
            {project.description && (
              <>
                <span className="text-slate-200 hidden sm:inline mx-1">—</span>
                <span className="text-sm text-slate-400 hidden sm:inline">{project.description}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <span className="text-sm text-slate-500">
                Good {getGreeting()},{' '}
                <span className="font-medium text-slate-700">
                  {user.firstName ?? user.emailAddresses?.[0]?.emailAddress?.split('@')[0]}
                </span>
              </span>
            )}
            <div className="text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
          </div>
        </header>

        {/* View content */}
        <div className="flex-1 overflow-hidden">
          {activeView === 'calendar' && <Calendar projectId={activeProject} />}
          {activeView === 'tasks' && <TaskBoard projectId={activeProject} />}
          {activeView === 'team' && <TeamSchedule projectId={activeProject} />}
        </div>
      </div>
    </div>
  )
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'evening'
}
