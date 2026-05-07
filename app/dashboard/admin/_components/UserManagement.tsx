'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

type User = {
  id: string
  firstName: string | null
  lastName: string | null
  email: string | null
  imageUrl: string
  createdAt: number
  lastSignInAt: number | null
  displayName: string | null
  team: string | null
  role: string | null
  isTeamLead: boolean
}

type ConfirmStep = 'select' | 'grant_needed' | 'updating' | 'success'

// Must match Central Command lib/roles.ts ROLE_OPTIONS exactly — these values
// are written to Clerk publicMetadata and read by ALL platforms.
const ROLES = [
  { value: 'member',               label: 'Member',               color: '#64748b' },
  { value: 'team_lead',            label: 'Team Lead',            color: '#3b82f6' },
  { value: 'social_media_manager', label: 'Social Media Manager', color: '#0d9488' },
  { value: 'client',               label: 'Client',               color: '#f59e0b' },
  { value: 'super_admin',          label: 'Super Admin',          color: '#8b5cf6' },
]

function fmtDate(ts: number | null) {
  if (!ts) return '—'
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function fmtRelative(ts: number | null) {
  if (!ts) return 'Never'
  const diff = Date.now() - ts
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days}d ago`
  if (days < 365) return `${Math.floor(days / 30)}mo ago`
  return `${Math.floor(days / 365)}y ago`
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  // Role assignment state (resets when expanded changes)
  const [selectedRole, setSelectedRole] = useState('member')
  const [confirmStep, setConfirmStep] = useState<ConfirmStep>('select')
  const [confirmedRole, setConfirmedRole] = useState('')

  useEffect(() => {
    fetch('/api/admin/users')
      .then(r => r.json())
      .then(d => { setUsers(d.users ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  // Reset role state when a different user is expanded
  useEffect(() => {
    setSelectedRole('member')
    setConfirmStep('select')
    setConfirmedRole('')
  }, [expanded])

  const handleConfirm = async (user: User) => {
    setConfirmedRole(selectedRole)
    if (!user.role) {
      // No access yet — show Grant Access button
      setConfirmStep('grant_needed')
    } else {
      // Already has access — update role directly
      setConfirmStep('updating')
      await applyRole(user.id, selectedRole)
      setConfirmStep('success')
    }
  }

  const handleGrantAccess = async (userId: string) => {
    setConfirmStep('updating')
    await applyRole(userId, confirmedRole)
    setConfirmStep('success')
  }

  const applyRole = async (userId: string, role: string) => {
    await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    })
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u))
  }

  // Sort: pending (no role) first, then by last sign-in
  const sorted = [...users].sort((a, b) => {
    if (!a.role && b.role) return -1
    if (a.role && !b.role) return 1
    return (b.lastSignInAt ?? 0) - (a.lastSignInAt ?? 0)
  })

  const filtered = sorted.filter(u => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      u.email?.toLowerCase().includes(q) ||
      u.firstName?.toLowerCase().includes(q) ||
      u.lastName?.toLowerCase().includes(q) ||
      u.displayName?.toLowerCase().includes(q) ||
      u.team?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q)
    )
  })

  const pendingCount = users.filter(u => !u.role).length

  if (loading) return <p style={{ color: '#64748b' }}>Loading users…</p>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 800 }}>
      {/* Stats bar */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {[
          { label: 'Total accounts', value: users.length },
          { label: 'Active members', value: users.filter(u => u.role).length },
          { label: 'Pending access', value: pendingCount, highlight: pendingCount > 0 },
          { label: 'Team leads', value: users.filter(u => u.isTeamLead).length },
        ].map(s => (
          <div key={s.label} style={{
            background: 'white', borderRadius: '0.75rem', padding: '0.875rem 1.25rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)', minWidth: 110,
            borderLeft: s.highlight ? '3px solid #e85d7b' : '3px solid transparent',
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.highlight ? '#e85d7b' : '#1e293b' }}>{s.value}</div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search by name, email, team, or role…"
        style={{
          padding: '0.625rem 0.875rem', borderRadius: '0.5rem', fontSize: '0.875rem',
          border: '1px solid #e2e8f0', background: 'white', outline: 'none',
          boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        }}
      />

      {/* User list */}
      <div style={{ background: 'white', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e293b' }}>
            {filtered.length} {filtered.length === 1 ? 'user' : 'users'}
          </span>
          {pendingCount > 0 && (
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#e85d7b', background: '#fdf2f5', padding: '3px 10px', borderRadius: '999px', border: '1px solid rgba(232,93,123,0.25)' }}>
              {pendingCount} awaiting access
            </span>
          )}
        </div>

        {filtered.length === 0 ? (
          <p style={{ padding: '1.5rem', color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>No users match your search.</p>
        ) : (
          filtered.map((u, i) => {
            const name = u.displayName || [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email || 'Unknown'
            const isOpen = expanded === u.id
            const isPending = !u.role

            return (
              <div key={u.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                {/* Row */}
                <div
                  onClick={() => setExpanded(isOpen ? null : u.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.875rem',
                    padding: '0.875rem 1.25rem', cursor: 'pointer',
                    background: isOpen ? '#f8fafc' : isPending ? 'rgba(232,93,123,0.02)' : 'transparent',
                    borderLeft: isPending ? '3px solid #e85d7b' : '3px solid transparent',
                    transition: 'background 0.1s',
                  }}
                >
                  {/* Avatar */}
                  <div style={{ position: 'relative', flexShrink: 0, width: 36, height: 36 }}>
                    <Image
                      src={u.imageUrl}
                      alt={name}
                      width={36}
                      height={36}
                      style={{ borderRadius: '50%', objectFit: 'cover' }}
                    />
                    {u.isTeamLead && (
                      <span style={{
                        position: 'absolute', bottom: -2, right: -2,
                        background: '#fbbf24', borderRadius: '50%',
                        width: 14, height: 14, fontSize: '9px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: '1.5px solid white',
                      }}>⭐</span>
                    )}
                  </div>

                  {/* Name / email */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {u.email}
                    </div>
                  </div>

                  {/* Status / role badge */}
                  {isPending ? (
                    <span style={{ flexShrink: 0, background: '#fdf2f5', color: '#e85d7b', borderRadius: '999px', padding: '2px 9px', fontSize: '0.7rem', fontWeight: 700, border: '1px solid rgba(232,93,123,0.3)' }}>
                      Pending
                    </span>
                  ) : u.role ? (
                    <span style={{
                      flexShrink: 0,
                      background: (ROLES.find(r => r.value === u.role)?.color ?? '#6366f1') + '18',
                      color: ROLES.find(r => r.value === u.role)?.color ?? '#6366f1',
                      borderRadius: '999px', padding: '2px 9px', fontSize: '0.7rem', fontWeight: 600,
                    }}>
                      {ROLES.find(r => r.value === u.role)?.label ?? u.role}
                    </span>
                  ) : null}

                  {/* Team badge */}
                  {u.team && (
                    <span style={{ flexShrink: 0, background: '#ede9fe', color: '#6d28d9', borderRadius: '999px', padding: '2px 8px', fontSize: '0.7rem', fontWeight: 600 }}>
                      {u.team}
                    </span>
                  )}

                  {/* Last active */}
                  <span style={{ flexShrink: 0, fontSize: '0.75rem', color: '#94a3b8', minWidth: 64, textAlign: 'right' }}>
                    {fmtRelative(u.lastSignInAt)}
                  </span>

                  {/* Chevron */}
                  <svg
                    style={{ flexShrink: 0, color: '#cbd5e1', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}
                    width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {/* Expanded detail */}
                {isOpen && (
                  <div style={{ padding: '1rem 1.25rem 1.125rem', paddingLeft: '4.25rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                    {/* Info fields */}
                    <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                      {[
                        { label: 'Clerk ID', value: u.id },
                        { label: 'Team Lead', value: u.isTeamLead ? 'Yes ⭐' : 'No' },
                        { label: 'Joined', value: fmtDate(u.createdAt) },
                        { label: 'Last sign-in', value: fmtDate(u.lastSignInAt) },
                      ].map(f => (
                        <div key={f.label}>
                          <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{f.label}</div>
                          <div style={{ fontSize: '0.8rem', color: '#1e293b', fontFamily: f.label === 'Clerk ID' ? 'monospace' : 'inherit', wordBreak: 'break-all' }}>{f.value}</div>
                        </div>
                      ))}
                    </div>

                    {/* Role assignment */}
                    <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.875rem' }}>
                      <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.625rem' }}>
                        Role Assignment
                      </div>

                      {confirmStep === 'select' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
                          <select
                            value={selectedRole}
                            onChange={e => setSelectedRole(e.target.value)}
                            style={{
                              padding: '0.4rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem',
                              fontSize: '0.82rem', fontFamily: 'inherit', color: '#1e293b',
                              background: 'white', outline: 'none', cursor: 'pointer',
                            }}
                          >
                            {ROLES.map(r => (
                              <option key={r.value} value={r.value}>{r.label}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleConfirm(u)}
                            style={{ padding: '0.4rem 1rem', background: '#1e293b', color: 'white', border: 'none', borderRadius: '0.375rem', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit' }}
                          >
                            Confirm
                          </button>
                          {u.role && (
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                              Current: <strong style={{ color: ROLES.find(r => r.value === u.role)?.color ?? '#1e293b' }}>{ROLES.find(r => r.value === u.role)?.label ?? u.role}</strong>
                            </span>
                          )}
                        </div>
                      )}

                      {confirmStep === 'grant_needed' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.82rem', color: '#475569' }}>
                            Grant as <strong style={{ color: ROLES.find(r => r.value === confirmedRole)?.color ?? '#1e293b' }}>{ROLES.find(r => r.value === confirmedRole)?.label ?? confirmedRole}</strong>?
                          </span>
                          <button
                            onClick={() => handleGrantAccess(u.id)}
                            style={{ padding: '0.4rem 1.125rem', background: '#e85d7b', color: 'white', border: 'none', borderRadius: '0.375rem', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 2px 8px rgba(232,93,123,0.35)' }}
                          >
                            Grant Access
                          </button>
                          <button
                            onClick={() => setConfirmStep('select')}
                            style={{ padding: '0.4rem 0.75rem', background: 'white', border: '1px solid #e2e8f0', color: '#64748b', borderRadius: '0.375rem', fontWeight: 500, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit' }}
                          >
                            Cancel
                          </button>
                        </div>
                      )}

                      {confirmStep === 'updating' && (
                        <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Updating…</span>
                      )}

                      {confirmStep === 'success' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                          <span style={{ fontSize: '0.82rem', color: '#16a34a', fontWeight: 600 }}>
                            ✓ Role set to <strong>{ROLES.find(r => r.value === confirmedRole)?.label ?? confirmedRole}</strong>
                          </span>
                          <button
                            onClick={() => setConfirmStep('select')}
                            style={{ fontSize: '0.72rem', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline', padding: 0 }}
                          >
                            Change
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
