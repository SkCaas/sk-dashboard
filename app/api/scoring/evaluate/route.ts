import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  const start = Date.now()
  const body = await request.json()
  const { application_id } = body

  const { data: app, error } = await supabase
    .from('credit_applications')
    .select('*')
    .eq('id', application_id)
    .single()

  if (error || !app) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 })
  }

  const revenueRatio = app.annual_revenue / app.requested_amount
  const revenueScore = Math.min(40, Math.round(
    revenueRatio >= 10 ? 40 :
    revenueRatio >= 5  ? 32 :
    revenueRatio >= 3  ? 24 :
    revenueRatio >= 2  ? 16 : 8
  ))

  const debtRatio = app.existing_debt / app.annual_revenue
  const debtScore = Math.min(25, Math.round(
    debtRatio <= 0.1 ? 25 :
    debtRatio <= 0.2 ? 20 :
    debtRatio <= 0.3 ? 15 :
    debtRatio <= 0.5 ? 10 : 5
  ))

  const paymentScore = Math.min(25, Math.round((app.payment_history_score / 100) * 25))

  const seniorityScore = Math.min(10, Math.round(
    app.years_in_business >= 10 ? 10 :
    app.years_in_business >= 5  ? 8  :
    app.years_in_business >= 3  ? 6  :
    app.years_in_business >= 1  ? 4  : 2
  ))

  const totalScore = revenueScore + debtScore + paymentScore + seniorityScore
  const recommendation = totalScore >= 70 ? 'APPROVE' : totalScore >= 45 ? 'REVIEW' : 'REJECT'
  const processingTime = Date.now() - start

  const { data: result } = await supabase
    .from('scoring_results')
    .insert({
      application_id,
      total_score: totalScore,
      revenue_score: revenueScore,
      debt_ratio_score: debtScore,
      payment_history_score: paymentScore,
      seniority_score: seniorityScore,
      recommendation,
      processing_time_ms: processingTime
    })
    .select()
    .single()

  await supabase
    .from('credit_applications')
    .update({ status: 'SCORED' })
    .eq('id', application_id)

  return NextResponse.json({
    score: totalScore,
    recommendation,
    breakdown: {
      revenue: { score: revenueScore, max: 40, label: 'Ingresos vs monto' },
      debt: { score: debtScore, max: 25, label: 'Ratio deuda/ingresos' },
      payment: { score: paymentScore, max: 25, label: 'Historial de pagos' },
      seniority: { score: seniorityScore, max: 10, label: 'Años en operación' }
    },
    processing_time_ms: processingTime,
    result_id: result?.id
  })
}
