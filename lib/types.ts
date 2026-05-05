// Project IDs
export type ProjectId = 'general' | 'lastlight' | 'corebound' | 'bigboss'

export interface Project {
  id: ProjectId
  name: string
  color: string
  accentClass: string
  borderClass: string
  bgClass: string
  textClass: string
  memberCount: number
  description: string
}

// Calendar / Events
export type EventType = '1:1' | 'standup' | 'team' | 'review' | 'sync' | 'playtest'

export interface CalendarEvent {
  id: string
  projectId: ProjectId
  title: string
  type: EventType
  date: string // ISO date string YYYY-MM-DD
  startTime: string // HH:MM 24h
  endTime: string // HH:MM 24h
  attendees: string[]
  description?: string
  isRecurring?: boolean
}

// Tasks
export type TaskStatus = 'backlog' | 'in-progress' | 'review' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface Task {
  id: string
  projectId: ProjectId
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  assignee: string
  dueDate?: string // YYYY-MM-DD
  tags?: string[]
  createdAt: string
}

// Team members
export type DayOfWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri'

export interface TeamMember {
  id: string
  name: string
  role: string
  avatar: string
  initials: string
  projects: ProjectId[]
  noMeetingDays: DayOfWeek[]
  focusHours?: string // e.g. "9am-12pm"
  timezone: string
}

export type TabId = 'calendar' | 'tasks' | 'team'
