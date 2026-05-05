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
const LOCAL_STORAGE_TAB_KEY = 'kato8-active-tab'

export default function DashboardPage() {
  const { user } = useUser()
  const [activeProject, setActiveProject] = useState<ProjectId>('general')
  const [activeTab, setActiveTab] = useState<TabId>('calendar')

  // Restore saved project/tab from localStorage
  useEffect(() => {
    try {
      const savedProject = localStorage.getItem(LOCAL_STORAGE_PROJECT_KEY) as ProjectId
      const savedTab = localStorage.getItem(LOCAL_STORAGE_TAB_KEY) as TabId
      if (savedProject && ['general', 'lastlight', 'corebound', 'bigboss'].includes(savedProject)) {
        setActiveProject(savedProject)
      }
      if (savedTab && ['calendar', 'tasks', 'team'].includes(savedTab)) {
        setActiveTab(savedTab)
      }
    } catch {
      // ignore
    }
  }, [])

  const handleProjectChange = (id: ProjectId) => {
    setActiveProject(id)
    try {
      localStorage.setItem(LOCAL_STORAGE_PROJECT_KEY, id)
    } catch {}
  }

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab)
    try {
      localStorage.setItem(LOCAL_STORAGE_TAB_KEY, tab)
    } catch {}
  }

  const project = PROJECTS.find((p) => p.id === activeProject)!

  const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
    {
      id: 'calendar',
      label: 'Calendar',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: 'tasks',
      label: 'Tasks',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
    },
    {
      id: 'team',
      label: 'Team Schedule',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ]

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fafc]">
      {/* Sidebar */}
      <Sidebar activeProject={activeProject} onProjectChange={handleProjectChange} />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top header */}
        <header
          className="flex items-center justify-between px-6 py-3 bg-white"
          style={{ borderBottom: '1px solid #e2e8f0', minHeight: '56px' }}
        >
          <div className="flex items-center gap-3">
            {/* Project color indicator */}
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: project.color }}
            />
            <h1 className="text-lg font-semibold text-slate-900">{project.name}</h1>
            <span className="text-sm text-slate-400">{project.description}</span>
          </div>

          {/* Right side: user greeting */}
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

        {/* Tab bar */}
        <div
          className="flex items-center gap-1 px-6 bg-white"
          style={{ borderBottom: '1px solid #e2e8f0', minHeight: '44px' }}
        >
          {TABS.map((tab) => {
            const isActive = tab.id === activeTab
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-t-lg transition-all relative ${
                  isActive
                    ? 'text-slate-900'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className={isActive ? 'text-slate-700' : 'text-slate-400'}>
                  {tab.icon}
                </span>
                {tab.label}
                {/* Active underline */}
                {isActive && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t"
                    style={{ backgroundColor: project.color }}
                  />
                )}
              </button>
            )
          })}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'calendar' && <Calendar projectId={activeProject} />}
          {activeTab === 'tasks' && <TaskBoard projectId={activeProject} />}
          {activeTab === 'team' && <TeamSchedule projectId={activeProject} />}
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
