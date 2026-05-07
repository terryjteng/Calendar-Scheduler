'use client'

import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: '#1a2035' }}
    >
      {/* Background subtle grid */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }} />

      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div
            className="flex items-center justify-center rounded-2xl text-white font-bold text-2xl"
            style={{ width: '64px', height: '64px', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', boxShadow: '0 8px 32px rgba(124,58,237,0.4)' }}
          >
            K8
          </div>
          <div className="text-center">
            <div className="text-white font-semibold text-xl">Kato.8 Studios</div>
            <div className="text-slate-400 text-sm">Scheduler</div>
          </div>
        </div>

        <SignIn
          appearance={{
            variables: {
              colorPrimary: '#7c3aed',
              colorBackground: '#1e2942',
              colorText: '#f1f5f9',
              colorInputBackground: '#232d47',
              colorInputText: '#f1f5f9',
            },
            elements: {
              card: 'shadow-2xl border border-white/10',
              headerTitle: 'text-slate-100',
              headerSubtitle: 'text-slate-400',
              formFieldLabel: 'text-slate-300',
              footerActionLink: 'text-violet-400 hover:text-violet-300',
            },
          }}
        />
      </div>
    </div>
  )
}
