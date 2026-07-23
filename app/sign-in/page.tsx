"use client";
import { SignIn } from "@clerk/nextjs";
import Logo from '../../components/Logo';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F3', display: 'flex', fontFamily: "'Google Sans', sans-serif" }}>
      <div style={{ width: 480, background: '#000', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 48, flexShrink: 0 }}>
        <Link href={process.env.NEXT_PUBLIC_LANDING_URL || "/"} style={{ textDecoration: 'none' }}>
          <Logo theme="dark" />
        </Link>
        <div>
          <p style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: '#404040', marginBottom: 24 }}>SK Credit Infrastructure · of LATAM</p>
          <h2 style={{ fontFamily: "'Google Sans', sans-serif", fontSize: 36, fontWeight: 700, color: '#fff', letterSpacing: -1, lineHeight: 1.1, marginBottom: 24 }}>Capital moves when you decide.</h2>
        </div>
        <div style={{ fontSize: 11, color: '#272727', letterSpacing: 1 }}>© 2026 SK. All rights reserved.</div>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
        <SignIn routing="hash" />
      </div>
    </div>
  )
}
