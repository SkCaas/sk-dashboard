'use client'
import Logo from '../../components/Logo';
import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const endpoints = [
  {
    id: 'scoring',
    method: 'POST',
    path: '/api/scoring/evaluate',
    title: 'Evaluate credit application',
    description: "Evaluates a credit application in real time using SK's proprietary scoring engine. Returns a score from 0-100, a recommendation, and a full breakdown by variable.",
    requestExample: `{
  "application_id": "8f3a2b1c-4d5e-6f7a-8b9c-0d1e2f3a4b5c"
}`,
    responseExample: `{
  "score": 78,
  "recommendation": "APPROVE",
  "breakdown": {
    "revenue": { "score": 32, "max": 40 },
    "debt": { "score": 20, "max": 25 },
    "payment": { "score": 20, "max": 25 },
    "seniority": { "score": 6, "max": 10 }
  },
  "processing_time_ms": 124
}`,
    tryIt: async () => {
      const start = Date.now()
      const { data: apps } = await supabase.from('credit_applications').select('id').limit(1).single()
      if (!apps) return { error: 'No applications found. Create one in /scoring first.' }
      const res = await fetch('/api/scoring/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ application_id: apps.id })
      })
      const data = await res.json()
      return { ...data, _time: Date.now() - start }
    }
  },
  {
    id: 'status',
    method: 'GET',
    path: '/api/applications/:id/status',
    title: 'Get application status',
    description: 'Returns the current status of a credit application, including scoring results and bank decision if available.',
    requestExample: `GET /api/applications/8f3a2b1c.../status`,
    responseExample: `{
  "id": "8f3a2b1c-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
  "company_name": "Grupo Industrial Monterrey",
  "status": "SCORED",
  "score": 78,
  "recommendation": "APPROVE",
  "decision": null,
  "created_at": "2026-04-14T10:00:00Z"
}`,
    tryIt: async () => {
      const start = Date.now()
      const { data: apps } = await supabase
        .from('credit_applications')
        .select('*, scoring_results(*), bank_decisions(*)')
        .limit(1)
        .single()
      if (!apps) return { error: 'No applications found.' }
      return {
        id: apps.id,
        company_name: apps.company_name,
        status: apps.status,
        score: apps.scoring_results?.[0]?.total_score || null,
        recommendation: apps.scoring_results?.[0]?.recommendation || null,
        decision: apps.bank_decisions?.[0]?.decision || null,
        created_at: apps.created_at,
        _time: Date.now() - start
      }
    }
  },
  {
    id: 'submit',
    method: 'POST',
    path: '/api/applications/submit',
    title: 'Submit credit application',
    description: 'Submits a new credit application to the SK platform. The application is immediately queued for scoring.',
    requestExample: `{
  "company_name": "Textiles del Pacifico S.A.",
  "tax_id": "TPA850312XY1",
  "annual_revenue": 3500000,
  "requested_amount": 400000,
  "existing_debt": 80000,
  "years_in_business": 8,
  "payment_history_score": 85
}`,
    responseExample: `{
  "application_id": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
  "status": "PENDING",
  "created_at": "2026-04-14T10:00:00Z",
  "next_step": "POST /api/scoring/evaluate"
}`,
    tryIt: async () => {
      const start = Date.now()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { error: 'Not authenticated. Please sign in first.' }
      const { data, error } = await supabase.from('credit_applications').insert({
        company_name: 'Textiles del Pacifico S.A.',
        tax_id: 'TPA850312XY1',
        annual_revenue: 3500000,
        requested_amount: 400000,
        existing_debt: 80000,
        years_in_business: 8,
        payment_history_score: 85,
        applicant_id: user.id
      }).select().single()
      if (error) return { error: error.message }
      return {
        application_id: data.id,
        status: data.status,
        created_at: data.created_at,
        next_step: 'POST /api/scoring/evaluate',
        _time: Date.now() - start
      }
    }
  },
  {
    id: 'approve',
    method: 'POST',
    path: '/api/decisions/:id/approve',
    title: 'Approve credit application',
    description: 'Bank approves a scored credit application, setting the approved amount, interest rate, and term. Creates an active credit line for the applicant.',
    requestExample: `{
  "application_id": "8f3a2b1c-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
  "approved_amount": 380000,
  "interest_rate": 12.5,
  "term_months": 12,
  "notes": "Strong revenue-to-debt ratio. Approved."
}`,
    responseExample: `{
  "decision": "APPROVED",
  "approved_amount": 380000,
  "interest_rate": 12.5,
  "term_months": 12,
  "credit_line_id": "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
  "decided_at": "2026-04-14T10:05:00Z"
}`,
    tryIt: async () => {
      const start = Date.now()
      const { data: apps } = await supabase
        .from('credit_applications')
        .select('id, requested_amount, applicant_id')
        .eq('status', 'SCORED')
        .limit(1)
        .single()
      if (!apps) return { error: 'No scored applications found. Run scoring/evaluate first.' }
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase.from('bank_decisions').insert({
        application_id: apps.id,
        bank_user_id: user?.id,
        decision: 'APPROVED',
        approved_amount: apps.requested_amount * 0.95,
        interest_rate: 12.5,
        term_months: 12,
        notes: 'API sandbox approval'
      }).select().single()
      if (error) return { error: error.message }
      return {
        decision: 'APPROVED',
        approved_amount: apps.requested_amount * 0.95,
        interest_rate: 12.5,
        term_months: 12,
        decided_at: data.decided_at,
        _time: Date.now() - start
      }
    }
  },
  {
    id: 'creditline',
    method: 'GET',
    path: '/api/companies/:id/credit-line',
    title: 'Get credit line',
    description: 'Returns the active credit line for a company, including total limit, available balance, and utilization rate.',
    requestExample: `GET /api/companies/corp_mx_28471/credit-line`,
    responseExample: `{
  "credit_line_id": "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
  "company_name": "Grupo Industrial Monterrey",
  "total_limit": 380000,
  "available_limit": 380000,
  "used_amount": 0,
  "utilization_rate": "0%",
  "interest_rate": 12.5,
  "term_months": 12,
  "status": "ACTIVE"
}`,
    tryIt: async () => {
      const start = Date.now()
      const { data, error } = await supabase
        .from('credit_lines')
        .select('*, credit_applications(company_name)')
        .eq('status', 'ACTIVE')
        .limit(1)
        .single()
      if (error || !data) return { error: 'No active credit lines found. Approve an application first.' }
      return {
        credit_line_id: data.id,
        company_name: (data as any).credit_applications?.company_name,
        total_limit: data.total_limit,
        available_limit: data.available_limit,
        used_amount: data.used_amount,
        utilization_rate: `${((data.used_amount / data.total_limit) * 100).toFixed(1)}%`,
        interest_rate: data.interest_rate,
        term_months: data.term_months,
        status: data.status,
        _time: Date.now() - start
      }
    }
  }
]

