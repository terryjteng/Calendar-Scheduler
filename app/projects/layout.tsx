import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import AppNav from '@/app/_components/AppNav'
import ProjectsSidebar from './_components/ProjectsSidebar'

export default async function ProjectsLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const supabase = createClient()
  const { data } = await supabase
    .from('projects')
    .select('id, name, game, color, type')
    .order('name')

  const projects = data ?? []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f0f2f5' }}>
      <AppNav />
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <ProjectsSidebar projects={projects} />
        <div style={{ flex: 1, minWidth: 0, overflowY: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  )
}
