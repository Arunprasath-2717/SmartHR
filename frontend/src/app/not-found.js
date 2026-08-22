'use client';
import { LockKeyhole, ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:'var(--bg)', flexDirection:'column', gap:16, textAlign:'center', padding:32,
    }}>
      {/* Glass Card */}
      <div style={{
        background:'rgba(255,255,255,0.85)', backdropFilter:'blur(24px) saturate(180%)',
        WebkitBackdropFilter:'blur(24px) saturate(180%)',
        border:'1px solid rgba(59,130,246,0.15)', boxShadow:'0 20px 60px rgba(0,0,0,0.1)',
        borderRadius:24, padding:'48px 56px', maxWidth:480,
      }}>
        {/* Animated lock */}
        <div style={{ display:'inline-flex', marginBottom:16, color:'var(--accent)', animation:'lock-swing 2s ease-in-out infinite' }}>
          <LockKeyhole size={56} />
        </div>
        <h1 style={{ fontSize:28, fontWeight:700, marginBottom:12, letterSpacing:'-0.02em', color:'#0F172A' }}>Session Expired</h1>
        <p style={{ fontSize:14, color:'var(--text-muted)', lineHeight:1.6, marginBottom:32 }}>
          Your session has timed out for security. Please sign in again to continue using DayFlow HRMS.
        </p>
        <a
          href="/dashboard"
          style={{
            display:'inline-flex', alignItems:'center', gap:8,
            padding:'12px 28px', borderRadius:99,
            background:'var(--accent)', color:'#fff',
            fontWeight:600, fontSize:14,
            boxShadow:'0 4px 14px rgba(59,130,246,0.35)',
            transition:'transform 150ms, box-shadow 150ms',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 6px 20px rgba(59,130,246,0.4)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 4px 14px rgba(59,130,246,0.35)'; }}
        >
          Sign In Again <ArrowRight size={16} />
        </a>
      </div>
      <style>{`
        @keyframes lock-swing {
          0%,100% { transform: rotate(0deg); }
          25%  { transform: rotate(-8deg); }
          75%  { transform: rotate(8deg); }
        }
      `}</style>
    </div>
  );
}
