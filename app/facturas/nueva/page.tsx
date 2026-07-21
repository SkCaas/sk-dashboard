'use client'
import Logo from '../../../components/Logo';
import { useState } from 'react'
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation, useAction } from "convex/react";
import Link from 'next/link'

export default function NuevaFactura() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [datos, setDatos] = useState<any>(null)

  const { user } = useUser();
  const profile = useQuery("users:getByClerkId" as any, user ? { clerkId: user.id } : "skip");
  const generateUploadUrl = useMutation("facturas:generateUploadUrl" as any);
  const procesarFactura = useAction("ia:procesarFactura" as any);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return
    setLoading(true)
    setError('')

    try {
      if (!profile) throw new Error('No autenticado')
      
      // 1. Obtener URL de Convex Storage
      const postUrl = await generateUploadUrl();

      // 2. Subir el archivo a Convex
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type || "application/pdf" },
        body: file,
      });
      if (!result.ok) throw new Error('Error al subir archivo')
      
      const { storageId } = await result.json();

      // 3. Ejecutar la acción de IA en el backend (gemini-1.5-pro configurado via vars)
      const datosExtraidos = await procesarFactura({
        storageId,
        userId: profile._id,
        fileName: file.name,
        mimeType: file.type || "application/pdf"
      });

      setDatos(datosExtraidos)
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Error al procesar la factura')
    } finally {
      setLoading(false)
    }
  }

  if (success && datos) {
    return (
      <div style={{ minHeight: '100vh', background: '#F5F5F3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Google Sans', sans-serif" }}>
        
        <div style={{ width: '100%', maxWidth: 520 }}>
          <div style={{ background: '#fff', border: '1px solid #E0E0E0', padding: 48 }}>
            <div style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: '#909090', marginBottom: 16 }}>Factura procesada</div>
            <h2 style={{ fontFamily: "'Google Sans', sans-serif", fontSize: 28, fontWeight: 700, letterSpacing: -1, marginBottom: 32 }}>Cargada con éxito</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: '#E0E0E0', marginBottom: 32 }}>
              {[
                { label: 'N° Factura', value: datos.numero_factura },
                { label: 'Emisor', value: datos.emisor },
                { label: 'Receptor', value: datos.receptor },
                { label: 'Monto', value: `${datos.moneda} ${Number(datos.monto).toLocaleString()}` },
                { label: 'Fecha emisión', value: datos.fecha_emision },
                { label: 'País', value: datos.pais },
              ].filter(i => i.value).map(item => (
                <div key={item.label} style={{ background: '#fff', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: '#909090' }}>{item.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 500, fontFamily: 'inherit' }}>{item.value}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Link href="/dashboard" style={{ flex: 1, background: '#000', color: '#fff', padding: '14px', fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', textDecoration: 'none', textAlign: 'center' }}>
                Ir al dashboard
              </Link>
              <button onClick={() => { setSuccess(false); setFile(null); setDatos(null) }}
                style={{ flex: 1, background: '#fff', color: '#909090', padding: '14px', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', border: '1px solid #E0E0E0', cursor: 'pointer', fontFamily: "'Google Sans', sans-serif" }}>
                Cargar otra
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
          <div style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: '#909090', marginBottom: 16 }}>Proveedor</div>
          <h1 style={{ fontFamily: "'Google Sans', sans-serif", fontSize: 28, fontWeight: 700, letterSpacing: -1, marginBottom: 8 }}>Cargar factura</h1>
          <p style={{ fontSize: 13, color: '#909090', marginBottom: 40 }}>XML, PDF o JSON · México y Costa Rica · IA extrae los datos automáticamente</p>

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
                  <p style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: '#C0C0C0', marginBottom: 8 }}>Subir archivo</p>
                  <p style={{ fontSize: 13, color: '#909090' }}>Hacé clic o arrastrá tu factura aquí</p>
                  <p style={{ fontSize: 11, color: '#C0C0C0', marginTop: 8 }}>XML · PDF · JSON</p>
                </div>
              )}
            </div>

            <button type="submit" disabled={!file || loading}
              style={{ background: !file || loading ? '#E0E0E0' : '#000', color: !file || loading ? '#909090' : '#fff', padding: '14px', fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', border: 'none', cursor: !file || loading ? 'not-allowed' : 'pointer', fontFamily: "'Google Sans', sans-serif" }}>
              {loading ? 'Procesando con IA...' : 'Procesar factura'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
