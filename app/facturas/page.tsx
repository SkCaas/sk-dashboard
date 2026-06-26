'use client'
import Logo from '../../components/Logo';
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function FacturasPage() {
  const [facturas, setFacturas] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = window.location.origin + '/login'; return }
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(prof)
      const { data: facts } = await supabase.from('facturas').select('*').order('created_at', { ascending: false })
      setFacturas(facts || [])
      setLoading(false)
    }
    load()
  }, [])

  async function cambiarEstado(id: string, estado: string) {
    await supabase.from('facturas').update({ estado }).eq('id', id)
    setFacturas(prev => prev.map(f => f.id === id ? { ...f, estado } : f))
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#F5F5F3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Google Sans', sans-serif" }}>
      <p style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: '#909090' }}>Cargando...</p>
    </div>
  )

  const isCorporativo = profile?.role === 'CORPORATIVO'

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F3', fontFamily: "'Google Sans', sans-serif", color: '#000' }}>
      

      <header style={{ borderBottom: '1px solid #E0E0E0', background: '#fff', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 40px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href={process.env.NEXT_PUBLIC_LANDING_URL || "/"} style={{ textDecoration: 'none' }}>
            <Logo />
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <Link href="/dashboard" style={{ fontSize: 11, color: '#909090', textDecoration: 'none', letterSpacing: 1.5, textTransform: 'uppercase' }}>Dashboard</Link>
            {!isCorporativo && (
              <Link href="/facturas/nueva" style={{ background: '#000', color: '#fff', padding: '8px 20px', fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', textDecoration: 'none' }}>+ Nueva factura</Link>
            )}
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 40px' }}>
        <div style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: '#909090', marginBottom: 12 }}>
          {isCorporativo ? 'Facturas para aprobar' : 'Mis facturas'}
        </div>
        <h1 style={{ fontFamily: "'Google Sans', sans-serif", fontSize: 32, fontWeight: 700, letterSpacing: -1, marginBottom: 48 }}>
          {isCorporativo ? 'Pipeline de facturas' : 'Mis facturas'}
        </h1>

        {facturas.length === 0 ? (
          <div style={{ background: '#fff', border: '1px solid #E0E0E0', padding: '80px 40px', textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: '#C0C0C0', marginBottom: 24 }}>No hay facturas aún</p>
            {!isCorporativo && (
              <Link href="/facturas/nueva" style={{ display: 'inline-block', background: '#000', color: '#fff', padding: '12px 32px', fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', textDecoration: 'none' }}>
                Cargar primera factura
              </Link>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: '#E0E0E0', border: '1px solid #E0E0E0' }}>
            {facturas.map(f => (
              <div key={f.id} style={{ background: '#fff', padding: '28px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
                    <p style={{ fontFamily: "'Google Sans', sans-serif", fontSize: 16, fontWeight: 700, letterSpacing: -0.5 }}>{f.numero_factura}</p>
                    <span style={{ fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', border: '1px solid #E0E0E0', padding: '3px 8px', color: f.estado === 'PENDIENTE' ? '#909090' : f.estado === 'APROBADA' ? '#000' : '#C0C0C0' }}>
                      {f.estado}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 32, fontSize: 13, color: '#909090' }}>
                    <span>{f.emisor}</span>
                    <span>→ {f.receptor}</span>
                    <span style={{ fontFamily: "'Google Sans', sans-serif", color: '#000', fontWeight: 500 }}>{f.moneda} {Number(f.monto).toLocaleString()}</span>
                    <span>{f.fecha_emision || 'Sin fecha'}</span>
                  </div>
                </div>
                {isCorporativo && f.estado === 'PENDIENTE' && (
                  <div style={{ display: 'flex', gap: 8, marginLeft: 32 }}>
                    <button onClick={() => cambiarEstado(f.id, 'APROBADA')}
                      style={{ background: '#000', color: '#fff', padding: '10px 20px', fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', border: 'none', cursor: 'pointer', fontFamily: "'Google Sans', sans-serif" }}>
                      Aprobar
                    </button>
                    <button onClick={() => cambiarEstado(f.id, 'RECHAZADA')}
                      style={{ background: '#fff', color: '#909090', padding: '10px 20px', fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', border: '1px solid #E0E0E0', cursor: 'pointer', fontFamily: "'Google Sans', sans-serif" }}>
                      Rechazar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
