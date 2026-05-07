import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { isAdminUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isAdminUser(userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const clerk = await clerkClient()
  const { data: clerkUsers } = await clerk.users.getUserList({ limit: 200, orderBy: '-created_at' })

  // Also pull Supabase profiles so we can show team/role
  const supabase = createClient()
  const { data: profiles } = await supabase
    .from('profiles')
    .select('user_id, display_name, team, role, is_team_lead')

  const profileMap = new Map((profiles ?? []).map(p => [p.user_id, p]))

  const users = clerkUsers.map(u => {
    const profile = profileMap.get(u.id)
    // Clerk publicMetadata.role is the authoritative role used by all platforms.
    // Supabase profile.role is a mirror kept in sync when role is assigned here.
    const clerkRole = (u.publicMetadata?.role as string | undefined) ?? null
    return {
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.emailAddresses[0]?.emailAddress ?? null,
      imageUrl: u.imageUrl,
      createdAt: u.createdAt,
      lastSignInAt: u.lastSignInAt,
      displayName: profile?.display_name ?? null,
      team: profile?.team ?? null,
      role: clerkRole,
      isTeamLead: profile?.is_team_lead ?? false,
    }
  })

  return NextResponse.json({ users })
}

