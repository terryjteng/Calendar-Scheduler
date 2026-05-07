'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

interface Project {
  id: string
  name: string
  game: string | null
  color: string
  type: string
}

const GAMES = ['Corebound', 'Last Light', 'BBCU', 'Studio / General']

const GAME_ICONS: Record<string, string> = {
  'Corebound': '⚔️',
  'Last Light': '🔦',
  'BBCU': '🦸',
  'Studio / General': '🏢',
}

export default function ProjectsSidebar({ projects }: { projects: Project[] }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  const toggle = (game: string) => setCollapsed(prev => ({ ...prev, [game]: !prev[game] }))
  const byGame = (game: string) => projects.filter(p => (p.game ?? 'Studio / General') === game)

  const isOnProjects = pathname === '/projects'

  return (
    <div style={{
      width: 240,
      minWidth: 240,
      background: '#0d0d14',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      overflowY: 'auto',
    }}>

      {/* Sidebar header */}
      <div style={{ padding: '1rem 0.875rem 0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.625rem' }}>
          Projects
        </div>

        {/* Quick search pill — visual only for now */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          background: 'rgba(255,255,255,0.06)', borderRadius: '0.375rem',
          padding: '0.375rem 0.625rem', cursor: 'default',
        }}>
          <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>🔍</span>
          <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)' }}>Search projects…</span>
        </div>
      </div>

      {/* Quick nav */}
      <div style={{ padding: '0.5rem 0.5rem 0' }}>
        <SideNavItem
          href="/projects"
          label="All Projects"
          icon="🗂️"
          active={isOnProjects}
        />
      </div>

      {/* Divider + Spaces label */}
      <div style={{ padding: '0.875rem 0.875rem 0.375rem' }}>
        <div style={{ fontSize: '0.62rem', fontWeight: 700, color: 'rgba(255,255,255,0.22)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Spaces
        </div>
      </div>

      {/* Game spaces */}
      <div style={{ flex: 1, padding: '0 0.25rem' }}>
        {GAMES.map(game => {
          const gameProjects = byGame(game)
          const isOpen = !collapsed[game]
          const hasActiveProject = gameProjects.some(p => pathname.startsWith(`/projects/${p.id}`))

          return (
            <div key={game}>
              {/* Space header row */}
              <button
                onClick={() => toggle(game)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.375rem 0.625rem',
                  background: hasActiveProject && collapsed[game] ? 'rgba(232,93,123,0.08)' : 'transparent',
                  border: 'none', cursor: 'pointer', borderRadius: '0.375rem',
                  textAlign: 'left', fontFamily: 'inherit',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => { if (!(hasActiveProject && collapsed[game])) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                onMouseLeave={e => { e.currentTarget.style.background = hasActiveProject && collapsed[game] ? 'rgba(232,93,123,0.08)' : 'transparent' }}
              >
                <span style={{ fontSize: '0.8rem', flexShrink: 0 }}>{GAME_ICONS[game]}</span>
                <span style={{ flex: 1, fontSize: '0.78rem', fontWeight: 600, color: hasActiveProject ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {game}
                </span>
                {gameProjects.length > 0 && (
                  <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.2)', fontWeight: 600, flexShrink: 0 }}>
                    {gameProjects.length}
                  </span>
                )}
                <span style={{
                  fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', flexShrink: 0,
                  transform: isOpen ? 'rotate(90deg)' : 'none',
                  transition: 'transform 0.15s',
                  display: 'inline-block',
                }}>
                  ›
                </span>
              </button>

              {/* Project items */}
              {isOpen && (
                <div style={{ marginBottom: '0.25rem' }}>
                  {gameProjects.length === 0 ? (
                    <div style={{ padding: '0.25rem 0.625rem 0.25rem 2rem', fontSize: '0.72rem', color: 'rgba(255,255,255,0.18)', fontStyle: 'italic' }}>
                      No projects
                    </div>
                  ) : (
                    gameProjects.map(project => {
                      const active = pathname.startsWith(`/projects/${project.id}`)
                      return (
                        <Link
                          key={project.id}
                          href={`/projects/${project.id}`}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.3rem 0.625rem 0.3rem 1.75rem',
                            borderRadius: '0.375rem',
                            color: active ? 'white' : 'rgba(255,255,255,0.45)',
                            background: active ? 'rgba(232,93,123,0.18)' : 'transparent',
                            textDecoration: 'none', fontSize: '0.78rem', fontWeight: active ? 600 : 400,
                            transition: 'all 0.1s',
                            overflow: 'hidden',
                          }}
                          onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)' }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = active ? 'rgba(232,93,123,0.18)' : 'transparent' }}
                        >
                          <div style={{
                            width: 7, height: 7, borderRadius: '50%',
                            background: project.color ?? '#e85d7b',
                            flexShrink: 0,
                          }} />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {project.name}
                          </span>
                        </Link>
                      )
                    })
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer: back to dashboard */}
      <div style={{ padding: '0.75rem 0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <SideNavItem href="/dashboard" label="← Dashboard" icon="" active={false} subtle />
      </div>
    </div>
  )
}

function SideNavItem({
  href, label, icon, active, subtle,
}: {
  href: string
  label: string
  icon: string
  active: boolean
  subtle?: boolean
}) {
  return (
    <Link
      href={href}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        padding: '0.375rem 0.625rem',
        borderRadius: '0.375rem',
        color: active ? 'white' : subtle ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.5)',
        background: active ? 'rgba(232,93,123,0.18)' : 'transparent',
        textDecoration: 'none', fontSize: '0.78rem', fontWeight: active ? 600 : 400,
        border: active ? '1px solid rgba(232,93,123,0.25)' : '1px solid transparent',
        transition: 'all 0.1s',
      }}
    >
      {icon && <span style={{ fontSize: '0.8rem' }}>{icon}</span>}
      {label}
    </Link>
  )
}
