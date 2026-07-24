'use client'
import Logo from '../../../components/Logo';
import { useState } from 'react'
import { useOrganization } from "@clerk/nextjs";
import { useQuery, useMutation, useAction } from "convex/react";
import Link from 'next/link'

export default function NewInvoice() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [data, setData] = useState<any>(null)

  const { organization } = useOrganization();
  const company = useQuery("companies:getByClerkOrgId" as any, organization ? { clerkOrgId: organization.id } : "skip");
  const generateUploadUrl = useMutation("invoices:generateUploadUrl" as any);
  const processInvoice = useAction("ai:procesarFactura" as any); 

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return
    setLoading(true)
    setError('')

    try {
      if (!company) throw new Error('Not authenticated or no organization')
      
      const postUrl = await generateUploadUrl();

      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type || "application/pdf" },
        body: file,
      });
      if (!result.ok) throw new Error('Error uploading file')
      
      const { storageId } = await result.json();

      const extractedData = await processInvoice({
        storageId,
        companyId: company._id, // we should update the backend action to accept companyId instead of userId
        fileName: file.name,
        mimeType: file.type || "application/pdf"
      });

      setData(extractedData)
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Error processing invoice')
    } finally {
      setLoading(false)
    }
  }

  if (success && data) {
    return (
      <div style={{ minHeight: '100vh', background: '#F5F5F3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Google Sans', sans-serif" }}>
        
        <div style={{ width: '100%', maxWidth: 520 }}>
          <div style={{ background: '#fff', border: '1px solid #E0E0E0', padding: 48 }}>
            <div style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: '#909090', marginBottom: 16 }}>Processed Invoice</div>
            <h2 style={{ fontFamily: "'Google Sans', sans-serif", fontSize: 28, fontWeight: 700, letterSpacing: -1, marginBottom: 32 }}>Successfully uploaded</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: '#E0E0E0', marginBottom: 32 }}>
              {[
                { label: 'Invoice No.', value: data.invoice_number },
                { label: 'Issuer', value: data.issuer },
                { label: 'Receiver', value: data.receiver },
                { label: 'Amount', value: `${data.currency} ${Number(data.amount).toLocaleString()}` },
                { label: 'Issue Date', value: data.issue_date },
                { label: 'Country', value: data.country },
              ].filter(i => i.value).map(item => (
                <div key={item.label} style={{ background: '#fff', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: '#909090' }}>{item.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 500, fontFamily: 'inherit' }}>{item.value}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Link href="/dashboard" style={{ flex: 1, background: '#000', color: '#fff', padding: '14px', fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', textDecoration: 'none', textAlign: 'center' }}>
                Go to Dashboard
              </Link>
              <button onClick={() => { setSuccess(false); setFile(null); setData(null) }}
                style={{ flex: 1, background: '#fff', color: '#909090', padding: '14px', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', border: '1px solid #E0E0E0', cursor: 'pointer', fontFamily: "'Google Sans', sans-serif" }}>
                Upload Another
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Google Sans', sans-serif" }}>
      
      <div style={{ width: '100%', maxWidth: 520 }}>
        <div style={{ marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href={process.env.NEXT_PUBLIC_LANDING_URL || "/"} style={{ textDecoration: 'none' }}>
            <Logo />
          </Link>
          <Link href="/dashboard" style={{ fontSize: 11, color: '#909090', textDecoration: 'none', letterSpacing: 1.5, textTransform: 'uppercase' }}>← Dashboard</Link>
        </div>

        <div style={{ background: '#fff', border: '1px solid #E0E0E0', padding: 48 }}>
          <div style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: '#909090', marginBottom: 16 }}>Supplier</div>
          <h1 style={{ fontFamily: "'Google Sans', sans-serif", fontSize: 28, fontWeight: 700, letterSpacing: -1, marginBottom: 8 }}>Upload Invoice</h1>
          <p style={{ fontSize: 13, color: '#909090', marginBottom: 40 }}>XML, PDF or JSON · AI extracts data automatically</p>

          <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {error && (
              <div style={{ background: '#FFF5F5', border: '1px solid #FFE0E0', color: '#CC0000', padding: '12px 16px', fontSize: 13 }}>{error}</div>
            )}

            <div
              onClick={() => document.getElementById('file-input')?.click()}
              style={{ border: `1.5px dashed ${file ? '#000' : '#E0E0E0'}`, padding: '48px 32px', textAlign: 'center', cursor: 'pointer', background: file ? '#F5F5F3' : '#fff', transition: 'all 0.15s' }}>
              <input id="file-input" type="file" accept=".xml,.pdf,.json" className="hidden" style={{ display: 'none' }}
                onChange={e => setFile(e.target.files?.[0] || null)} />
              {file ? (
                <div>
                  <p style={{ fontFamily: "'Google Sans', sans-serif", fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{file.name}</p>
                  <p style={{ fontSize: 12, color: '#909090' }}>{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              ) : (
                <div>
                  <p style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: '#C0C0C0', marginBottom: 8 }}>Upload file</p>
                  <p style={{ fontSize: 13, color: '#909090' }}>Click or drag your invoice here</p>
                  <p style={{ fontSize: 11, color: '#C0C0C0', marginTop: 8 }}>XML · PDF · JSON</p>
                </div>
              )}
            </div>

            <button type="submit" disabled={!file || loading}
              style={{ background: !file || loading ? '#E0E0E0' : '#000', color: !file || loading ? '#909090' : '#fff', padding: '14px', fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', border: 'none', cursor: !file || loading ? 'not-allowed' : 'pointer', fontFamily: "'Google Sans', sans-serif" }}>
              {loading ? 'Processing with AI...' : 'Process Invoice'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
