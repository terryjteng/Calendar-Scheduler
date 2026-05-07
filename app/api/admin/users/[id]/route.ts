import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { isAdminUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase'

const VALID_ROLES = ['member', 'team_lead', 'admin']

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId || !isAdminUser(userId)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id: targetUserId } = await params
  let body: { role: string }
  try { body = await req.json() }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  if (!VALID_ROLES.includes(body.role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  }

  const supabase = createClient()

  const { data: existing } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('user_id', targetUserId)
    .single()

  if (existing) {
    await supabase
      .from('profiles')
      .update({ role: body.role })
      .eq('user_id', targetUserId)
  } else {
    await supabase
      .from('profiles')
      .insert({ user_id: targetUserId, role: body.role })
  }

  return NextResponse.json({ success: true, role: body.role })
}