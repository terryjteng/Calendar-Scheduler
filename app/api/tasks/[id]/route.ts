import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json()
  const updates: Record<string, unknown> = {}

  const allowed = ['title', 'description', 'status', 'priority', 'assignee_id', 'due_date',
    'stage', 'external_url', 'embed_url', 'sprint_id', 'milestone_id', 'depends_on',
    'size_estimate', 'position']
  for (const key of allowed) {
    if (key in body) updates[key] = body[key]
  }

  if (updates.status === 'in_progress') updates.started_at = new Date().toISOString()
  if (updates.status === 'done') updates.completed_at = new Date().toISOString()
  updates.updated_at = new Date().toISOString()

  const supabase = createClient()
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ task: data })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const supabase = createClient()
  const { error } = await supabase.from('tasks').delete().eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
