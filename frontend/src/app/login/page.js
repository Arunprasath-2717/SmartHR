'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ShinyButton from '@/components/ui/ShinyButton';
import {
  Hexagon,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Users,
  AlertCircle,
  Laptop,
  Briefcase,
  Building2,
  Clock,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState('hr'); // 'employee' | 'hr'
  const [email, setEmail] = useState('carla@dayflow.io');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = (roleKey) => {
    setSelectedRole(roleKey);
    if (roleKey === 'hr') {
      setEmail('carla@dayflow.io');
    } else {
      setEmail('john@dayflow.io');
    }
  };

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

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#F8FAFC',
      backgroundImage: 'radial-gradient(#E2E8F0 1px, transparent 1px)',
      backgroundSize: '24px 24px',
      position: 'relative',
      padding: 24
    }}>
      {/* 2-Column Auth Layout (Reframed matching Unstop design) */}
      <div style={{
        width: '100%',
        maxWidth: 960,
        background: '#FFFFFF',
        borderRadius: 28,
        boxShadow: '0 24px 70px rgba(0,0,0,0.08), 0 4px 20px rgba(59,130,246,0.06)',
        border: '1px solid rgba(0,0,0,0.06)',
        display: 'grid',
        gridTemplateColumns: '400px 1fr',
        overflow: 'hidden',
        animation: 'modal-in 450ms cubic-bezier(0.34,1.56,0.64,1) both'
      }}>
        
        {/* ── LEFT BANNER (Vibrant Yellow/Amber matching Reference Image) ── */}
        <div style={{
          background: 'linear-gradient(145deg, #FFD000 0%, #FFB703 60%, #FB8500 100%)',
          padding: '32px 28px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Subtle curved background pattern */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'radial-gradient(circle 300px at 0% 0%, rgba(255,255,255,0.2) 0%, transparent 80%)',
            pointerEvents: 'none'
          }} />

          {/* Top Brand Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, zIndex: 1 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 12,
              background: '#0F172A', color: '#FFD000',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(0,0,0,0.15)'
            }}>
              <Hexagon size={20} fill="#FFD000" />
            </div>
            <span style={{ fontSize: 22, fontWeight: 900, color: '#0F172A', letterSpacing: '-0.03em' }}>
              dayflow
            </span>
          </div>

          {/* Center Graphic — Floating Badges & Hero Persona */}
          <div style={{ position: 'relative', margin: '36px 0', textAlign: 'center', zIndex: 1 }}>
            {/* Floating pill badges around center card */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              <div style={{ background: 'rgba(255,255,255,0.92)', padding: '10px 14px', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 14px rgba(0,0,0,0.06)' }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: '#FCE7F3', color: '#DB2777', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Laptop size={15} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#0F172A' }}>Virtual</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.92)', padding: '10px 14px', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 14px rgba(0,0,0,0.06)' }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Briefcase size={15} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#0F172A' }}>Full-Time</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.92)', padding: '10px 14px', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 14px rgba(0,0,0,0.06)' }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building2 size={15} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#0F172A' }}>In-Office</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.92)', padding: '10px 14px', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 14px rgba(0,0,0,0.06)' }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: '#F3E8FF', color: '#9333EA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Clock size={15} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#0F172A' }}>Part-Time</span>
              </div>
            </div>

            {/* Bottom Floating White Showcase Card */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: 20,
              padding: '16px 20px',
              boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
              border: '1px solid rgba(255,255,255,0.8)'
            }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Sparkles size={18} color="#F59E0B" /> Smart HRMS
              </div>
              <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
                Supporting various employment & attendance types
              </div>
            </div>
          </div>

          {/* Bottom badge */}
          <div style={{ fontSize: 11, fontWeight: 600, color: '#0F172A', opacity: 0.8, zIndex: 1, textAlign: 'center' }}>
            Dayflow Enterprise v1.0 • Secure Authentication
          </div>
        </div>

        {/* ── RIGHT COLUMN (Account Type Selection & Credentials Form) ── */}
        <div style={{ padding: '40px 44px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
              Identify your account type
            </h1>
            <p style={{ fontSize: 13, color: '#64748B', marginTop: 6 }}>
              Join Dayflow to manage your workforce, track attendance, and process payroll
            </p>
          </div>

          {/* Account Type Selection Cards (Exact Unstop UI Variant) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
            
            {/* Card 1: Employee */}
            <div
              onClick={() => handleRoleSelect('employee')}
              style={{
                padding: '16px 20px',
                borderRadius: 18,
                background: selectedRole === 'employee' ? '#FFFBEB' : '#F8FAFC',
                border: selectedRole === 'employee' ? '2px solid #F59E0B' : '1.5px solid #E2E8F0',
                cursor: 'pointer',
                transition: 'all 200ms ease',
                boxShadow: selectedRole === 'employee' ? '0 8px 20px rgba(245,158,11,0.12)' : 'none',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 14
              }}
            >
              <div style={{
                width: 38, height: 38, borderRadius: 12,
                background: selectedRole === 'employee' ? '#F59E0B' : '#E2E8F0',
                color: selectedRole === 'employee' ? '#FFFFFF' : '#64748B',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <Users size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>I&apos;m an Employee</span>
                  {selectedRole === 'employee' && <CheckCircle2 size={16} color="#F59E0B" />}
                </div>
                <div style={{ fontSize: 12, color: '#64748B', marginTop: 2, lineHeight: 1.4 }}>
                  Clock shift attendance, apply for leaves, view payslips & manage profile
                </div>
              </div>
            </div>

            {/* Card 2: HR Officer / Admin */}
            <div
              onClick={() => handleRoleSelect('hr')}
              style={{
                padding: '16px 20px',
                borderRadius: 18,
                background: selectedRole === 'hr' ? '#EFF6FF' : '#F8FAFC',
                border: selectedRole === 'hr' ? '2px solid #2563EB' : '1.5px solid #E2E8F0',
                cursor: 'pointer',
                transition: 'all 200ms ease',
                boxShadow: selectedRole === 'hr' ? '0 8px 20px rgba(37,99,235,0.12)' : 'none',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 14
              }}
            >
              <div style={{
                width: 38, height: 38, borderRadius: 12,
                background: selectedRole === 'hr' ? '#2563EB' : '#E2E8F0',
                color: selectedRole === 'hr' ? '#FFFFFF' : '#64748B',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <ShieldCheck size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>I&apos;m an HR Officer / Employer</span>
                  {selectedRole === 'hr' && <CheckCircle2 size={16} color="#2563EB" />}
                </div>
                <div style={{ fontSize: 12, color: '#64748B', marginTop: 2, lineHeight: 1.4 }}>
                  Manage team members, approve leave requests, process payroll & AI insights
                </div>
              </div>
            </div>

          </div>

          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 12,
              background: '#FEE2E2', border: '1px solid rgba(239,68,68,0.2)', color: '#991B1B',
              fontSize: 12, fontWeight: 600, marginBottom: 16
            }}>
              <AlertCircle size={16} flexShrink={0} />
              <span>{error}</span>
            </div>
          )}

          {/* Login Credentials Form */}
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', marginBottom: 4 }}>
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

            <div className="form-group" style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', marginBottom: 4 }}>
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

          {/* Legal Notice Footer */}
          <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 20, textAlign: 'center', lineHeight: 1.5 }}>
            By signing in, you accept the <a href="#" style={{ color: '#2563EB', fontWeight: 600 }}>Terms of Service</a> and acknowledge our <a href="#" style={{ color: '#2563EB', fontWeight: 600 }}>Privacy Policy</a>.
          </div>

          <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: '#64748B' }}>
            Don&apos;t have an account?{' '}
            <a href="/signup" style={{ color: '#2563EB', fontWeight: 700 }}>Create an Account</a>
          </div>

        </div>

      </div>
    </div>
  );
}
