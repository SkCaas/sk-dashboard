'use client'
import Logo from '../../components/Logo';
import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [step, setStep] = useState<'login' | 'confirm'>('login')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError('Credenciales incorrectas'); setLoading(false); return }
    const { data: prof } = await supabase.from('profiles').select('*').eq('id', data.user.id).single()
    setProfile(prof)
    setStep('confirm')
    setLoading(false)
  }

  const roleDesc: Record<string, string> = {
    CORPORATIVO: 'Gestionás tu red de proveedores y aprobás facturas',
    PROVEEDOR: 'Financiás tus facturas y seguís el estado de solicitudes',
    BANCO: 'Revisás y aprobás solicitudes de crédito con scoring',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F3', display: 'flex', fontFamily: "'Google Sans', sans-serif" }}>
      
      <div style={{ width: 480, background: '#000', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 48, flexShrink: 0 }}>
        <Link href={process.env.NEXT_PUBLIC_LANDING_URL || "/"} style={{ textDecoration: 'none' }}>
          <Logo theme="dark" />
        </Link>
        <div>
          <p style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: '#404040', marginBottom: 24 }}>SK Credit Infrastructure · of LATAM</p>
          <h2 style={{ fontFamily: "'Google Sans', sans-serif", fontSize: 36, fontWeight: 700, color: '#fff', letterSpacing: -1, lineHeight: 1.1, marginBottom: 24 }}>Capital moves when you decide.</h2>
        </div>
        <div style={{ fontSize: 11, color: '#272727', letterSpacing: 1 }}>© 2026 SK. All rights reserved.</div>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          {step === 'login' && (
            <>
              <h1 style={{ fontFamily: "'Google Sans', sans-serif", fontSize: 28, fontWeight: 700, color: '#000', letterSpacing: -1, marginBottom: 8 }}>Bienvenido</h1>
              <p style={{ fontSize: 13, color: '#909090', marginBottom: 40 }}>Iniciá sesión en tu cuenta SK</p>
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {error && <div style={{ background: '#FFF5F5', border: '1px solid #FFE0E0', color: '#CC0000', padding: '12px 16px', fontSize: 13 }}>{error}</div>}
                <div>
                  <label style={{ display: 'block', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: '#909090', marginBottom: 8 }}>Email</label>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                    style={{ width: '100%', background: '#fff', border: '1px solid #E0E0E0', color: '#000', padding: '12px 16px', fontSize: 14, outline: 'none', fontFamily: "'Google Sans', sans-serif" }}
                    placeholder="tu@empresa.com" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: '#909090', marginBottom: 8 }}>Contraseña</label>
                  <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                    style={{ width: '100%', background: '#fff', border: '1px solid #E0E0E0', color: '#000', padding: '12px 16px', fontSize: 14, outline: 'none', fontFamily: "'Google Sans', sans-serif" }}
                    placeholder="••••••••" />
                </div>
                <button type="submit" disabled={loading}
                  style={{ background: loading ? '#E0E0E0' : '#000', color: loading ? '#909090' : '#fff', padding: '14px', fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', border: 'none', cursor: 'pointer', fontFamily: "'Google Sans', sans-serif", marginTop: 8 }}>
                  {loading ? 'Verificando...' : 'Iniciar sesión'}
                </button>
                <p style={{ textAlign: 'center', fontSize: 12, color: '#909090' }}>
                  ¿No tenés cuenta?{' '}
                  <Link href="/register" style={{ color: '#000', textDecoration: 'none', fontWeight: 500 }}>Registrate</Link>
                </p>
              </form>
            </>
          )}
          {step === 'confirm' && profile && (
            <>
              <p style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: '#909090', marginBottom: 24 }}>Sesión iniciada</p>
              <h1 style={{ fontFamily: "'Google Sans', sans-serif", fontSize: 28, fontWeight: 700, color: '#000', letterSpacing: -1, marginBottom: 8 }}>Hola, {profile.company_name}</h1>
              <p style={{ fontSize: 13, color: '#909090', marginBottom: 40 }}>Confirmá tu perfil para continuar</p>
              <div style={{ border: '1.5px solid #000', padding: 32, marginBottom: 24, background: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                  <div>
                    <p style={{ fontFamily: "'Google Sans', sans-serif", fontSize: 18, fontWeight: 700, letterSpacing: -0.5, marginBottom: 4 }}>{profile.company_name}</p>
                    <p style={{ fontSize: 12, color: '#909090' }}>{profile.email}</p>
                  </div>
                  <span style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', border: '1px solid #000', padding: '4px 10px', fontWeight: 600 }}>{profile.role}</span>
                </div>
                <div style={{ borderTop: '1px solid #F0F0F0', paddingTop: 16 }}>
                  <p style={{ fontSize: 12, color: '#606060', lineHeight: 1.7 }}>{roleDesc[profile.role]}</p>
                </div>
              </div>
              <button onClick={() => window.location.href = window.location.origin + '/dashboard'}
                style={{ width: '100%', background: '#000', color: '#fff', padding: '14px', fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', border: 'none', cursor: 'pointer', fontFamily: "'Google Sans', sans-serif", marginBottom: 12 }}>
                Ir al dashboard →
              </button>
              <button onClick={() => { setStep('login'); setProfile(null); supabase.auth.signOut() }}
                style={{ width: '100%', background: '#fff', color: '#909090', padding: '12px', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', border: '1px solid #E0E0E0', cursor: 'pointer', fontFamily: "'Google Sans', sans-serif" }}>
                No soy yo · Cambiar cuenta
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
