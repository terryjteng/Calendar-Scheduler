'use client'

import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { TabId } from '@/lib/types'

interface SidebarProps {
  activeView: TabId
  onViewChange: (view: TabId) => void
}

const VIEWS: { id: TabId; label: string; icon: React.ReactNode }[] = [
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
    id: 'team',
    label: 'Team Schedule',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
]

export default function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const { user } = useUser()

  return (
    <aside
      className="flex flex-col h-screen bg-[#1a2035] text-slate-300 select-none"
      style={{ width: '220px', minWidth: '220px', borderRight: '1px solid #2e3a57' }}
    >
      {/* Views */}
      <nav className="flex-1 px-2 overflow-y-auto sidebar-scroll pt-2">
        <div className="pt-3 pb-1.5 px-3">
          <span className="text-xs font-semibold tracking-widest text-slate-500 uppercase">Views</span>
        </div>
        <ul className="space-y-0.5 mb-2">
          {VIEWS.map((view) => {
            const isActive = view.id === activeView
            return (
              <li key={view.id}>
                <button
                  onClick={() => onViewChange(view.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all text-sm ${
                    isActive
                      ? 'bg-[#2a3454] text-white'
                      : 'text-slate-400 hover:bg-[#232d47] hover:text-slate-200'
                  }`}
                >
                  <span className={isActive ? 'text-violet-400' : 'text-slate-500'}>
                    {view.icon}
                  </span>
                  <span className="flex-1 min-w-0 truncate font-medium">{view.label}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User profile */}
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
