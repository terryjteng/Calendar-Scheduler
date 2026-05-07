'use client'

import { useState, useMemo, useEffect } from 'react'
import { ProjectId, CalendarEvent, EventType } from '@/lib/types'
import AddEventModal from './AddEventModal'

interface CalendarProps {
  projectId: ProjectId
}

const SEED_WEEK_START = new Date('2026-05-04T00:00:00')
const USER_EVENTS_KEY = 'kato8-calendar-events-v1'

function getWeekStart(offsetWeeks: number): Date {
  const d = new Date(SEED_WEEK_START)
  d.setDate(d.getDate() + offsetWeeks * 7)
  return d
}

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0]
}

function addDays(d: Date, n: number): Date {
  const copy = new Date(d)
  copy.setDate(copy.getDate() + n)
  return copy
}

const DAY_NAMES   = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const HOURS       = Array.from({ length: 12 }, (_, i) => i + 8)

const EVENT_TYPE_COLORS: Record<EventType, { bg: string; text: string; border: string }> = {
  standup:  { bg: 'bg-green-100',  text: 'text-green-800',  border: 'border-green-300'  },
  '1:1':    { bg: 'bg-violet-100', text: 'text-violet-800', border: 'border-violet-300' },
  team:     { bg: 'bg-blue-100',   text: 'text-blue-800',   border: 'border-blue-300'   },
  review:   { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300' },
  sync:     { bg: 'bg-sky-100',    text: 'text-sky-800',    border: 'border-sky-300'    },
  playtest: { bg: 'bg-pink-100',   text: 'text-pink-800',   border: 'border-pink-300'   },
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function formatTime12(t: string): string {
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'pm' : 'am'
  const h12  = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${String(m).padStart(2, '0')}${ampm}`
}

// ─── EventCard ────────────────────────────────────────────────────────────────

function EventCard({
  event,
  topPx,
  heightPx,
  onClick,
}: {
  event: CalendarEvent
  topPx: number
  heightPx: number
  onClick: () => void
}) {
  const colors = EVENT_TYPE_COLORS[event.type]
  return (
    <button
      onClick={onClick}
      className={`absolute inset-x-0.5 rounded-md px-2 py-1 text-left border overflow-hidden transition-all hover:z-10 hover:shadow-md ${colors.bg} ${colors.border} ${colors.text}`}
      style={{ top: `${topPx}px`, height: `${Math.max(heightPx, 22)}px` }}
    >
      <div className="flex items-center gap-1 leading-tight">
        <span className="text-xs font-semibold truncate flex-1">{event.title}</span>
        {event.isRecurring && (
          <svg className="w-2.5 h-2.5 flex-shrink-0 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        )}
      </div>
      {heightPx > 30 && (
        <div className="text-xs opacity-70">{formatTime12(event.startTime)}</div>
      )}
    </button>
  )
}

// ─── EventDetailModal ─────────────────────────────────────────────────────────

function EventDetailModal({ event, onClose }: { event: CalendarEvent | null; onClose: () => void }) {
  if (!event) return null
  const colors = EVENT_TYPE_COLORS[event.type]
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.4)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full border mb-2 ${colors.bg} ${colors.text} ${colors.border}`}>
              {event.type}
            </span>
            <h2 className="text-lg font-semibold text-slate-900">{event.title}</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 ml-4 mt-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-3 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>
              {new Date(event.date + 'T00:00:00').toLocaleDateString('en-US', {
                weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
              })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{formatTime12(event.startTime)} – {formatTime12(event.endTime)}</span>
          </div>
          {event.description && (
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              <span>{event.description}</span>
            </div>
          )}
          {event.attendees.length > 0 && (
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div className="flex flex-wrap gap-1">
                {event.attendees.map(a => (
                  <span key={a} className="bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded-full">{a}</span>
                ))}
              </div>
            </div>
          )}
          {event.isRecurring && (
            <div className="flex items-center gap-2 text-slate-500">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="text-xs">Recurring event</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Calendar ─────────────────────────────────────────────────────────────────

export default function Calendar({ projectId }: CalendarProps) {
  const [weekOffset, setWeekOffset]       = useState(0)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [showAddModal, setShowAddModal]   = useState(false)
  const [addModalDate, setAddModalDate]   = useState(formatDate(new Date()))
  const [userEvents, setUserEvents]       = useState<CalendarEvent[]>([])

  // Load user-created events from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(USER_EVENTS_KEY)
      if (raw) setUserEvents(JSON.parse(raw))
    } catch {}
  }, [])

  const saveUserEvents = (events: CalendarEvent[]) => {
    setUserEvents(events)
    try { localStorage.setItem(USER_EVENTS_KEY, JSON.stringify(events)) } catch {}
  }

  const handleAddEvents = (newEvents: CalendarEvent[]) => {
    saveUserEvents([...userEvents, ...newEvents])
  }

  const weekStart      = getWeekStart(weekOffset)
  const weekDates      = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const weekDateStrs   = weekDates.map(formatDate)
  const today          = formatDate(new Date())

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {}
    for (const ev of userEvents) {
      if (!map[ev.date]) map[ev.date] = []
      map[ev.date].push(ev)
    }
    return map
  }, [userEvents])

  const HOUR_HEIGHT    = 60
  const GRID_START_HOUR = 8

  const startMonthLabel = `${MONTH_NAMES[weekStart.getMonth()]} ${weekStart.getFullYear()}`
  const endDate         = weekDates[6]
  const endMonthLabel   = `${MONTH_NAMES[endDate.getMonth()]} ${endDate.getFullYear()}`
  const weekLabel = startMonthLabel === endMonthLabel ? startMonthLabel : `${startMonthLabel} / ${endMonthLabel}`

  const openAddModal = (date: string) => {
    setAddModalDate(date)
    setShowAddModal(true)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-3" style={{ borderBottom: '1px solid #e2e8f0' }}>
        <div className="flex items-center gap-3">
          <h2 className="text-base font-semibold text-slate-900">{weekLabel}</h2>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setWeekOffset(o => o - 1)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setWeekOffset(0)}
              className="px-2.5 py-1 text-xs font-medium rounded-lg hover:bg-slate-100 text-slate-600 transition-all"
            >
              Today
            </button>
            <button
              onClick={() => setWeekOffset(o => o + 1)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Legend */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {(Object.entries(EVENT_TYPE_COLORS) as [EventType, typeof EVENT_TYPE_COLORS[EventType]][]).map(([t, c]) => (
              <span key={t} className={`text-xs font-medium px-2 py-0.5 rounded-full border ${c.bg} ${c.text} ${c.border}`}>
                {t}
              </span>
            ))}
          </div>
          {/* New Event button */}
          <button
            onClick={() => openAddModal(weekDateStrs[0])}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-white rounded-lg transition-all hover:opacity-90 flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            New Event
          </button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="flex-1 overflow-auto">
        <div className="min-w-[600px]">
          {/* Day headers */}
          <div
            className="grid sticky top-0 bg-white z-10"
            style={{ gridTemplateColumns: '60px repeat(7, 1fr)', borderBottom: '1px solid #e2e8f0' }}
          >
            <div className="py-2" />
            {weekDates.map((d, i) => {
              const dateStr  = formatDate(d)
              const isToday  = dateStr === today
              return (
                <div
                  key={i}
                  className="py-2 px-1 text-center cursor-pointer hover:bg-slate-50 transition-colors group"
                  onClick={() => openAddModal(dateStr)}
                  title={`New event on ${d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}`}
                >
                  <div className={`text-xs font-medium uppercase tracking-wide ${isToday ? 'text-violet-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                    {DAY_NAMES[i]}
                  </div>
                  <div className={`mt-0.5 text-sm font-semibold inline-flex items-center justify-center w-7 h-7 rounded-full mx-auto transition-all ${
                    isToday ? 'bg-violet-600 text-white' : 'text-slate-700 group-hover:bg-slate-100'
                  }`}>
                    {d.getDate()}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Time grid */}
          <div className="relative">
            {HOURS.map(hour => (
              <div
                key={hour}
                className="grid"
                style={{
                  gridTemplateColumns: '60px repeat(7, 1fr)',
                  height: `${HOUR_HEIGHT}px`,
                  borderBottom: '1px solid #f1f5f9',
                }}
              >
                <div className="flex items-start justify-end pr-3 pt-0.5">
                  <span className="text-xs text-slate-400 font-medium">
                    {hour === 12 ? '12pm' : hour < 12 ? `${hour}am` : `${hour - 12}pm`}
                  </span>
                </div>
                {weekDates.map((_, di) => (
                  <div key={di} style={{ borderLeft: '1px solid #f1f5f9' }} />
                ))}
              </div>
            ))}

            {/* Events overlay */}
            <div className="absolute inset-0" style={{ pointerEvents: 'none' }}>
              {weekDateStrs.map((dateStr, colIdx) => {
                const dayEvents = eventsByDate[dateStr] ?? []
                return dayEvents.map(ev => {
                  const startMin   = timeToMinutes(ev.startTime)
                  const endMin     = timeToMinutes(ev.endTime)
                  const topPx      = ((startMin - GRID_START_HOUR * 60) / 60) * HOUR_HEIGHT
                  const heightPx   = ((endMin - startMin) / 60) * HOUR_HEIGHT
                  const leftPct    = ((colIdx + 1) / 8) * 100

                  return (
                    <div
                      key={ev.id}
                      style={{
                        position: 'absolute',
                        left: `calc(${leftPct}% + 2px)`,
                        width: `calc(${(1 / 8) * 100}% - 4px)`,
                        top: `${topPx}px`,
                        height: `${Math.max(heightPx, 22)}px`,
                        pointerEvents: 'auto',
                        zIndex: 5,
                      }}
                    >
                      <EventCard
                        event={ev}
                        topPx={0}
                        heightPx={Math.max(heightPx, 22)}
                        onClick={() => setSelectedEvent(ev)}
                      />
                    </div>
                  )
                })
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Event detail modal */}
      <EventDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />

      {/* Add event modal */}
      {showAddModal && (
        <AddEventModal
          projectId={projectId}
          defaultDate={addModalDate}
          onSave={handleAddEvents}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  )
}
