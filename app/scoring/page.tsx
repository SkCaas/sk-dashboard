'use client'
import Logo from '../../components/Logo';
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const S = {
  page: { minHeight: '100vh', background: '#F5F5F3', fontFamily: "'Google Sans', sans-serif", color: '#000' },
  header: { borderBottom: '1px solid #E0E0E0', background: '#fff', position: 'sticky' as const, top: 0, zIndex: 100 },
  headerInner: { maxWidth: 1200, margin: '0 auto', padding: '0 40px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  main: { maxWidth: 1200, margin: '0 auto', padding: '60px 40px' },
  label: { display: 'block', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase' as const, color: '#909090', marginBottom: 8 },
  input: { width: '100%', background: '#fff', border: '1px solid #E0E0E0', color: '#000', padding: '12px 16px', fontSize: 14, outline: 'none', fontFamily: "'Google Sans', sans-serif" },
  card: { background: '#fff', border: '1px solid #E0E0E0', padding: 40 },
}

export default function ScoringPage() {
  const [form, setForm] = useState({ company_name: '', tax_id: '', annual_revenue: '', years_in_business: '', existing_debt: '', requested_amount: '', payment_history_score: '80' })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No autenticado')
      const { data: app, error: appError } = await supabase.from('credit_applications').insert({
        company_name: form.company_name, tax_id: form.tax_id,
        annual_revenue: Number(form.annual_revenue), years_in_business: Number(form.years_in_business),
        existing_debt: Number(form.existing_debt) || 0, requested_amount: Number(form.requested_amount),
        payment_history_score: Number(form.payment_history_score), applicant_id: user.id
      }).select().single()
      if (appError) throw new Error(appError.message)
      const response = await fetch('/api/scoring/evaluate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ application_id: app.id }) })
      const scoring = await response.json()
      setResult({ ...scoring, company_name: form.company_name })
    } catch (err: any) { setError(err.message) }
    finally { setLoading(false) }
  }

  const getColor = (rec: string) => rec === 'APPROVE' ? '#000' : rec === 'REVIEW' ? '#606060' : '#C0C0C0'
  const getLabel = (rec: string) => rec === 'APPROVE' ? 'APROBAR' : rec === 'REVIEW' ? 'REVISAR' : 'RECHAZAR'

  return (
    <div style={S.page}>
      
      <header style={S.header}>
        <div style={S.headerInner}>
          <a href={process.env.NEXT_PUBLIC_LANDING_URL || "/"} style={{ textDecoration: 'none' }}>
            <Logo />
          </a>
          <div style={{ display: 'flex', gap: 24 }}>
            <Link href="/banco" style={{ fontSize: 11, color: '#909090', textDecoration: 'none', letterSpacing: 1.5, textTransform: 'uppercase' }}>Portal Banco</Link>
            <Link href="/dashboard" style={{ fontSize: 11, color: '#909090', textDecoration: 'none', letterSpacing: 1.5, textTransform: 'uppercase' }}>Dashboard</Link>
          </div>
        </div>
      </header>
      <main style={S.main}>
        <div style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: '#909090', marginBottom: 12 }}>Sprint 1 — Scoring Engine</div>
        <h1 style={{ fontFamily: "'Google Sans', sans-serif", fontSize: 32, fontWeight: 700, letterSpacing: -1, marginBottom: 8 }}>Evaluación crediticia</h1>
        <p style={{ fontSize: 14, color: '#909090', marginBottom: 48 }}>Motor de reglas en tiempo real · 4 variables · menos de 500ms</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: '#E0E0E0', border: '1px solid #E0E0E0' }}>
          <div style={S.card}>
            <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: '#C0C0C0', marginBottom: 28, fontFamily: "'Google Sans', sans-serif" }}>01 — Nueva solicitud</div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {error && <div style={{ background: '#FFF5F5', border: '1px solid #FFE0E0', color: '#CC0000', padding: '12px 16px', fontSize: 13 }}>{error}</div>}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div><label style={S.label}>Empresa</label><input type="text" required value={form.company_name} onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))} style={S.input} placeholder="Grupo Industrial S.A." /></div>
                <div><label style={S.label}>RFC / Tax ID</label><input type="text" value={form.tax_id} onChange={e => setForm(f => ({ ...f, tax_id: e.target.value }))} style={S.input} placeholder="GIS123456ABC" /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div><label style={S.label}>Ingresos anuales (USD)</label><input type="number" required value={form.annual_revenue} onChange={e => setForm(f => ({ ...f, annual_revenue: e.target.value }))} style={S.input} placeholder="5000000" /></div>
                <div><label style={S.label}>Monto solicitado (USD)</label><input type="number" required value={form.requested_amount} onChange={e => setForm(f => ({ ...f, requested_amount: e.target.value }))} style={S.input} placeholder="500000" /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div><label style={S.label}>Deuda existente (USD)</label><input type="number" value={form.existing_debt} onChange={e => setForm(f => ({ ...f, existing_debt: e.target.value }))} style={S.input} placeholder="100000" /></div>
                <div><label style={S.label}>Años en operación</label><input type="number" required value={form.years_in_business} onChange={e => setForm(f => ({ ...f, years_in_business: e.target.value }))} style={S.input} placeholder="7" /></div>
              </div>
              <div>
                <label style={S.label}>Historial de pagos — <span style={{ color: '#000', fontWeight: 500 }}>{form.payment_history_score}/100</span></label>
                <input type="range" min="0" max="100" value={form.payment_history_score} onChange={e => setForm(f => ({ ...f, payment_history_score: e.target.value }))} style={{ width: '100%', accentColor: '#000' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#C0C0C0', marginTop: 4 }}>
                  <span>Malo (0)</span><span>Excelente (100)</span>
                </div>
              </div>
              <button type="submit" disabled={loading} style={{ background: loading ? '#E0E0E0' : '#000', color: loading ? '#909090' : '#fff', padding: '14px', fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', border: 'none', cursor: 'pointer', fontFamily: "'Google Sans', sans-serif" }}>
                {loading ? 'Evaluando...' : 'Evaluar solicitud'}
              </button>
            </form>
          </div>
          <div style={S.card}>
            <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: '#C0C0C0', marginBottom: 28, fontFamily: "'Google Sans', sans-serif" }}>02 — Resultado</div>
            {!result && !loading && <div style={{ padding: '80px 0', textAlign: 'center' }}><div style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: '#E0E0E0' }}>Completá el formulario</div></div>}
            {loading && <div style={{ padding: '80px 0', textAlign: 'center' }}><div style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: '#C0C0C0' }}>Procesando...</div></div>}
            {result && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 11, color: '#909090', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 20 }}>{result.company_name}</p>
                  <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="160" height="160" viewBox="0 0 160 160">
                      <circle cx="80" cy="80" r="60" fill="none" stroke="#F0F0F0" strokeWidth="8"/>
                      <circle cx="80" cy="80" r="60" fill="none" stroke={getColor(result.recommendation)} strokeWidth="8" strokeDasharray={`${(result.score / 100) * 376} 376`} strokeLinecap="round" transform="rotate(-90 80 80)"/>
                    </svg>
                    <div style={{ position: 'absolute', textAlign: 'center' }}>
                      <div style={{ fontFamily: "'Google Sans', sans-serif", fontSize: 40, fontWeight: 700, color: '#000', lineHeight: 1 }}>{result.score}</div>
                      <div style={{ fontSize: 11, color: '#909090' }}>/100</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 16 }}>
                    <span style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', border: '1px solid #E0E0E0', padding: '6px 16px', color: getColor(result.recommendation) }}>{getLabel(result.recommendation)}</span>
                  </div>
                  <p style={{ fontSize: 11, color: '#C0C0C0', marginTop: 12 }}>{result.processing_time_ms}ms</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {Object.values(result.breakdown as Record<string, any>).map((item: any) => (
                    <div key={item.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 8 }}>
                        <span style={{ color: '#909090', letterSpacing: 1, textTransform: 'uppercase' }}>{item.label}</span>
                        <span style={{ color: '#000', fontFamily: "'Google Sans', sans-serif", fontWeight: 500 }}>{item.score}/{item.max}</span>
                      </div>
                      <div style={{ width: '100%', background: '#F0F0F0', height: 2 }}>
                        <div style={{ height: 2, background: '#000', width: `${(item.score / item.max) * 100}%`, transition: 'width 1s ease' }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ borderTop: '1px solid #E0E0E0', paddingTop: 24 }}>
                  <Link href="/banco" style={{ display: 'block', textAlign: 'center', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: '#909090', textDecoration: 'none', border: '1px solid #E0E0E0', padding: '12px' }}>Ver en portal banco →</Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
