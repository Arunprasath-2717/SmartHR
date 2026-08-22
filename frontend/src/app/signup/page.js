'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Hexagon, Lock, Mail, User, Shield, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function SignupPage() {
  const { signup } = useAuth();
  const [employeeId, setEmployeeId] = useState('105');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('employee');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!employeeId) {
      setError('Employee ID is required.');
      return;
    }
    if (!email.includes('@')) {
      setError('Valid work email is required.');
      return;
    }
    if (password.length < 6) {
      setError('Password must follow security rules (min 6 characters).');
      return;
    }

    setLoading(true);
    try {
      await signup({ employeeId, email, password, role });
    } catch (err) {
      setError(err.message || 'Registration failed.');
      setLoading(false);
    }
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
      {/* Radial overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 60% 50% at 20% 50%, rgba(59,130,246,0.25) 0%,transparent 70%), radial-gradient(ellipse 40% 60% at 80% 20%, rgba(139,92,246,0.2) 0%,transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div style={{
        width: '100%',
        maxWidth: 460,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(24px) saturate(180%)',
        borderRadius: 24,
        padding: '36px 36px',
        boxShadow: '0 24px 60px rgba(0,0,0,0.3), 0 4px 16px rgba(59,130,246,0.2)',
        border: '1px solid rgba(255, 255, 255, 0.4)',
        position: 'relative',
        zIndex: 1,
        animation: 'modal-in 400ms cubic-bezier(0.34,1.56,0.64,1) both'
      }}>
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 20 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 8px 20px rgba(59,130,246,0.4)' }}>
            <Hexagon size={22} />
          </div>
          <span style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>Dayflow</span>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0F172A' }}>Create Your Account</h2>
          <p style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>Sign up using your Employee ID and work email</p>
        </div>

        {error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 12,
            background: '#FEE2E2', border: '1px solid rgba(239,68,68,0.2)', color: '#991B1B',
            fontSize: 12, fontWeight: 600, marginBottom: 18
          }}>
            <AlertCircle size={16} flexShrink={0} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Employee ID */}
          <div className="form-group" style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', marginBottom: 4 }}>
              Employee ID *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                className="input"
                type="text"
                required
                placeholder="e.g. 105"
                value={employeeId}
                onChange={e => setEmployeeId(e.target.value)}
                style={{ paddingLeft: 40, borderRadius: 12 }}
              />
              <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            </div>
          </div>

          {/* Work Email */}
          <div className="form-group" style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', marginBottom: 4 }}>
              Work Email *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                className="input"
                type="email"
                required
                placeholder="john@dayflow.io"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ paddingLeft: 40, borderRadius: 12 }}
              />
              <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            </div>
          </div>

          {/* Password */}
          <div className="form-group" style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', marginBottom: 4 }}>
              Password *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                className="input"
                type="password"
                required
                placeholder="Minimum 6 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ paddingLeft: 40, borderRadius: 12 }}
              />
              <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            </div>
          </div>

          {/* Role Selection */}
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', marginBottom: 6 }}>
              Select Role *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button
                type="button"
                style={{
                  padding: '10px 14px', borderRadius: 12, border: role === 'employee' ? '2px solid #3B82F6' : '1px solid var(--border-med)',
                  background: role === 'employee' ? 'rgba(59,130,246,0.08)' : '#fff',
                  fontWeight: 600, fontSize: 13, color: role === 'employee' ? '#3B82F6' : '#64748B',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer', transition: 'all 200ms'
                }}
                onClick={() => setRole('employee')}
              >
                {role === 'employee' && <CheckCircle2 size={14} />} Employee
              </button>
              <button
                type="button"
                style={{
                  padding: '10px 14px', borderRadius: 12, border: role === 'hr' ? '2px solid #3B82F6' : '1px solid var(--border-med)',
                  background: role === 'hr' ? 'rgba(59,130,246,0.08)' : '#fff',
                  fontWeight: 600, fontSize: 13, color: role === 'hr' ? '#3B82F6' : '#64748B',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer', transition: 'all 200ms'
                }}
                onClick={() => setRole('hr')}
              >
                {role === 'hr' && <Shield size={14} />} HR Officer
              </button>
            </div>
          </div>

          <div style={{ fontSize: 11, color: '#64748B', marginBottom: 20, textAlign: 'center' }}>
            📧 Email verification link will be sent upon submission.
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '12px 20px', borderRadius: 12, fontSize: 14 }}
          >
            {loading ? 'Creating Account...' : (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                Complete Registration <ArrowRight size={16} />
              </span>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#64748B' }}>
          Already registered?{' '}
          <a href="/login" style={{ color: '#3B82F6', fontWeight: 600 }}>Sign In</a>
        </div>
      </div>
    </div>
  );
}
