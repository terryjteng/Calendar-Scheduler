'use client'

import { useState, useEffect } from 'react'
import { useUser, useClerk } from '@clerk/nextjs'
import AppNav from '@/app/_components/AppNav'
import Sidebar from '@/components/Sidebar'
import Calendar from '@/components/Calendar'
import TeamSchedule from '@/components/TeamSchedule'
import { TabId } from '@/lib/types'

const LOCAL_STORAGE_VIEW_KEY = 'kato8-active-view'

const VIEW_LABEL: Record<TabId, string> = {
  calendar: 'Calendar',
  tasks: 'Tasks',
  team: 'Team Schedule',
}

export default function DashboardPage() {
  const { user, isLoaded } = useUser()
  const { signOut } = useClerk()
  const [activeView, setActiveView] = useState<TabId>('calendar')

  useEffect(() => {
    try {
      const savedView = localStorage.getItem(LOCAL_STORAGE_VIEW_KEY) as TabId
      if (savedView && ['calendar', 'team'].includes(savedView)) {
        setActiveView(savedView)
      }
    } catch {
      // ignore
    }
  }, [])

  const handleViewChange = (view: TabId) => {
    setActiveView(view)
    try { localStorage.setItem(LOCAL_STORAGE_VIEW_KEY, view) } catch {}
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
          >
            K8
          </div>
          <h1 className="text-xl font-semibold mb-2" style={{ color: '#f1f5f9' }}>Access Pending</h1>
          <p className="text-sm leading-relaxed mb-2" style={{ color: '#94a3b8' }}>
            Your account{' '}
            <span style={{ color: '#cbd5e1', fontWeight: 500 }}>
              {user?.emailAddresses?.[0]?.emailAddress}
            </span>{' '}
            hasn't been assigned a role yet.
          </p>
          <p className="text-sm mb-8" style={{ color: '#64748b' }}>
            A Kato.8 admin will approve your access shortly.
          </p>
          <button
            onClick={() => signOut({ redirectUrl: '/sign-in' })}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl transition-all"
            style={{ color: '#94a3b8', background: '#1e293b', border: '1px solid #2e3a57' }}
          >
            Sign out
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: '#0f172a' }}>
      <AppNav />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeView={activeView}
          onViewChange={handleViewChange}
        />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header
            className="flex items-center justify-between px-6 py-3 bg-white"
            style={{ borderBottom: '1px solid #e2e8f0', minHeight: '52px' }}
          >
            <div className="flex items-center gap-3">
              <span className="text-base font-semibold text-slate-800">{VIEW_LABEL[activeView]}</span>
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

          <div className="flex-1 overflow-hidden">
            {activeView === 'calendar' && <Calendar projectId="general" />}
            {activeView === 'team' && <TeamSchedule projectId="general" />}
          </div>
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
