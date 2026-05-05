'use client'

import { CALENDAR_EVENTS, PROJECTS } from '@/lib/seedData'
import { getProjectMembers } from '@/lib/seedData'
import { ProjectId, DayOfWeek, TeamMember, CalendarEvent } from '@/lib/types'

interface TeamScheduleProps {
  projectId: ProjectId
}

const DAYS: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
const DAY_FULL: Record<DayOfWeek, string> = {
  Mon: 'Monday',
  Tue: 'Tuesday',
  Wed: 'Wednesday',
  Thu: 'Thursday',
  Fri: 'Friday',
}

// Seed week Mon 2026-05-04
const WEEK_DATES: Record<DayOfWeek, string> = {
  Mon: '2026-05-04',
  Tue: '2026-05-05',
  Wed: '2026-05-06',
  Thu: '2026-05-07',
  Fri: '2026-05-08',
}

function getInitials(name: string): string {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

function MemberAvatar({ member, size = 'md' }: { member: TeamMember; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-11 h-11 text-base',
  }[size]

  // Consistent colors per member based on name
  const colors = [
    'from-violet-500 to-purple-600',
    'from-teal-500 to-cyan-600',
    'from-blue-500 to-indigo-600',
    'from-amber-500 to-orange-600',
    'from-pink-500 to-rose-600',
    'from-green-500 to-emerald-600',
    'from-red-500 to-rose-600',
    'from-sky-500 to-blue-600',
  ]
  const colorIndex = member.name.charCodeAt(0) % colors.length

  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center font-semibold text-white bg-gradient-to-br ${colors[colorIndex]} flex-shrink-0`}
      title={member.name}
    >
      {getInitials(member.name)}
    </div>
  )
}

function AvailabilityCell({
  member,
  day,
  events,
}: {
  member: TeamMember
  day: DayOfWeek
  events: CalendarEvent[]
}) {
  const isNoMeetingDay = member.noMeetingDays.includes(day)
  const dateStr = WEEK_DATES[day]
  const memberEvents = events.filter(
    (e) => e.date === dateStr && e.attendees.some((a) => a === member.name)
  )
  const eventCount = memberEvents.length

  if (isNoMeetingDay) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-1 p-1" title={`${member.name} — no meetings on ${DAY_FULL[day]}`}>
        <div className="w-full h-full rounded-md bg-slate-100 flex items-center justify-center">
          <span className="text-xs text-slate-400 font-medium">Focus</span>
        </div>
      </div>
    )
  }

  if (eventCount === 0) {
    return (
      <div className="flex items-center justify-center h-full p-1" title={`${member.name} — available ${DAY_FULL[day]}`}>
        <div className="w-full h-full rounded-md bg-green-50 border border-green-100 flex items-center justify-center">
          <span className="text-xs text-green-600 font-medium">Free</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center h-full p-1" title={`${memberEvents.map((e) => e.title).join(', ')}`}>
      <div className={`w-full h-full rounded-md flex items-center justify-center ${
        eventCount >= 3
          ? 'bg-red-50 border border-red-100'
          : eventCount === 2
          ? 'bg-orange-50 border border-orange-100'
          : 'bg-blue-50 border border-blue-100'
      }`}>
        <span className={`text-xs font-semibold ${
          eventCount >= 3 ? 'text-red-600' : eventCount === 2 ? 'text-orange-600' : 'text-blue-600'
        }`}>
          {eventCount} {eventCount === 1 ? 'mtg' : 'mtgs'}
        </span>
      </div>
    </div>
  )
}

export default function TeamSchedule({ projectId }: TeamScheduleProps) {
  const project = PROJECTS.find((p) => p.id === projectId)!
  const members = getProjectMembers(projectId)
  const projectEvents = CALENDAR_EVENTS.filter((e) => e.projectId === projectId)

  // All-project events (general studio events affect everyone)
  const generalEvents = CALENDAR_EVENTS.filter((e) => e.projectId === 'general')
  const allRelevantEvents = [...projectEvents, ...generalEvents]

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3" style={{ borderBottom: '1px solid #e2e8f0' }}>
        <div>
          <h2 className="text-base font-semibold text-slate-900">{project.name} — Team Schedule</h2>
          <p className="text-xs text-slate-400 mt-0.5">Week of May 4, 2026 · Focus days shown as "Focus" · Hover cells for details</p>
        </div>
        {/* Legend */}
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-green-100 border border-green-200 inline-block" />
            <span className="text-slate-500">Free</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-blue-100 border border-blue-200 inline-block" />
            <span className="text-slate-500">1 meeting</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-orange-100 border border-orange-200 inline-block" />
            <span className="text-slate-500">2 meetings</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-red-100 border border-red-200 inline-block" />
            <span className="text-slate-500">3+ meetings</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-slate-100 inline-block" />
            <span className="text-slate-500">Focus day</span>
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto px-6 py-4">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          {/* Column headers */}
          <div
            className="grid"
            style={{ gridTemplateColumns: '220px repeat(5, 1fr)', borderBottom: '1px solid #e2e8f0' }}
          >
            <div className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">
              Team Member
            </div>
            {DAYS.map((day) => (
              <div key={day} className="px-3 py-3 text-center">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{day}</div>
                <div className="text-xs text-slate-400">{WEEK_DATES[day].slice(5)}</div>
              </div>
            ))}
          </div>

          {/* Member rows */}
          {members.map((member, idx) => (
            <div
              key={member.id}
              className={`grid ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}
              style={{ gridTemplateColumns: '220px repeat(5, 1fr)', borderBottom: '1px solid #f1f5f9', minHeight: '64px' }}
            >
              {/* Member info */}
              <div className="flex items-center gap-3 px-4 py-3">
                <MemberAvatar member={member} size="md" />
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-800 truncate">{member.name}</div>
                  <div className="text-xs text-slate-400 truncate">{member.role}</div>
                  <div className="text-xs text-slate-400">{member.timezone}</div>
                </div>
              </div>

              {/* Availability cells */}
              {DAYS.map((day) => (
                <div key={day} style={{ borderLeft: '1px solid #f1f5f9', padding: '6px 4px' }}>
                  <AvailabilityCell member={member} day={day} events={allRelevantEvents} />
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* No-meeting days summary */}
        <div className="mt-4 bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">No-Meeting Days</h3>
          <div className="flex flex-wrap gap-3">
            {members.map((member) => (
              member.noMeetingDays.length > 0 && (
                <div key={member.id} className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2">
                  <MemberAvatar member={member} size="sm" />
                  <div>
                    <div className="text-xs font-medium text-slate-700">{member.name}</div>
                    <div className="text-xs text-slate-400">
                      {member.noMeetingDays.join(', ')}
                      {member.focusHours && ` · ${member.focusHours}`}
                    </div>
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
