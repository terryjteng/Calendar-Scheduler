'use client'

import { useState, useEffect } from 'react'
import {
  ProjectId, CalendarEvent, EventType,
  RecurrenceFrequency, RecurrenceRule, RecurrenceIntervalUnit, RecurrenceEndType,
} from '@/lib/types'

type ApiMember = { user_id: string; display_name: string; role: string }

// ─── helpers ─────────────────────────────────────────────────────────────────

function fmtDate(d: Date): string {
  return d.toISOString().split('T')[0]
}

function addDays(d: Date, n: number): Date {
  const c = new Date(d); c.setDate(c.getDate() + n); return c
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

const EVENT_TYPES: EventType[] = ['standup', '1:1', 'team', 'review', 'sync', 'playtest']

const DAY_SHORT  = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const DAY_FULL   = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTH_NAMES = ['January','February','March','April','May','June',
                     'July','August','September','October','November','December']

function defaultRule(startDate: Date): RecurrenceRule {
  return {
    frequency: 'none',
    interval: 1,
    intervalUnit: 'week',
    daysOfWeek: [startDate.getDay()],
    endType: 'never',
    endDate: fmtDate(addDays(startDate, 91)),
    endAfter: 13,
  }
}

// ─── instance generation ──────────────────────────────────────────────────────

export function generateRecurringInstances(
  base: Omit<CalendarEvent, 'id'>,
  rule: RecurrenceRule,
  baseId: string
): CalendarEvent[] {
  if (rule.frequency === 'none') {
    return [{ ...base, id: baseId }]
  }

  const instances: CalendarEvent[] = []
  const startDate = new Date(base.date + 'T00:00:00')
  let current = new Date(startDate)
  let iters = 0
  const MAX_ITERS = 730

  while (iters < MAX_ITERS) {
    const dateStr = fmtDate(current)
    const dow = current.getDay()

    // end conditions
    if (rule.endType === 'after'  && instances.length >= rule.endAfter) break
    if (rule.endType === 'on'     && dateStr > rule.endDate) break
    if (rule.endType === 'never'  && instances.length >= 365) break

    let matches = false
    switch (rule.frequency) {
      case 'daily':
        matches = true
        break
      case 'weekdays':
        matches = dow >= 1 && dow <= 5
        break
      case 'weekly':
        matches = dow === startDate.getDay()
        break
      case 'monthly': {
        const sameDay = current.getDate() === startDate.getDate()
        const notSameMonth = current.getMonth() !== startDate.getMonth()
          || current.getFullYear() !== startDate.getFullYear()
        matches = sameDay && (notSameMonth || dateStr === base.date)
        break
      }
      case 'custom': {
        const diffDays = Math.round((current.getTime() - startDate.getTime()) / 86_400_000)
        if (rule.intervalUnit === 'day') {
          matches = diffDays % rule.interval === 0
        } else if (rule.intervalUnit === 'week') {
          const weekNum = Math.floor(diffDays / 7)
          matches = weekNum % rule.interval === 0 && rule.daysOfWeek.includes(dow)
        } else {
          const monthDiff =
            (current.getFullYear() - startDate.getFullYear()) * 12 +
            (current.getMonth() - startDate.getMonth())
          matches = monthDiff % rule.interval === 0 && current.getDate() === startDate.getDate()
        }
        break
      }
    }

    if (matches) {
      instances.push({
        ...base,
        id: `${baseId}-${dateStr}`,
        date: dateStr,
        recurrenceId: baseId,
        isRecurring: true,
      })
    }

    current = addDays(current, 1)
    iters++
  }

  return instances
}

// ─── props ────────────────────────────────────────────────────────────────────

interface AddEventModalProps {
  projectId: ProjectId
  defaultDate: string
  onSave: (events: CalendarEvent[]) => void
  onClose: () => void
}

// ─── main modal ───────────────────────────────────────────────────────────────

export default function AddEventModal({ projectId, defaultDate, onSave, onClose }: AddEventModalProps) {
  const [members, setMembers] = useState<ApiMember[]>([])

  useEffect(() => {
    fetch('/api/members').then(r => r.json()).then(d => setMembers(d.members ?? []))
  }, [])

  const [title, setTitle]                 = useState('')
  const [type, setType]                   = useState<EventType>('sync')
  const [date, setDate]                   = useState(defaultDate)
  const [startTime, setStartTime]         = useState('10:00')
  const [endTime, setEndTime]             = useState('11:00')
  const [attendees, setAttendees]         = useState<string[]>([])
  const [description, setDescription]    = useState('')
  const [rule, setRule]                   = useState<RecurrenceRule>(() =>
    defaultRule(new Date(defaultDate + 'T00:00:00'))
  )

  const dateObj = new Date(date + 'T00:00:00')

  // Keep daysOfWeek in sync when date changes
  useEffect(() => {
    setRule(prev => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.length ? prev.daysOfWeek : [new Date(date + 'T00:00:00').getDay()],
    }))
  }, [date])

  const toggleAttendee = (name: string) =>
    setAttendees(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name])

  const handleFrequencyChange = (freq: RecurrenceFrequency) => {
    const d = new Date(date + 'T00:00:00')
    setRule(prev => ({
      ...prev,
      frequency: freq,
      daysOfWeek: freq === 'custom' && prev.daysOfWeek.length ? prev.daysOfWeek : [d.getDay()],
    }))
  }

  const patchRule = (patch: Partial<RecurrenceRule>) =>
    setRule(prev => ({ ...prev, ...patch }))

  const handleSave = () => {
    if (!title.trim()) return
    const baseId = `usr-${Date.now()}`
    const base: Omit<CalendarEvent, 'id'> = {
      projectId,
      title: title.trim(),
      type,
      date,
      startTime,
      endTime,
      attendees,
      description: description.trim() || undefined,
      isRecurring: rule.frequency !== 'none',
      recurrenceRule: rule.frequency !== 'none' ? rule : undefined,
    }
    onSave(generateRecurringInstances(base, rule, baseId))
    onClose()
  }

  // Dynamic label for each recurrence option
  const RECURRENCE_OPTIONS: { value: RecurrenceFrequency; label: string }[] = [
    { value: 'none',     label: 'Does not repeat' },
    { value: 'daily',    label: 'Daily' },
    { value: 'weekdays', label: 'Every weekday (Mon–Fri)' },
    { value: 'weekly',   label: `Weekly on ${dateObj.toLocaleDateString('en-US', { weekday: 'long' })}` },
    { value: 'monthly',  label: `Monthly on the ${ordinal(dateObj.getDate())}` },
    { value: 'custom',   label: 'Custom…' },
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
        style={{ maxHeight: '92vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4" style={{ borderBottom: '1px solid #f1f5f9' }}>
          <h2 className="text-lg font-semibold text-slate-900">New Event</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

          {/* Title */}
          <input
            type="text"
            placeholder="Event title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            autoFocus
            className="w-full text-base font-medium text-slate-900 placeholder-slate-300 border-0 border-b-2 border-slate-100 focus:border-violet-400 focus:outline-none pb-1 bg-transparent transition-colors"
          />

          {/* Type chips */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">Type</label>
            <div className="flex flex-wrap gap-1.5">
              {EVENT_TYPES.map(t => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`px-3 py-1 text-xs font-medium rounded-full border transition-all ${
                    type === t
                      ? 'bg-violet-600 text-white border-violet-600'
                      : 'text-slate-500 border-slate-200 hover:border-violet-300 hover:text-violet-600'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Date + Time */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full text-sm text-slate-700 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-200 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Start</label>
              <input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full text-sm text-slate-700 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-200 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">End</label>
              <input
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="w-full text-sm text-slate-700 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-200 bg-white"
              />
            </div>
          </div>

          {/* Recurrence selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Recurrence</label>
            <select
              value={rule.frequency}
              onChange={e => handleFrequencyChange(e.target.value as RecurrenceFrequency)}
              className="w-full text-sm text-slate-700 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-violet-400 bg-white"
            >
              {RECURRENCE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Custom recurrence panel */}
          {rule.frequency === 'custom' && (
            <CustomRecurrencePanel rule={rule} startDate={dateObj} onChange={patchRule} />
          )}

          {/* Attendees */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
              Attendees {attendees.length > 0 && <span className="normal-case font-normal text-slate-400">· {attendees.length} selected</span>}
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
              {members.map(m => {
                const on = attendees.includes(m.display_name)
                return (
                  <button
                    key={m.user_id}
                    onClick={() => toggleAttendee(m.display_name)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                      on
                        ? 'bg-violet-600 text-white border-violet-600'
                        : 'text-slate-600 border-slate-200 hover:border-violet-300 hover:text-violet-600'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 ${on ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}>
                      {m.display_name[0]}
                    </span>
                    {m.display_name.split(' ')[0]}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Optional notes…"
              rows={2}
              className="w-full text-sm text-slate-700 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-200 resize-none placeholder-slate-300 bg-white"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex items-center justify-end gap-3" style={{ borderTop: '1px solid #f1f5f9' }}>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="px-5 py-2 text-sm font-semibold text-white rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
          >
            Save Event
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Custom Recurrence Panel ──────────────────────────────────────────────────

function CustomRecurrencePanel({
  rule,
  startDate,
  onChange,
}: {
  rule: RecurrenceRule
  startDate: Date
  onChange: (patch: Partial<RecurrenceRule>) => void
}) {
  const toggleDay = (dow: number) => {
    const next = rule.daysOfWeek.includes(dow)
      ? rule.daysOfWeek.filter(d => d !== dow)
      : [...rule.daysOfWeek, dow].sort((a, b) => a - b)
    if (next.length > 0) onChange({ daysOfWeek: next })
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 space-y-5">

      {/* Repeat every N unit */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-600 flex-shrink-0">Repeat every</span>
        <input
          type="number"
          min={1}
          max={99}
          value={rule.interval}
          onChange={e => onChange({ interval: Math.max(1, parseInt(e.target.value) || 1) })}
          className="w-14 text-sm text-slate-800 text-center border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-violet-400 bg-white font-medium"
        />
        <select
          value={rule.intervalUnit}
          onChange={e => {
            const unit = e.target.value as RecurrenceIntervalUnit
            onChange({
              intervalUnit: unit,
              daysOfWeek: unit === 'week' ? [startDate.getDay()] : rule.daysOfWeek,
            })
          }}
          className="flex-1 text-sm text-slate-700 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-violet-400 bg-white"
        >
          <option value="day">day</option>
          <option value="week">week</option>
          <option value="month">month</option>
        </select>
      </div>

      {/* Repeat on — only for weekly interval */}
      {rule.intervalUnit === 'week' && (
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2.5">Repeat on</div>
          <div className="flex gap-1.5">
            {DAY_SHORT.map((label, dow) => {
              const active = rule.daysOfWeek.includes(dow)
              return (
                <button
                  key={dow}
                  onClick={() => toggleDay(dow)}
                  title={DAY_FULL[dow]}
                  className={`w-9 h-9 rounded-full text-xs font-semibold transition-all ${
                    active
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'bg-white text-slate-500 border border-slate-200 hover:border-violet-300 hover:text-violet-600'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Ends */}
      <div>
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2.5">Ends</div>
        <div className="space-y-3">

          {/* Never */}
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="radio"
              name="recurrence-end"
              checked={rule.endType === 'never'}
              onChange={() => onChange({ endType: 'never' })}
              className="accent-violet-600 w-4 h-4"
            />
            <span className="text-sm text-slate-700 group-hover:text-slate-900">Never</span>
          </label>

          {/* On date */}
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="radio"
              name="recurrence-end"
              checked={rule.endType === 'on'}
              onChange={() => onChange({ endType: 'on' })}
              className="accent-violet-600 w-4 h-4"
            />
            <span className="text-sm text-slate-700 w-8 flex-shrink-0 group-hover:text-slate-900">On</span>
            <input
              type="date"
              value={rule.endDate}
              disabled={rule.endType !== 'on'}
              onChange={e => onChange({ endDate: e.target.value })}
              onClick={() => onChange({ endType: 'on' })}
              className="text-sm text-slate-700 border border-slate-200 rounded-lg px-3 py-1 focus:outline-none focus:border-violet-400 bg-white disabled:opacity-40 disabled:cursor-not-allowed"
            />
          </label>

          {/* After N occurrences */}
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="radio"
              name="recurrence-end"
              checked={rule.endType === 'after'}
              onChange={() => onChange({ endType: 'after' })}
              className="accent-violet-600 w-4 h-4"
            />
            <span className="text-sm text-slate-700 w-8 flex-shrink-0 group-hover:text-slate-900">After</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={999}
                value={rule.endAfter}
                disabled={rule.endType !== 'after'}
                onChange={e => onChange({ endAfter: Math.max(1, parseInt(e.target.value) || 1) })}
                onClick={() => onChange({ endType: 'after' })}
                className="w-16 text-sm text-slate-700 text-center border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:border-violet-400 bg-white disabled:opacity-40 disabled:cursor-not-allowed font-medium"
              />
              <span className="text-sm text-slate-500">occurrences</span>
            </div>
          </label>
        </div>
      </div>
    </div>
  )
}
