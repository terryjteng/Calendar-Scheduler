'use client'

import { useState, useEffect } from 'react'
import { ProjectId } from '@/lib/types'

interface TeamScheduleProps {
  projectId: ProjectId
}

type Member = {
  user_id: string
  display_name: string
  role: string
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']

function getThisWeekDates(): Record<string, string> {
  const today = new Date()
  const day = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1))
  const out: Record<string, string> = {}
  DAYS.forEach((d, i) => {
    const dt = new Date(monday)
    dt.setDate(monday.getDate() + i)
    out[d] = dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  })
  return out
}

export default function TeamSchedule({ projectId: _ }: TeamScheduleProps) {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const weekDates = getThisWeekDates()

  useEffect(() => {
    fetch('/api/members')
      .then(r => r.json())
      .then(d => setMembers(d.members ?? []))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3" style={{ borderBottom: '1px solid #e2e8f0' }}>
        <div>
          <h2 className="text-base font-semibold text-slate-900">Team Schedule</h2>
          <p className="text-xs text-slate-400 mt-0.5">Current week availability</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-green-100 border border-green-200 inline-block" />
            <span className="text-slate-500">Available</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-slate-100 inline-block" />
            <span className="text-slate-500">No data</span>
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-6 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
          </div>
        ) : members.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)' }}
            >
              <svg className="w-8 h-8" style={{ color: '#a5b4fc' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-600 mb-1">No team members yet</p>
            <p className="text-xs text-slate-400">Team members will appear here once they join and set up their profiles.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            {/* Column headers */}
            <div
              className="grid"
              style={{ gridTemplateColumns: '220px repeat(5, 1fr)', borderBottom: '1px solid #e2e8f0' }}
            >
              <div className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Team Member
              </div>
              {DAYS.map(day => (
                <div key={day} className="px-3 py-3 text-center">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{day}</div>
                  <div className="text-xs text-slate-400">{weekDates[day]}</div>
                </div>
              ))}
            </div>

            {/* Member rows */}
            {members.map((member, idx) => (
              <div
                key={member.user_id}
                className={`grid ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}
                style={{
                  gridTemplateColumns: '220px repeat(5, 1fr)',
                  borderBottom: '1px solid #f1f5f9',
                  minHeight: '64px',
                }}
              >
                <div className="flex items-center gap-3 px-4 py-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
                  >
                    {member.display_name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-800 truncate">{member.display_name}</div>
                    <div className="text-xs text-slate-400 truncate capitalize">{member.role}</div>
                  </div>
                </div>
                {DAYS.map(day => (
                  <div
                    key={day}
                    className="flex items-center justify-center"
                    style={{ borderLeft: '1px solid #f1f5f9', padding: '6px 4px' }}
                  >
                    <span className="w-4 h-4 rounded bg-green-100 border border-green-200 block" title="Available" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
