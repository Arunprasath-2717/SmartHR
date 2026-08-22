'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ShinyButton from '@/components/ui/ShinyButton';
import { Hexagon, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('carla@dayflow.io');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
      setLoading(false);
    }
  };

  const setQuickRole = (roleEmail) => {
    setEmail(roleEmail);
    setPassword('password123');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justify: 'center',
      background: 'linear-gradient(135deg, #0B1E3D 0%, #1A3A6B 55%, #2563EB 100%)',
      position: 'relative',
      overflow: 'hidden',
      padding: 24
    }}>
      {/* Background radial effects */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 60% 50% at 20% 50%, rgba(59,130,246,0.25) 0%,transparent 70%), radial-gradient(ellipse 40% 60% at 80% 20%, rgba(139,92,246,0.2) 0%,transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div style={{
        width: '100%',
        maxWidth: 440,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(24px) saturate(180%)',
        borderRadius: 24,
        padding: '40px 36px',
        boxShadow: '0 24px 60px rgba(0,0,0,0.3), 0 4px 16px rgba(59,130,246,0.2)',
        border: '1px solid rgba(255, 255, 255, 0.4)',
        position: 'relative',
        zIndex: 1,
        animation: 'modal-in 400ms cubic-bezier(0.34,1.56,0.64,1) both'
      }}>
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 24 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 8px 20px rgba(59,130,246,0.4)' }}>
            <Hexagon size={24} />
          </div>
          <span style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>Dayflow</span>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0F172A' }}>Sign In to Dayflow HRMS</h2>
          <p style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>Enter your credentials to access your dashboard</p>
        </div>

        {error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px', borderRadius: 12,
            background: '#FEE2E2', border: '1px solid rgba(239,68,68,0.2)', color: '#991B1B',
            fontSize: 12, fontWeight: 600, marginBottom: 20
          }}>
            <AlertCircle size={16} flexShrink={0} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', marginBottom: 6 }}>
              Work Email
            </label>
            <div style={{ position: 'relative' }}>
              <input
                className="input"
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ paddingLeft: 40, borderRadius: 12 }}
              />
              <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', marginBottom: 6 }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                className="input"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ paddingLeft: 40, borderRadius: 12 }}
              />
              <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            </div>
          </div>

          <ShinyButton
            type="submit"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {loading ? 'Authenticating...' : (
              <>
                Sign In to Dashboard <ArrowRight size={16} />
              </>
            )}
          </ShinyButton>
        </form>

        {/* Quick RBAC Switcher for testing */}
        <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(59,130,246,0.1)', textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
            Demo Quick Login Roles
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setQuickRole('carla@dayflow.io')}
              style={{ fontSize: 11, borderRadius: 20 }}
            >
              <ShieldCheck size={13} color="#3B82F6" /> HR Officer
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setQuickRole('john@dayflow.io')}
              style={{ fontSize: 11, borderRadius: 20 }}
            >
              Employee User
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#64748B' }}>
          Don&apos;t have an account?{' '}
          <a href="/signup" style={{ color: '#3B82F6', fontWeight: 600 }}>Create an Account</a>
        </div>
      </div>
    </div>
  );
}