export default function DocsPage() {
  const [active, setActive] = useState('scoring')
  const [response, setResponse] = useState<any>(null)
  const [running, setRunning] = useState(false)

  const endpoint = endpoints.find(e => e.id === active)!

  async function handleTryIt() {
    setRunning(true)
    setResponse(null)
    const result = await endpoint.tryIt()
    setResponse(result)
    setRunning(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: "'Google Sans', sans-serif", color: '#000', display: 'flex', flexDirection: 'column' }}>
      

      <header style={{ borderBottom: '1px solid #E0E0E0', background: '#fff', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 40px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href={process.env.NEXT_PUBLIC_LANDING_URL || "/"} style={{ textDecoration: 'none' }}>
            <Logo text="API Reference" />
          </Link>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <span style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: '#909090', border: '1px solid #E0E0E0', padding: '4px 10px' }}>v1.0 · Sandbox</span>
            <Link href="/dashboard" style={{ fontSize: 11, color: '#909090', textDecoration: 'none', letterSpacing: 1.5, textTransform: 'uppercase' }}>Dashboard</Link>
          </div>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1 }}>
        <aside style={{ width: 280, background: '#000', padding: '40px 0', position: 'sticky', top: 64, height: 'calc(100vh - 64px)', overflowY: 'auto', flexShrink: 0 }}>
          <div style={{ padding: '0 28px', marginBottom: 32 }}>
            <p style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: '#404040', marginBottom: 4 }}>Endpoints</p>
            <p style={{ fontSize: 12, color: '#272727' }}>5 available · Sandbox</p>
          </div>
          {endpoints.map(ep => (
            <button key={ep.id} onClick={() => { setActive(ep.id); setResponse(null) }}
              style={{ width: '100%', padding: '16px 28px', background: active === ep.id ? '#1A1A1A' : 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', borderLeft: active === ep.id ? '2px solid #fff' : '2px solid transparent', transition: 'all 0.15s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 10, letterSpacing: 1, fontFamily: "'Google Sans', sans-serif", color: active === ep.id ? '#fff' : '#404040', fontWeight: 600 }}>{ep.method}</span>
              </div>
              <p style={{ fontSize: 12, color: active === ep.id ? '#fff' : '#606060', fontFamily: "'Google Sans', sans-serif" }}>{ep.path.replace('/:id', '/{id}')}</p>
            </button>
          ))}
          <div style={{ padding: '32px 28px 0', borderTop: '1px solid #1A1A1A', marginTop: 32 }}>
            <Link href="/scoring" style={{ fontSize: 11, color: '#404040', textDecoration: 'none', letterSpacing: 1.5, textTransform: 'uppercase', display: 'block', marginBottom: 12 }}>Scoring Engine</Link>
            <Link href="/banco" style={{ fontSize: 11, color: '#404040', textDecoration: 'none', letterSpacing: 1.5, textTransform: 'uppercase', display: 'block' }}>Decision Engine</Link>
          </div>
        </aside>

        <main style={{ flex: 1, padding: '60px 64px', maxWidth: 900 }}>
          <div style={{ marginBottom: 48 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <span style={{ fontSize: 11, letterSpacing: 2, fontFamily: "'Google Sans', sans-serif", fontWeight: 700, border: '1px solid #000', padding: '4px 10px' }}>{endpoint.method}</span>
              <code style={{ fontSize: 16, fontFamily: "'Google Sans', sans-serif", color: '#000' }}>{endpoint.path}</code>
              <span style={{ fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', background: '#000', color: '#fff', padding: '3px 8px' }}>LIVE</span>
            </div>
            <h1 style={{ fontFamily: "'Google Sans', sans-serif", fontSize: 28, fontWeight: 700, letterSpacing: -1, marginBottom: 16 }}>{endpoint.title}</h1>
            <p style={{ fontSize: 15, color: '#606060', lineHeight: 1.8, maxWidth: 600 }}>{endpoint.description}</p>
          </div>

          <div style={{ marginBottom: 40 }}>
            <p style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: '#909090', marginBottom: 16 }}>Request</p>
            <div style={{ background: '#0D0D0D', padding: 24 }}>
              <pre style={{ fontFamily: "'Google Sans', sans-serif", fontSize: 13, color: '#B8B8B8', lineHeight: 1.8, margin: 0, whiteSpace: 'pre-wrap' }}>{endpoint.requestExample}</pre>
            </div>
          </div>

          <div style={{ marginBottom: 40 }}>
            <p style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: '#909090', marginBottom: 16 }}>Response example</p>
            <div style={{ background: '#0D0D0D', padding: 24 }}>
              <pre style={{ fontFamily: "'Google Sans', sans-serif", fontSize: 13, color: '#B8B8B8', lineHeight: 1.8, margin: 0, whiteSpace: 'pre-wrap' }}>{endpoint.responseExample}</pre>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #E0E0E0', paddingTop: 40 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <p style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: '#909090' }}>Try it — Sandbox</p>
              {response?._time && <span style={{ fontSize: 11, color: '#C0C0C0', fontFamily: "'Google Sans', sans-serif" }}>{response._time}ms</span>}
            </div>

            <button onClick={handleTryIt} disabled={running}
              style={{ background: running ? '#E0E0E0' : '#000', color: running ? '#909090' : '#fff', padding: '12px 32px', fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', border: 'none', cursor: running ? 'not-allowed' : 'pointer', fontFamily: "'Google Sans', sans-serif", marginBottom: 24 }}>
              {running ? 'Running...' : `Run ${endpoint.method} request`}
            </button>

            {response && (
              <div style={{ background: '#0D0D0D', padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <span style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: response.error ? '#CC0000' : '#10b981' }}>
                    {response.error ? 'ERROR' : '200 OK'}
                  </span>
                  {response._time && <span style={{ fontSize: 11, color: '#404040', fontFamily: "'Google Sans', sans-serif" }}>{response._time}ms</span>}
                </div>
                <pre style={{ fontFamily: "'Google Sans', sans-serif", fontSize: 13, color: response.error ? '#FF6666' : '#B8B8B8', lineHeight: 1.8, margin: 0, whiteSpace: 'pre-wrap' }}>
                  {JSON.stringify(response.error ? { error: response.error } : (({ _time, ...rest }) => rest)(response), null, 2)}
                </pre>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
