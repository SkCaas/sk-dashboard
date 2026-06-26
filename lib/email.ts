const RESEND_API_KEY = process.env.RESEND_API_KEY!
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL
const SENDER_EMAIL = process.env.SENDER_EMAIL!
const RESEND_API_URL = process.env.RESEND_API_URL!

interface EmailParams {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailParams) {
  const res = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: SENDER_EMAIL,
      to,
      subject,
      html
    })
  })
  return res.json()
}

export function emailFacturaNueva(data: {
  corporativo_email: string
  proveedor_name: string
  numero_factura: string
  monto: number
  moneda: string
}) {
  return sendEmail({
    to: data.corporativo_email,
    subject: `Nueva factura de ${data.proveedor_name} — ${data.moneda} ${data.monto.toLocaleString()}`,
    html: `
      <div style="font-family: 'Google Sans', sans-serif; max-width: 560px; margin: 0 auto;">
        <div style="background: #000; padding: 32px 40px;">
          <span style="color: #fff; font-size: 13px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase;">SK · Smart Kapital</span>
        </div>
        <div style="padding: 48px 40px; background: #fff;">
          <p style="font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #909090; margin-bottom: 16px;">Nueva factura recibida</p>
          <h1 style="font-size: 24px; font-weight: 700; color: #000; margin-bottom: 8px;">${data.proveedor_name}</h1>
          <p style="font-size: 14px; color: #606060; margin-bottom: 32px;">Ha subido una nueva factura que requiere tu aprobación.</p>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 32px;">
            <tr style="border-bottom: 1px solid #F0F0F0;">
              <td style="padding: 12px 0; font-size: 11px; color: #909090; text-transform: uppercase; letter-spacing: 1px;">Factura</td>
              <td style="padding: 12px 0; font-size: 14px; font-weight: 600; color: #000; text-align: right;">${data.numero_factura}</td>
            </tr>
            <tr style="border-bottom: 1px solid #F0F0F0;">
              <td style="padding: 12px 0; font-size: 11px; color: #909090; text-transform: uppercase; letter-spacing: 1px;">Proveedor</td>
              <td style="padding: 12px 0; font-size: 14px; color: #000; text-align: right;">${data.proveedor_name}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; font-size: 11px; color: #909090; text-transform: uppercase; letter-spacing: 1px;">Monto</td>
              <td style="padding: 12px 0; font-size: 20px; font-weight: 700; color: #000; text-align: right;">${data.moneda} ${data.monto.toLocaleString()}</td>
            </tr>
          </table>
          <a href="${SITE_URL}/facturas" style="display: inline-block; background: #000; color: #fff; padding: 14px 32px; font-size: 11px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; text-decoration: none;">Revisar factura →</a>
        </div>
        <div style="padding: 24px 40px; border-top: 1px solid #E0E0E0;">
          <p style="font-size: 11px; color: #C0C0C0;">© 2026 Smart Kapital · SK Credit Infrastructure · LATAM</p>
        </div>
      </div>
    `
  })
}

export function emailFacturaAprobada(data: {
  proveedor_email: string
  proveedor_name: string
  numero_factura: string
  monto: number
  moneda: string
}) {
  return sendEmail({
    to: data.proveedor_email,
    subject: `Tu factura ${data.numero_factura} fue aprobada`,
    html: `
      <div style="font-family: 'Google Sans', sans-serif; max-width: 560px; margin: 0 auto;">
        <div style="background: #000; padding: 32px 40px;">
          <span style="color: #fff; font-size: 13px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase;">SK · Smart Kapital</span>
        </div>
        <div style="padding: 48px 40px; background: #fff;">
          <p style="font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #909090; margin-bottom: 16px;">Factura aprobada</p>
          <h1 style="font-size: 24px; font-weight: 700; color: #000; margin-bottom: 8px;">Tu factura fue aprobada</h1>
          <p style="font-size: 14px; color: #606060; margin-bottom: 32px;">El corporativo aprobó tu factura. El pago será procesado según los términos acordados.</p>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 32px;">
            <tr style="border-bottom: 1px solid #F0F0F0;">
              <td style="padding: 12px 0; font-size: 11px; color: #909090; text-transform: uppercase; letter-spacing: 1px;">Factura</td>
              <td style="padding: 12px 0; font-size: 14px; font-weight: 600; color: #000; text-align: right;">${data.numero_factura}</td>
            </tr>
            <tr style="border-bottom: 1px solid #F0F0F0;">
              <td style="padding: 12px 0; font-size: 11px; color: #909090; text-transform: uppercase; letter-spacing: 1px;">Monto aprobado</td>
              <td style="padding: 12px 0; font-size: 20px; font-weight: 700; color: #000; text-align: right;">${data.moneda} ${data.monto.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; font-size: 11px; color: #909090; text-transform: uppercase; letter-spacing: 1px;">Estado</td>
              <td style="padding: 12px 0; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #000; text-align: right;">APROBADA</td>
            </tr>
          </table>
          <a href="${SITE_URL}/facturas" style="display: inline-block; background: #000; color: #fff; padding: 14px 32px; font-size: 11px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; text-decoration: none;">Ver mis facturas →</a>
        </div>
        <div style="padding: 24px 40px; border-top: 1px solid #E0E0E0;">
          <p style="font-size: 11px; color: #C0C0C0;">© 2026 Smart Kapital · SK Credit Infrastructure · LATAM</p>
        </div>
      </div>
    `
  })
}

