import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { isAdminUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase'

export async function GET() {
  const { userId } = await auth()
  if (!userId || !isAdminUser(userId)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const clerk = await clerkClient()
  const { data: clerkUsers } = await clerk.users.getUserList({ limit: 200 })

  const supabase = createClient()
  const { data: profiles } = await supabase
    .from('profiles')
    .select('user_id, role')
    .not('role', 'is', null)

  const roledIds = new Set((profiles ?? []).map(p => p.user_id))
  const count = clerkUsers.filter(u => !roledIds.has(u.id)).length

  return NextResponse.json({ count })
}
