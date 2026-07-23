'use client'
import Logo from '../../components/Logo';
import Link from 'next/link'
import { useOrganization, useClerk, OrganizationSwitcher } from "@clerk/nextjs";
import { useQuery } from "convex/react";

export default function DashboardPage() {
  const { organization, isLoaded } = useOrganization();
  const { signOut } = useClerk();
  
  const company = useQuery("companies:getByClerkOrgId" as any, organization ? { clerkOrgId: organization.id } : "skip");
  const invoices = useQuery("invoices:getByCompanyId" as any, company ? { company_id: company._id } : "skip") || [];

  async function handleLogout() {
    await signOut();
    window.location.href = window.location.origin + '/login'
  }

  if (!isLoaded || (organization && company === undefined)) return (
    <div style={{ minHeight: '100vh', background: '#F5F5F3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Lexend Deca', sans-serif" }}>
      <p style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: '#909090' }}>Loading...</p>
    </div>
  )

  const isCorporate = company?.type === 'CORPORATE'
  const isBank = company?.type === 'BANK'
  
  const totalAmount = invoices.reduce((sum: any, i: any) => sum + (Number(i.amount) || 0), 0)
  const pendingCount = invoices.filter((i: any) => i.status === 'PENDING').length
  const approvedCount = invoices.filter((i: any) => i.status === 'APPROVED').length

  const stats = isBank ? [
    { val: invoices.length.toString(), lbl: 'Total Applications' },
    { val: pendingCount.toString(), lbl: 'Pending' },
    { val: approvedCount.toString(), lbl: 'Approved' },
    { val: `$${(totalAmount/1000).toFixed(0)}K`, lbl: 'Volume' },
  ] : isCorporate ? [
    { val: pendingCount.toString(), lbl: 'Pending Invoices' },
    { val: approvedCount.toString(), lbl: 'Approved' },
    { val: `$${(totalAmount/1000).toFixed(0)}K`, lbl: 'Total Amount' },
    { val: invoices.length.toString(), lbl: 'Total Invoices' },
  ] : [
    { val: invoices.length.toString(), lbl: 'Uploaded Invoices' },
    { val: pendingCount.toString(), lbl: 'Pending' },
    { val: approvedCount.toString(), lbl: 'Approved' },
    { val: `$${(totalAmount/1000).toFixed(0)}K`, lbl: 'Total Amount' },
  ]

  const modules = isBank ? [
    { num: '01', title: 'Decision Portal', desc: 'Review and approve credit applications with full scoring.', href: '/banco' },
    { num: '02', title: 'Scoring Engine', desc: 'Evaluate new credit applications in real-time.', href: '/scoring' },
  ] : isCorporate ? [
    { num: '01', title: 'Invoices', desc: 'Review and approve your suppliers invoices.', href: '/invoices' },
    { num: '02', title: 'Scoring Engine', desc: 'Evaluate credit applications from your network.', href: '/scoring' },
  ] : [
    { num: '01', title: 'Upload Invoice', desc: 'Upload a new invoice for factoring. AI extracts the data.', href: '/invoices/nueva' },
    { num: '02', title: 'My Invoices', desc: 'Track the status of all your applications.', href: '/invoices' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F3', fontFamily: "'Google Sans', sans-serif", color: '#000' }}>
      
      <header style={{ borderBottom: '1px solid #E0E0E0', background: '#fff', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 40px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href={process.env.NEXT_PUBLIC_LANDING_URL || "/"} style={{ textDecoration: 'none' }}>
            <Logo />
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <OrganizationSwitcher hidePersonal={true} />
            <button onClick={handleLogout} style={{ fontSize: 11, color: '#909090', letterSpacing: 1.5, textTransform: 'uppercase', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Google Sans', sans-serif" }}>Logout</button>
          </div>
        </div>
      </header>
      
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 40px' }}>
        <div style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: '#909090', marginBottom: 12 }}>Dashboard</div>
        <h1 style={{ fontFamily: "'Google Sans', sans-serif", fontSize: 32, fontWeight: 700, letterSpacing: -1, marginBottom: 48 }}>
          {isBank ? 'Bank Portal' : isCorporate ? 'Corporate Panel' : 'Supplier Panel'}
        </h1>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: '#E0E0E0', border: '1px solid #E0E0E0', marginBottom: 48 }}>
          {stats.map(s => (
            <div key={s.lbl} style={{ padding: '32px 28px', background: '#fff' }}>
              <div style={{ fontFamily: "'Google Sans', sans-serif", fontSize: 32, fontWeight: 700, letterSpacing: -1, marginBottom: 6 }}>{s.val}</div>
              <div style={{ fontSize: 11, color: '#909090', letterSpacing: 1, textTransform: 'uppercase' }}>{s.lbl}</div>
            </div>
          ))}
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: '#E0E0E0', border: '1px solid #E0E0E0', marginBottom: 48 }}>
          {modules.map(m => (
            <Link key={m.num} href={m.href} style={{ padding: '40px 36px', background: '#fff', textDecoration: 'none', color: '#000', display: 'block' }}>
              <div style={{ fontSize: 11, color: '#C0C0C0', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16, fontFamily: "'Google Sans', sans-serif" }}>{m.num} —</div>
              <div style={{ fontFamily: "'Google Sans', sans-serif", fontSize: 20, fontWeight: 700, letterSpacing: -0.5, marginBottom: 8 }}>{m.title}</div>
              <div style={{ fontSize: 13, color: '#909090', lineHeight: 1.7 }}>{m.desc}</div>
              <div style={{ marginTop: 24, fontSize: 11, color: '#C0C0C0', letterSpacing: 1.5, textTransform: 'uppercase' }}>Open →</div>
            </Link>
          ))}
        </div>
        
        <div style={{ background: '#fff', border: '1px solid #E0E0E0' }}>
          <div style={{ padding: '24px 32px', borderBottom: '1px solid #E0E0E0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: '#909090' }}>Recent Activity</span>
            <Link href="/invoices" style={{ fontSize: 11, color: '#909090', letterSpacing: 1.5, textTransform: 'uppercase', textDecoration: 'none' }}>View All →</Link>
          </div>
          {invoices.length === 0 ? (
            <div style={{ padding: '60px 32px', textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: '#C0C0C0' }}>No activity yet.</p>
              {!isBank && !isCorporate && (
                <Link href="/invoices/nueva" style={{ display: 'inline-block', marginTop: 16, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: '#000', border: '1px solid #000', padding: '10px 24px', textDecoration: 'none' }}>Upload First Invoice</Link>
              )}
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E0E0E0' }}>
                  {['Invoice', 'Issuer', 'Amount', 'Status'].map(h => (
                    <th key={h} style={{ fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: '#C0C0C0', textAlign: 'left', padding: '12px 32px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoices.slice(0,5).map((inv: any) => (
                  <tr key={inv._id} style={{ borderBottom: '1px solid #F5F5F3' }}>
                    <td style={{ padding: '16px 32px', fontSize: 14, fontFamily: "'Google Sans', sans-serif", fontWeight: 700 }}>{inv.invoice_number}</td>
                    <td style={{ padding: '16px 32px', fontSize: 13, color: '#606060' }}>{inv.issuer}</td>
                    <td style={{ padding: '16px 32px', fontSize: 13, fontFamily: "'Google Sans', sans-serif" }}>{inv.currency} {Number(inv.amount).toLocaleString()}</td>
                    <td style={{ padding: '16px 32px' }}>
                      <span style={{ fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: inv.status === 'PENDING' ? '#909090' : inv.status === 'APPROVED' ? '#000' : '#C0C0C0', border: '1px solid #E0E0E0', padding: '3px 8px' }}>{inv.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  )
}
