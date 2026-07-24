'use client'
import Logo from '../../components/Logo';
import { useOrganization } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import Link from 'next/link'

export default function InvoicesPage() {
  const { organization, isLoaded } = useOrganization();
  const company = useQuery("companies:getByClerkOrgId" as any, organization ? { clerkOrgId: organization.id } : "skip");
  
  const allInvoices = useQuery("invoices:getAll" as any) || [];
  const updateStatus = useMutation("invoices:updateStatus" as any);

  async function changeStatus(id: string, status: string) {
    await updateStatus({ id, status });
  }

  if (!isLoaded || (organization && company === undefined)) return (
    <div style={{ minHeight: '100vh', background: '#F5F5F3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Google Sans', sans-serif" }}>
      <p style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: '#909090' }}>Loading...</p>
    </div>
  )

  const isCorporate = company?.type === 'CORPORATE';

  // If not corporate, only see their own invoices.
  const myInvoices = isCorporate ? allInvoices : allInvoices.filter((f: any) => f.company_id === company?._id);

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F3', fontFamily: "'Google Sans', sans-serif", color: '#000' }}>
      
      <header style={{ borderBottom: '1px solid #E0E0E0', background: '#fff', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 40px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href={process.env.NEXT_PUBLIC_LANDING_URL || "/"} style={{ textDecoration: 'none' }}>
            <Logo />
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <Link href="/dashboard" style={{ fontSize: 11, color: '#909090', textDecoration: 'none', letterSpacing: 1.5, textTransform: 'uppercase' }}>Dashboard</Link>
            {!isCorporate && (
              <Link href="/invoices/nueva" style={{ background: '#000', color: '#fff', padding: '8px 20px', fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', textDecoration: 'none' }}>+ New Invoice</Link>
            )}
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 40px' }}>
        <div style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: '#909090', marginBottom: 12 }}>
          {isCorporate ? 'Invoices to approve' : 'My Invoices'}
        </div>
        <h1 style={{ fontFamily: "'Google Sans', sans-serif", fontSize: 32, fontWeight: 700, letterSpacing: -1, marginBottom: 48 }}>
          {isCorporate ? 'Invoice Pipeline' : 'My Invoices'}
        </h1>

        {myInvoices.length === 0 ? (
          <div style={{ background: '#fff', border: '1px solid #E0E0E0', padding: '80px 40px', textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: '#C0C0C0', marginBottom: 24 }}>No invoices yet</p>
            {!isCorporate && (
              <Link href="/invoices/nueva" style={{ display: 'inline-block', background: '#000', color: '#fff', padding: '12px 32px', fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', textDecoration: 'none' }}>
                Upload First Invoice
              </Link>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: '#E0E0E0', border: '1px solid #E0E0E0' }}>
            {myInvoices.map((f: any) => (
              <div key={f._id} style={{ background: '#fff', padding: '28px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
                    <p style={{ fontFamily: "'Google Sans', sans-serif", fontSize: 16, fontWeight: 700, letterSpacing: -0.5 }}>{f.invoice_number}</p>
                    <span style={{ fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', border: '1px solid #E0E0E0', padding: '3px 8px', color: f.status === 'PENDING' ? '#909090' : f.status === 'APPROVED' ? '#000' : '#C0C0C0' }}>
                      {f.status}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 32, fontSize: 13, color: '#909090' }}>
                    <span>{f.issuer}</span>
                    <span>→ {f.receiver || 'Company'}</span>
                    <span style={{ fontFamily: "'Google Sans', sans-serif", color: '#000', fontWeight: 500 }}>{f.currency} {Number(f.amount).toLocaleString()}</span>
                    <span>{f.issue_date || 'No Date'}</span>
                  </div>
                </div>
                {isCorporate && f.status === 'PENDING' && (
                  <div style={{ display: 'flex', gap: 8, marginLeft: 32 }}>
                    <button onClick={() => changeStatus(f._id, 'APPROVED')}
                      style={{ background: '#000', color: '#fff', padding: '10px 20px', fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', border: 'none', cursor: 'pointer', fontFamily: "'Google Sans', sans-serif" }}>
                      Approve
                    </button>
                    <button onClick={() => changeStatus(f._id, 'REJECTED')}
                      style={{ background: '#fff', color: '#909090', padding: '10px 20px', fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', border: '1px solid #E0E0E0', cursor: 'pointer', fontFamily: "'Google Sans', sans-serif" }}>
                      Reject
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
