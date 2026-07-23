'use client'

import { useState } from 'react';
import { useOrganizationList } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Logo from '../../components/Logo';

type EntityType = 'SUPPLIER' | 'CORPORATE' | 'BANK';

export default function OnboardingPage() {
  const [selectedType, setSelectedType] = useState<EntityType | null>(null);
  const [name, setName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { setActive } = useOrganizationList();
  const router = useRouter();
  const [details, setDetails] = useState<any>({});

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType || !name) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/organizations/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          type: selectedType,
          tax_id: details.tax_id || '', // keep top-level for backward compat
          details: details
        })
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const org = await res.json();
      
      if (setActive) {
        await setActive({ organization: org.id });
      }

      router.push('/dashboard');
      
    } catch (err: any) {
      setError(err.message || 'Failed to create company');
      setLoading(false);
    }
  };

  const getEntityTitle = (type: EntityType) => {
    if (type === 'SUPPLIER') return 'Supplier';
    if (type === 'CORPORATE') return 'Corporate (Buyer)';
    if (type === 'BANK') return 'Bank (Funder)';
  }

  const getEntityDescription = (type: EntityType) => {
    if (type === 'SUPPLIER') return 'Upload your invoices to receive early payments.';
    if (type === 'CORPORATE') return 'Review and approve your suppliers invoices.';
    if (type === 'BANK') return 'Evaluate credit applications and fund invoices.';
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F3', fontFamily: "'Google Sans', sans-serif", color: '#000', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '32px 40px' }}>
        <Logo />
      </header>
      
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '40px', width: '100%', flex: 1 }}>
        {!selectedType ? (
          <>
            <div style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: '#909090', marginBottom: 12 }}>Welcome to SKCaas</div>
            <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: -1, marginBottom: 48 }}>Choose your entity type</h1>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
              {(['SUPPLIER', 'CORPORATE', 'BANK'] as EntityType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => { setSelectedType(type); setDetails({}); setName(''); setError(''); }}
                  style={{ background: '#fff', border: '1px solid #E0E0E0', padding: '32px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit' }}
                  onMouseOver={(e) => (e.currentTarget.style.borderColor = '#000')}
                  onMouseOut={(e) => (e.currentTarget.style.borderColor = '#E0E0E0')}
                >
                  <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.5, marginBottom: 8 }}>{getEntityTitle(type)}</div>
                  <div style={{ fontSize: 13, color: '#909090' }}>{getEntityDescription(type)}</div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <form onSubmit={handleCreateOrganization} style={{ background: '#fff', border: '1px solid #E0E0E0', padding: '48px' }}>
            <button type="button" onClick={() => setSelectedType(null)} style={{ background: 'none', border: 'none', fontSize: 11, color: '#909090', letterSpacing: 1.5, textTransform: 'uppercase', cursor: 'pointer', padding: 0, marginBottom: 32 }}>← Back</button>
            
            <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.5, marginBottom: 8 }}>Create {getEntityTitle(selectedType)} Profile</h1>
            <p style={{ fontSize: 13, color: '#909090', marginBottom: 32 }}>Enter your unique company details to get started.</p>

            {error && (
              <div style={{ background: '#FFF0F0', border: '1px solid #FFCCCC', color: '#CC0000', padding: '16px', fontSize: 13, marginBottom: 24 }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: '#909090', marginBottom: 8 }}>Company Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={{ width: '100%', border: '1px solid #E0E0E0', padding: '16px', fontSize: 14, fontFamily: 'inherit', outline: 'none' }} placeholder="e.g. Acme Corp" />
            </div>

            {selectedType === 'SUPPLIER' && (
              <>
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: '#909090', marginBottom: 8 }}>Tax ID (Required)</label>
                  <input type="text" value={details.tax_id || ''} onChange={(e) => setDetails({...details, tax_id: e.target.value})} required style={{ width: '100%', border: '1px solid #E0E0E0', padding: '16px', fontSize: 14, fontFamily: 'inherit', outline: 'none' }} placeholder="e.g. 123456789" />
                </div>
                <div style={{ marginBottom: 32 }}>
                  <label style={{ display: 'block', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: '#909090', marginBottom: 8 }}>Country</label>
                  <input type="text" value={details.country || ''} onChange={(e) => setDetails({...details, country: e.target.value})} required style={{ width: '100%', border: '1px solid #E0E0E0', padding: '16px', fontSize: 14, fontFamily: 'inherit', outline: 'none' }} placeholder="e.g. Mexico" />
                </div>
              </>
            )}

            {selectedType === 'CORPORATE' && (
              <>
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: '#909090', marginBottom: 8 }}>Corporate Tax ID (Required)</label>
                  <input type="text" value={details.tax_id || ''} onChange={(e) => setDetails({...details, tax_id: e.target.value})} required style={{ width: '100%', border: '1px solid #E0E0E0', padding: '16px', fontSize: 14, fontFamily: 'inherit', outline: 'none' }} placeholder="e.g. C-9876543" />
                </div>
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: '#909090', marginBottom: 8 }}>Industry Sector</label>
                  <input type="text" value={details.industry || ''} onChange={(e) => setDetails({...details, industry: e.target.value})} required style={{ width: '100%', border: '1px solid #E0E0E0', padding: '16px', fontSize: 14, fontFamily: 'inherit', outline: 'none' }} placeholder="e.g. Manufacturing" />
                </div>
                <div style={{ marginBottom: 32 }}>
                  <label style={{ display: 'block', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: '#909090', marginBottom: 8 }}>Estimated Monthly Volume</label>
                  <input type="text" value={details.monthly_volume || ''} onChange={(e) => setDetails({...details, monthly_volume: e.target.value})} required style={{ width: '100%', border: '1px solid #E0E0E0', padding: '16px', fontSize: 14, fontFamily: 'inherit', outline: 'none' }} placeholder="e.g. $500,000" />
                </div>
              </>
            )}

            {selectedType === 'BANK' && (
              <>
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: '#909090', marginBottom: 8 }}>Banking License Number (Required)</label>
                  <input type="text" value={details.banking_license || ''} onChange={(e) => setDetails({...details, banking_license: e.target.value})} required style={{ width: '100%', border: '1px solid #E0E0E0', padding: '16px', fontSize: 14, fontFamily: 'inherit', outline: 'none' }} placeholder="e.g. BL-1234" />
                </div>
                <div style={{ marginBottom: 32 }}>
                  <label style={{ display: 'block', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: '#909090', marginBottom: 8 }}>SWIFT Code</label>
                  <input type="text" value={details.swift_code || ''} onChange={(e) => setDetails({...details, swift_code: e.target.value})} required style={{ width: '100%', border: '1px solid #E0E0E0', padding: '16px', fontSize: 14, fontFamily: 'inherit', outline: 'none' }} placeholder="e.g. BOFAUS3N" />
                </div>
              </>
            )}

            <button type="submit" disabled={loading} style={{ width: '100%', background: '#000', color: '#fff', border: 'none', padding: '16px', fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, fontFamily: 'inherit' }}>
              {loading ? 'Creating...' : 'Continue to Dashboard'}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
