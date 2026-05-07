import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { isAdminUser } from '@/lib/auth'

export async function GET() {
  const { userId } = await auth()
  if (!userId || !isAdminUser(userId)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const clerk = await clerkClient()
  const { data: clerkUsers } = await clerk.users.getUserList({ limit: 200 })

  // Clerk publicMetadata.role is the single source of truth for all platforms.
  // A user is "pending" if they've signed up but haven't been granted a role yet.
  const count = clerkUsers.filter(u => !u.publicMetadata?.role).length

  return NextResponse.json({ count })
}
