'use client'
import Logo from '../../components/Logo';
import { useEffect, useState } from 'react'
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

export default function BancoPage() {
  const [applications, setApplications] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [decision, setDecision] = useState({ approved_amount: '', interest_rate: '', term_months: '', notes: '' })
  const [submitting, setSubmitting] = useState(false)
  const [stats, setStats] = useState({ total: 0, approved: 0, rejected: 0, pending: 0, volume: 0 })

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data: apps } = await supabase.from('credit_applications').select('*, scoring_results(*), bank_decisions(*)').order('created_at', { ascending: false })
    const list = apps || []
    setApplications(list)
    const approved = list.filter((a: any) => a.bank_decisions?.length > 0 && a.bank_decisions[0].decision === 'APPROVED')
    const rejected = list.filter((a: any) => a.bank_decisions?.length > 0 && a.bank_decisions[0].decision === 'REJECTED')
    const pending = list.filter((a: any) => !a.bank_decisions?.length)
    const volume = approved.reduce((sum: number, a: any) => sum + (a.bank_decisions[0].approved_amount || 0), 0)
    setStats({ total: list.length, approved: approved.length, rejected: rejected.length, pending: pending.length, volume })
    setLoading(false)
  }

  async function handleDecision(dec: string) {
    if (!selected) return
    setSubmitting(true)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('bank_decisions').insert({
      application_id: selected.id, bank_user_id: user?.id, decision: dec,
      approved_amount: dec === 'APPROVED' ? Number(decision.approved_amount) || selected.requested_amount : null,
      interest_rate: Number(decision.interest_rate) || null,
      term_months: Number(decision.term_months) || null,
      notes: decision.notes || null
    })
    if (dec === 'APPROVED') {
      await supabase.from('credit_lines').insert({
        company_id: selected.applicant_id, application_id: selected.id,
        total_limit: Number(decision.approved_amount) || selected.requested_amount,
        available_limit: Number(decision.approved_amount) || selected.requested_amount,
        interest_rate: Number(decision.interest_rate) || null,
        term_months: Number(decision.term_months) || null
      })
    }
    await supabase.from('credit_applications').update({ status: dec === 'APPROVED' ? 'APPROVED' : 'REJECTED' }).eq('id', selected.id)
    setSelected(null)
    setDecision({ approved_amount: '', interest_rate: '', term_months: '', notes: '' })
    await loadData()
    setSubmitting(false)
  }

  const getStatusBadge = (app: any) => {
    if (!app.bank_decisions?.length) return { label: 'PENDIENTE', color: '#909090' }
    const dec = app.bank_decisions[0].decision
    if (dec === 'APPROVED') return { label: 'APROBADO', color: '#000' }
    if (dec === 'REJECTED') return { label: 'RECHAZADO', color: '#C0C0C0' }
    return { label: 'MAS INFO', color: '#606060' }
  }

  if (loading) return (
    <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: '#909090' }}>Cargando...</p>
    </div>
  )

  return (
    <div style={S.page}>
      
      <header style={S.header}>
        <div style={S.headerInner}>
          <Link href={process.env.NEXT_PUBLIC_LANDING_URL || "/"} style={{ textDecoration: 'none' }}>
            <Logo />
          </Link>
          <div style={{ display: 'flex', gap: 24 }}>
            <Link href="/scoring" style={{ fontSize: 11, color: '#909090', textDecoration: 'none', letterSpacing: 1.5, textTransform: 'uppercase' }}>Scoring</Link>
            <Link href="/dashboard" style={{ fontSize: 11, color: '#909090', textDecoration: 'none', letterSpacing: 1.5, textTransform: 'uppercase' }}>Dashboard</Link>
          </div>
        </div>
      </header>
      <main style={S.main}>
        <div style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: '#909090', marginBottom: 12 }}>Sprint 2 — Decision Engine</div>
        <h1 style={{ fontFamily: "'Google Sans', sans-serif", fontSize: 32, fontWeight: 700, letterSpacing: -1, marginBottom: 8 }}>Portal de decisiones</h1>
        <p style={{ fontSize: 14, color: '#909090', marginBottom: 48 }}>Revisá solicitudes, analizá el score y tomá decisiones de credito</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 1, background: '#E0E0E0', border: '1px solid #E0E0E0', marginBottom: 48 }}>
          {[
            { val: stats.total, lbl: 'Total' },
            { val: stats.pending, lbl: 'Pendientes' },
            { val: stats.approved, lbl: 'Aprobadas' },
            { val: stats.rejected, lbl: 'Rechazadas' },
            { val: `$${(stats.volume/1000).toFixed(0)}K`, lbl: 'Volumen' },
          ].map(s => (
            <div key={s.lbl} style={{ padding: '28px 24px', background: '#fff' }}>
              <div style={{ fontFamily: "'Google Sans', sans-serif", fontSize: 28, fontWeight: 700, letterSpacing: -1, marginBottom: 6 }}>{s.val}</div>
              <div style={{ fontSize: 11, color: '#909090', letterSpacing: 1, textTransform: 'uppercase' }}>{s.lbl}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: '#E0E0E0', border: '1px solid #E0E0E0' }}>
          <div style={S.card}>
            <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: '#C0C0C0', marginBottom: 24, fontFamily: "'Google Sans', sans-serif" }}>01 — Pipeline</div>
            {applications.length === 0 ? (
              <div style={{ padding: '40px 0', textAlign: 'center' }}>
                <p style={{ fontSize: 13, color: '#C0C0C0' }}>Sin solicitudes aun</p>
                <Link href="/scoring" style={{ display: 'inline-block', marginTop: 16, fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: '#000', textDecoration: 'none', border: '1px solid #000', padding: '10px 20px' }}>Crear solicitud</Link>
              </div>
            ) : (
              <div>
                {applications.map(app => {
                  const score = app.scoring_results?.[0]?.total_score
                  const badge = getStatusBadge(app)
                  const isSelected = selected?.id === app.id
                  const isPending = !app.bank_decisions?.length
                  return (
                    <div key={app.id} onClick={() => isPending && setSelected(isSelected ? null : app)}
                      style={{ padding: '20px 0', borderBottom: '1px solid #F5F5F3', cursor: isPending ? 'pointer' : 'default', opacity: isPending ? 1 : 0.4, background: isSelected ? '#F5F5F3' : 'transparent', paddingLeft: isSelected ? 16 : 0, paddingRight: isSelected ? 16 : 0, transition: 'all 0.15s' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <p style={{ fontFamily: "'Google Sans', sans-serif", fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{app.company_name}</p>
                          <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#909090' }}>
                            <span>{app.tax_id || 'Sin RFC'}</span>
                            <span>${Number(app.requested_amount).toLocaleString()}</span>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          {score !== undefined && <div style={{ fontFamily: "'Google Sans', sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{score}</div>}
                          <span style={{ fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: badge.color, border: '1px solid #E0E0E0', padding: '2px 8px' }}>{badge.label}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
          <div style={S.card}>
            <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: '#C0C0C0', marginBottom: 24, fontFamily: "'Google Sans', sans-serif" }}>02 — Decision</div>
            {!selected ? (
              <div style={{ padding: '80px 0', textAlign: 'center' }}>
                <div style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: '#E0E0E0' }}>Selecciona una solicitud</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div>
                  <h3 style={{ fontFamily: "'Google Sans', sans-serif", fontSize: 20, fontWeight: 700, letterSpacing: -0.5, marginBottom: 4 }}>{selected.company_name}</h3>
                  <p style={{ fontSize: 12, color: '#909090' }}>{selected.tax_id} · ${Number(selected.requested_amount).toLocaleString()} solicitados</p>
                </div>
                {selected.scoring_results?.[0] && (
                  <div style={{ border: '1px solid #E0E0E0', padding: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                      <span style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: '#909090' }}>Score crediticio</span>
                      <span style={{ fontFamily: "'Google Sans', sans-serif", fontSize: 28, fontWeight: 700 }}>{selected.scoring_results[0].total_score}/100</span>
                    </div>
                    {[
                      { label: 'Ingresos vs monto', score: selected.scoring_results[0].revenue_score, max: 40 },
                      { label: 'Ratio deuda', score: selected.scoring_results[0].debt_ratio_score, max: 25 },
                      { label: 'Historial pagos', score: selected.scoring_results[0].payment_history_score, max: 25 },
                      { label: 'Anos operacion', score: selected.scoring_results[0].seniority_score, max: 10 },
                    ].map(item => (
                      <div key={item.label} style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 6 }}>
                          <span style={{ color: '#909090', textTransform: 'uppercase', letterSpacing: 1 }}>{item.label}</span>
                          <span style={{ fontFamily: "'Google Sans', sans-serif" }}>{item.score}/{item.max}</span>
                        </div>
                        <div style={{ width: '100%', background: '#F0F0F0', height: 2 }}>
                          <div style={{ height: 2, background: '#000', width: `${(item.score / item.max) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div><label style={S.label}>Monto aprobado (USD)</label><input type="number" value={decision.approved_amount} onChange={e => setDecision(d => ({ ...d, approved_amount: e.target.value }))} placeholder={selected.requested_amount} style={S.input} /></div>
                    <div><label style={S.label}>Tasa anual (%)</label><input type="number" value={decision.interest_rate} onChange={e => setDecision(d => ({ ...d, interest_rate: e.target.value }))} placeholder="12.5" style={S.input} /></div>
                  </div>
                  <div><label style={S.label}>Plazo (meses)</label><input type="number" value={decision.term_months} onChange={e => setDecision(d => ({ ...d, term_months: e.target.value }))} placeholder="12" style={S.input} /></div>
                  <div><label style={S.label}>Notas internas</label><textarea value={decision.notes} onChange={e => setDecision(d => ({ ...d, notes: e.target.value }))} placeholder="Observaciones..." rows={3} style={{ ...S.input, resize: 'none' }} /></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <button onClick={() => handleDecision('APPROVED')} disabled={submitting}
                    style={{ background: '#000', color: '#fff', padding: '14px', fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', border: 'none', cursor: 'pointer', fontFamily: "'Google Sans', sans-serif" }}>
                    Aprobar
                  </button>
                  <button onClick={() => handleDecision('REJECTED')} disabled={submitting}
                    style={{ background: '#fff', color: '#909090', padding: '14px', fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', border: '1px solid #E0E0E0', cursor: 'pointer', fontFamily: "'Google Sans', sans-serif" }}>
                    Rechazar
                  </button>
                </div>
                <button onClick={() => handleDecision('MORE_INFO')} disabled={submitting}
                  style={{ background: '#fff', color: '#C0C0C0', padding: '12px', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', border: '1px solid #E0E0E0', cursor: 'pointer', fontFamily: "'Google Sans', sans-serif" }}>
                  Solicitar mas informacion
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
