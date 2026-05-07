'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'

export default function AppNav() {
  const pathname = usePathname()
  const onProjects = pathname.startsWith('/projects')
  const onScheduler = !onProjects

  return (
    <div style={{
      height: '48px',
      background: '#1a2035',
      borderBottom: '1px solid #2e3a57',
      display: 'flex',
      alignItems: 'center',
      padding: '0 1rem',
      gap: '0.5rem',
      flexShrink: 0,
      position: 'sticky',
      top: 0,
      zIndex: 200,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '0.5rem' }}>
        <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '11px', fontWeight: 800 }}>K8</div>
        <span style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '0.875rem' }}>Kato.8 Studios</span>
      </div>

      <div style={{ width: 1, height: 20, background: '#2e3a57', margin: '0 0.25rem' }} />

      <NavTab href="/dashboard" label="Scheduler" active={onScheduler} />
      <NavTab href="/projects" label="Projects" active={onProjects} />

      <div style={{ flex: 1 }} />

      <a
        href="https://kato8studiosapp.xyz"
        target="_blank"
        rel="noopener noreferrer"
        style={{ fontSize: '0.72rem', color: '#64748b', textDecoration: 'none', padding: '4px 10px', borderRadius: '6px', border: '1px solid #2e3a57', transition: 'color 0.1s' }}
        onMouseEnter={e => (e.currentTarget.style.color = '#a5b4fc')}
        onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}
      >
        ← Hub
      </a>
      <UserButton />
    </div>
  )
}

function NavTab({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link href={href} style={{
      display: 'flex', alignItems: 'center',
      padding: '5px 14px', borderRadius: '8px',
      fontSize: '0.8rem', fontWeight: active ? 600 : 400,
      color: active ? '#a5b4fc' : 'rgba(203,213,225,0.5)',
      background: active ? 'rgba(124,58,237,0.15)' : 'transparent',
      border: active ? '1px solid rgba(124,58,237,0.3)' : '1px solid transparent',
      textDecoration: 'none', transition: 'all 0.12s',
    }}>
      {label}
    </Link>
  )
}
