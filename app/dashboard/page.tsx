'use client'
import Logo from '../../components/Logo';
import { useEffect } from 'react'
import Link from 'next/link'
import { useUser, useClerk } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  
  // Utilizando strings para evitar errores de tipado hasta que se configuren los workspaces
  const profile = useQuery("users:getByClerkId" as any, user ? { clerkId: user.id } : "skip");
  const upsertUser = useMutation("users:upsert" as any);
  const facturas = useQuery("facturas:getAll" as any, profile ? {} : "skip") || [];

  useEffect(() => {
    if (user && profile === null) {
      upsertUser({
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress || "correo@ejemplo.com",
        company_name: "Nueva Empresa",
        role: "PROVEEDOR"
      });
    }
  }, [user, profile, upsertUser]);

  async function handleLogout() {
    await signOut({ redirectUrl: '/' });
  }

  if (!isLoaded || profile === undefined) return (
    <div style={{ minHeight: '100vh', background: '#F5F5F3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Lexend Deca', sans-serif" }}>
      <p style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: '#909090' }}>Cargando...</p>
    </div>
  )

  const isCorporativo = profile?.role === 'CORPORATIVO'
  const isBanco = profile?.role === 'BANCO'
  const totalMonto = facturas.reduce((sum: any, f: any) => sum + (Number(f.monto) || 0), 0)
  const pendientes = facturas.filter((f: any) => f.estado === 'PENDIENTE').length
  const aprobadas = facturas.filter((f: any) => f.estado === 'APROBADA').length

  const stats = isBanco ? [
    { val: facturas.length.toString(), lbl: 'Total solicitudes' },
    { val: pendientes.toString(), lbl: 'Pendientes' },
    { val: aprobadas.toString(), lbl: 'Aprobadas' },
    { val: `$${(totalMonto/1000).toFixed(0)}K`, lbl: 'Volumen' },
  ] : isCorporativo ? [
    { val: pendientes.toString(), lbl: 'Facturas pendientes' },
    { val: aprobadas.toString(), lbl: 'Aprobadas' },
    { val: `$${(totalMonto/1000).toFixed(0)}K`, lbl: 'Monto total' },
    { val: facturas.length.toString(), lbl: 'Total facturas' },
  ] : [
    { val: facturas.length.toString(), lbl: 'Facturas cargadas' },
    { val: pendientes.toString(), lbl: 'Pendientes' },
    { val: aprobadas.toString(), lbl: 'Aprobadas' },
    { val: `$${(totalMonto/1000).toFixed(0)}K`, lbl: 'Monto total' },
  ]

  const modules = isBanco ? [
    { num: '01', title: 'Portal de decisiones', desc: 'Revisá y aprobá solicitudes de crédito con score completo.', href: '/banco' },
    { num: '02', title: 'Motor de scoring', desc: 'Evaluá nuevas solicitudes de crédito en tiempo real.', href: '/scoring' },
  ] : isCorporativo ? [
    { num: '01', title: 'Facturas', desc: 'Revisá y aprobá facturas de tus proveedores.', href: '/facturas' },
    { num: '02', title: 'Motor de scoring', desc: 'Evaluá solicitudes de crédito de tu red.', href: '/scoring' },
  ] : [
    { num: '01', title: 'Cargar factura', desc: 'Subí una nueva factura para financiamiento. La IA extrae los datos.', href: '/facturas/nueva' },
    { num: '02', title: 'Mis facturas', desc: 'Seguí el estado de todas tus solicitudes.', href: '/facturas' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F3', fontFamily: "'Google Sans', sans-serif", color: '#000' }}>
      
      <header style={{ borderBottom: '1px solid #E0E0E0', background: '#fff', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 40px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href={process.env.NEXT_PUBLIC_LANDING_URL || "/"} style={{ textDecoration: 'none' }}>
            <Logo />
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <span style={{ fontSize: 12, color: '#909090' }}>{profile?.company_name}</span>
            <span style={{ fontSize: 10, letterSpacing: 1.5, border: '1px solid #E0E0E0', color: '#909090', padding: '4px 10px', textTransform: 'uppercase' }}>{profile?.role}</span>
            <button onClick={handleLogout} style={{ fontSize: 11, color: '#909090', letterSpacing: 1.5, textTransform: 'uppercase', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Google Sans', sans-serif" }}>Salir</button>
          </div>
        </div>
      </header>
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 40px' }}>
        <div style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: '#909090', marginBottom: 12 }}>Dashboard</div>
        <h1 style={{ fontFamily: "'Google Sans', sans-serif", fontSize: 32, fontWeight: 700, letterSpacing: -1, marginBottom: 48 }}>
          {isBanco ? 'Portal Banco' : isCorporativo ? 'Panel Corporativo' : 'Panel Proveedor'}
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
              <div style={{ marginTop: 24, fontSize: 11, color: '#C0C0C0', letterSpacing: 1.5, textTransform: 'uppercase' }}>Abrir →</div>
            </Link>
          ))}
        </div>
        <div style={{ background: '#fff', border: '1px solid #E0E0E0' }}>
          <div style={{ padding: '24px 32px', borderBottom: '1px solid #E0E0E0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: '#909090' }}>Actividad reciente</span>
            <Link href="/facturas" style={{ fontSize: 11, color: '#909090', letterSpacing: 1.5, textTransform: 'uppercase', textDecoration: 'none' }}>Ver todo →</Link>
          </div>
          {facturas.length === 0 ? (
            <div style={{ padding: '60px 32px', textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: '#C0C0C0' }}>Sin actividad aún.</p>
              {!isBanco && !isCorporativo && (
                <Link href="/facturas/nueva" style={{ display: 'inline-block', marginTop: 16, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: '#000', border: '1px solid #000', padding: '10px 24px', textDecoration: 'none' }}>Cargar primera factura</Link>
              )}
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E0E0E0' }}>
                  {['Factura', 'Emisor', 'Monto', 'Estado'].map(h => (
                    <th key={h} style={{ fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: '#C0C0C0', textAlign: 'left', padding: '12px 32px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {facturas.slice(0,5).map((f: any) => (
                  <tr key={f._id || f.id} style={{ borderBottom: '1px solid #F5F5F3' }}>
                    <td style={{ padding: '16px 32px', fontSize: 14, fontFamily: "'Google Sans', sans-serif", fontWeight: 700 }}>{f.numero_factura}</td>
                    <td style={{ padding: '16px 32px', fontSize: 13, color: '#606060' }}>{f.emisor}</td>
                    <td style={{ padding: '16px 32px', fontSize: 13, fontFamily: "'Google Sans', sans-serif" }}>{f.moneda} {Number(f.monto).toLocaleString()}</td>
                    <td style={{ padding: '16px 32px' }}>
                      <span style={{ fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: f.estado === 'PENDIENTE' ? '#909090' : f.estado === 'APROBADA' ? '#000' : '#C0C0C0', border: '1px solid #E0E0E0', padding: '3px 8px' }}>{f.estado}</span>
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