export function emailFacturaRechazada(data: {
  proveedor_email: string
  numero_factura: string
  monto: number
  moneda: string
}) {
  return sendEmail({
    to: data.proveedor_email,
    subject: `Tu factura ${data.numero_factura} fue rechazada`,
    html: `
      <div style="font-family: 'Google Sans', sans-serif; max-width: 560px; margin: 0 auto;">
        <div style="background: #000; padding: 32px 40px;">
          <span style="color: #fff; font-size: 13px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase;">SK · Smart Kapital</span>
        </div>
        <div style="padding: 48px 40px; background: #fff;">
          <p style="font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #909090; margin-bottom: 16px;">Factura rechazada</p>
          <h1 style="font-size: 24px; font-weight: 700; color: #000; margin-bottom: 8px;">Tu factura no fue aprobada</h1>
          <p style="font-size: 14px; color: #606060; margin-bottom: 32px;">El corporativo rechazó tu factura. Podés contactarte con ellos para más información.</p>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 32px;">
            <tr style="border-bottom: 1px solid #F0F0F0;">
              <td style="padding: 12px 0; font-size: 11px; color: #909090; text-transform: uppercase; letter-spacing: 1px;">Factura</td>
              <td style="padding: 12px 0; font-size: 14px; font-weight: 600; color: #000; text-align: right;">${data.numero_factura}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; font-size: 11px; color: #909090; text-transform: uppercase; letter-spacing: 1px;">Monto</td>
              <td style="padding: 12px 0; font-size: 20px; font-weight: 700; color: #000; text-align: right;">${data.moneda} ${data.monto.toLocaleString()}</td>
            </tr>
          </table>
          <a href="${SITE_URL}/facturas" style="display: inline-block; background: #000; color: #fff; padding: 14px 32px; font-size: 11px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; text-decoration: none;">Ver mis facturas →</a>
        </div>
        <div style="padding: 24px 40px; border-top: 1px solid #E0E0E0;">
          <p style="font-size: 11px; color: #C0C0C0;">© 2026 Smart Kapital · SK Credit Infrastructure · LATAM</p>
        </div>
      </div>
    `
  })
}

export function emailCreditoAprobado(data: {
  proveedor_email: string
  total_limit: number
  interest_rate: number
  term_months: number
}) {
  return sendEmail({
    to: data.proveedor_email,
    subject: `Tu línea de crédito SK está activa — USD ${data.total_limit.toLocaleString()}`,
    html: `
      <div style="font-family: 'Google Sans', sans-serif; max-width: 560px; margin: 0 auto;">
        <div style="background: #000; padding: 32px 40px;">
          <span style="color: #fff; font-size: 13px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase;">SK · Smart Kapital</span>
        </div>
        <div style="padding: 48px 40px; background: #fff;">
          <p style="font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #909090; margin-bottom: 16px;">Línea de crédito activa</p>
          <h1 style="font-size: 24px; font-weight: 700; color: #000; margin-bottom: 8px;">Tu crédito está listo</h1>
          <p style="font-size: 14px; color: #606060; margin-bottom: 32px;">El banco aprobó tu solicitud. Tu línea de crédito SK está activa y disponible.</p>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 32px;">
            <tr style="border-bottom: 1px solid #F0F0F0;">
              <td style="padding: 12px 0; font-size: 11px; color: #909090; text-transform: uppercase; letter-spacing: 1px;">Límite aprobado</td>
              <td style="padding: 12px 0; font-size: 20px; font-weight: 700; color: #000; text-align: right;">USD ${data.total_limit.toLocaleString()}</td>
            </tr>
            <tr style="border-bottom: 1px solid #F0F0F0;">
              <td style="padding: 12px 0; font-size: 11px; color: #909090; text-transform: uppercase; letter-spacing: 1px;">Tasa anual</td>
              <td style="padding: 12px 0; font-size: 14px; color: #000; text-align: right;">${data.interest_rate}%</td>
            </tr>
            <tr style="border-bottom: 1px solid #F0F0F0;">
              <td style="padding: 12px 0; font-size: 11px; color: #909090; text-transform: uppercase; letter-spacing: 1px;">Plazo</td>
              <td style="padding: 12px 0; font-size: 14px; color: #000; text-align: right;">${data.term_months} meses</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; font-size: 11px; color: #909090; text-transform: uppercase; letter-spacing: 1px;">Estado</td>
              <td style="padding: 12px 0; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #000; text-align: right;">ACTIVA</td>
            </tr>
          </table>
          <a href="${SITE_URL}/dashboard" style="display: inline-block; background: #000; color: #fff; padding: 14px 32px; font-size: 11px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; text-decoration: none;">Ver mi dashboard →</a>
        </div>
        <div style="padding: 24px 40px; border-top: 1px solid #E0E0E0;">
          <p style="font-size: 11px; color: #C0C0C0;">© 2026 Smart Kapital · SK Credit Infrastructure · LATAM</p>
        </div>
      </div>
    `
  })
}
