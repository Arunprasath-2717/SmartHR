'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ShinyButton from '@/components/ui/ShinyButton';
import {
  Hexagon,
  Lock,
  Mail,
  User,
  ShieldCheck,
  Users,
  ArrowRight,
  AlertCircle,
  Laptop,
  Briefcase,
  Building2,
  Clock,
  CheckCircle2,
  Eye,
  EyeOff,
  UserCheck,
  Sparkles,
  Zap
} from 'lucide-react';

export default function SignupPage() {
  const { signup } = useAuth();
  const [selectedRole, setSelectedRole] = useState('employee'); // 'employee' | 'hr'
  const [employeeId, setEmployeeId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({ employeeId: false, email: false, password: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Field validation rules
  const isEmployeeIdValid = employeeId.trim().length > 0 && /^\d+$/.test(employeeId.trim());
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPasswordValid = password.length >= 6;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ employeeId: true, email: true, password: true });
    setError('');

    const targetEmployeeId = employeeId || '105';
    const targetEmail = email || (selectedRole === 'employee' ? 'john@dayflow.io' : 'carla@dayflow.io');
    const targetPassword = password || 'password123';

    setLoading(true);
    try {
      await signup({ employeeId: targetEmployeeId, email: targetEmail, password: targetPassword, role: selectedRole });
    } catch (err) {
      setError(err.message || 'Registration failed.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#F8FAFC',
      backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)',
      backgroundSize: '24px 24px',
      position: 'relative',
      padding: '32px 16px'
    }}>
      <style>{`
        .faint-input::placeholder {
          color: #94A3B8;
          opacity: 0.22;
          font-weight: 500;
          transition: opacity 150ms ease;
        }
        .faint-input:focus::placeholder {
          opacity: 0.08;
        }
      `}</style>

      {/* 2-Column Auth Container (Centered Max 960px) */}
      <div style={{
        width: '100%',
        maxWidth: 960,
        background: '#FFFFFF',
        borderRadius: 28,
        boxShadow: '0 24px 70px rgba(0,0,0,0.08), 0 4px 20px rgba(59,130,246,0.06)',
        border: '1px solid rgba(0,0,0,0.06)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        overflow: 'hidden',
        animation: 'modal-in 400ms cubic-bezier(0.34,1.56,0.64,1) both'
      }}>
        
        {/* ── LEFT BANNER (Static Solid Amber Canvas — Motion Removed) ── */}
        <div style={{
          background: 'linear-gradient(145deg, #FFD000 0%, #FFB703 60%, #FB8500 100%)',
          padding: '36px 32px',
          display: 'flex',
          flexDirection: 'column',
          justify: 'space-between',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Subtle backdrop pattern */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'radial-gradient(circle 320px at 0% 0%, rgba(255,255,255,0.3) 0%, transparent 80%)',
            pointerEvents: 'none'
          }} />

          {/* Brand Logo Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, zIndex: 1 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12,
              background: '#0F172A', color: '#FFD000',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(0,0,0,0.15)'
            }}>
              <Hexagon size={24} fill="#FFD000" />
            </div>
            <span style={{ fontSize: 24, fontWeight: 900, color: '#0F172A', letterSpacing: '-0.03em' }}>
              dayflow
            </span>
          </div>

          {/* Static Professional Hero Card */}
          <div style={{ margin: '32px 0', textAlign: 'center', zIndex: 1, position: 'relative' }}>
            
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: 24,
              padding: '26px 20px',
              boxShadow: '0 12px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)',
              marginBottom: 20,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 14
            }}>
              {/* Static Icons Group */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
                <div style={{
                  width: 46, height: 46, borderRadius: 14,
                  background: 'linear-gradient(135deg, #10B981, #059669)',
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 6px 16px rgba(16,185,129,0.25)'
                }}>
                  <UserCheck size={22} />
                </div>
                <div style={{
                  width: 46, height: 46, borderRadius: 14,
                  background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 6px 16px rgba(37,99,235,0.25)'
                }}>
                  <ShieldCheck size={22} />
                </div>
                <div style={{
                  width: 46, height: 46, borderRadius: 14,
                  background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 6px 16px rgba(245,158,11,0.25)'
                }}>
                  <Sparkles size={22} />
                </div>
              </div>

              <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>
                Onboarding & Account Registration
              </div>
            </div>

            {/* Static Pill Badges */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{ background: 'rgba(255,255,255,0.92)', padding: '10px 12px', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <Laptop size={16} color="#DB2777" />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#0F172A' }}>Virtual</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.92)', padding: '10px 12px', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <Briefcase size={16} color="#2563EB" />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#0F172A' }}>Full-Time</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.92)', padding: '10px 12px', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <Building2 size={16} color="#D97706" />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#0F172A' }}>In-Office</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.92)', padding: '10px 12px', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <Clock size={16} color="#9333EA" />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#0F172A' }}>Part-Time</span>
              </div>
            </div>

            {/* Static Badge */}
            <div style={{
              marginTop: 18,
              background: '#0F172A', color: '#6EE7B7',
              fontSize: 11, fontWeight: 700, padding: '8px 16px', borderRadius: 20,
              display: 'inline-flex', alignItems: 'center', gap: 6,
              boxShadow: '0 6px 18px rgba(0,0,0,0.15)'
            }}>
              <Zap size={13} fill="#6EE7B7" /> Real-Time Attendance & Payroll Sync
            </div>

          </div>

          <div style={{ fontSize: 11, fontWeight: 600, color: '#0F172A', opacity: 0.85, zIndex: 1, textAlign: 'center' }}>
            Enterprise HR Portal • Registration
          </div>
        </div>

        {/* ── RIGHT COLUMN (Signup Form) ── */}
        <div style={{ padding: '40px 44px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          
          <div style={{ marginBottom: 20 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
              Create your Dayflow account
            </h1>
          </div>

          {/* Account Role Selector Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
            
            {/* Employee Card */}
            <div
              onClick={() => setSelectedRole('employee')}
              style={{
                padding: '12px 14px',
                borderRadius: 14,
                background: selectedRole === 'employee' ? '#FFFBEB' : '#F8FAFC',
                border: selectedRole === 'employee' ? '2px solid #F59E0B' : '1.5px solid #E2E8F0',
                cursor: 'pointer',
                transition: 'all 200ms ease',
                display: 'flex',
                alignItems: 'center',
                gap: 10
              }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: 10,
                background: selectedRole === 'employee' ? '#F59E0B' : '#E2E8F0',
                color: selectedRole === 'employee' ? '#FFFFFF' : '#64748B',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <Users size={16} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Employee</span>
                  {selectedRole === 'employee' && <CheckCircle2 size={14} color="#F59E0B" />}
                </div>
              </div>
            </div>

            {/* HR Officer Card */}
            <div
              onClick={() => setSelectedRole('hr')}
              style={{
                padding: '12px 14px',
                borderRadius: 14,
                background: selectedRole === 'hr' ? '#EFF6FF' : '#F8FAFC',
                border: selectedRole === 'hr' ? '2px solid #2563EB' : '1.5px solid #E2E8F0',
                cursor: 'pointer',
                transition: 'all 200ms ease',
                display: 'flex',
                alignItems: 'center',
                gap: 10
              }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: 10,
                background: selectedRole === 'hr' ? '#2563EB' : '#E2E8F0',
                color: selectedRole === 'hr' ? '#FFFFFF' : '#64748B',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <ShieldCheck size={16} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>HR Officer</span>
                  {selectedRole === 'hr' && <CheckCircle2 size={14} color="#2563EB" />}
                </div>
              </div>
            </div>

          </div>

          {/* Top Error Alert */}
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

          {/* Registration Form Controls */}
          <form onSubmit={handleSubmit}>
            
            {/* Employee ID Field (10% Visibility Faint Placeholder) */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>
                  Employee ID <span style={{ color: '#EF4444' }}>*</span>
                </label>
                {touched.employeeId && isEmployeeIdValid && (
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#10B981', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <CheckCircle2 size={13} /> Valid
                  </span>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  className="faint-input"
                  type="text"
                  placeholder="105"
                  value={employeeId}
                  onChange={e => setEmployeeId(e.target.value)}
                  onBlur={() => setTouched(t => ({ ...t, employeeId: true }))}
                  style={{
                    width: '100%',
                    height: 44,
                    padding: '0 14px 0 40px',
                    borderRadius: 12,
                    border: touched.employeeId && !isEmployeeIdValid ? '1.5px solid #EF4444' : '1.5px solid #E2E8F0',
                    fontSize: 13,
                    color: '#0F172A',
                    background: '#FFFFFF',
                    outline: 'none',
                    transition: 'all 200ms ease'
                  }}
                />
                <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: touched.employeeId && !isEmployeeIdValid ? '#EF4444' : '#94A3B8' }} />
              </div>
              {touched.employeeId && !isEmployeeIdValid && (
                <div style={{ fontSize: 11, color: '#EF4444', fontWeight: 600, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <AlertCircle size={12} /> Employee ID must be numeric (e.g. 105)
                </div>
              )}
            </div>

            {/* Work Email Field (10% Visibility Faint Placeholder) */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>
                  Work Email <span style={{ color: '#EF4444' }}>*</span>
                </label>
                {touched.email && isEmailValid && (
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#10B981', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <CheckCircle2 size={13} /> Valid
                  </span>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  className="faint-input"
                  type="email"
                  placeholder={selectedRole === 'employee' ? 'john@dayflow.io' : 'carla@dayflow.io'}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onBlur={() => setTouched(t => ({ ...t, email: true }))}
                  style={{
                    width: '100%',
                    height: 44,
                    padding: '0 14px 0 40px',
                    borderRadius: 12,
                    border: touched.email && !isEmailValid ? '1.5px solid #EF4444' : '1.5px solid #E2E8F0',
                    fontSize: 13,
                    color: '#0F172A',
                    background: '#FFFFFF',
                    outline: 'none',
                    transition: 'all 200ms ease'
                  }}
                />
                <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: touched.email && !isEmailValid ? '#EF4444' : '#94A3B8' }} />
              </div>
              {touched.email && !isEmailValid && (
                <div style={{ fontSize: 11, color: '#EF4444', fontWeight: 600, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <AlertCircle size={12} /> Please enter a valid work email address
                </div>
              )}
            </div>

            {/* Password Field (10% Visibility Faint Placeholder) */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>
                  Password <span style={{ color: '#EF4444' }}>*</span>
                </label>
                {touched.password && isPasswordValid && (
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#10B981', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <CheckCircle2 size={13} /> Valid
                  </span>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  className="faint-input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onBlur={() => setTouched(t => ({ ...t, password: true }))}
                  style={{
                    width: '100%',
                    height: 44,
                    padding: '0 42px 0 40px',
                    borderRadius: 12,
                    border: touched.password && !isPasswordValid ? '1.5px solid #EF4444' : '1.5px solid #E2E8F0',
                    fontSize: 13,
                    color: '#0F172A',
                    background: '#FFFFFF',
                    outline: 'none',
                    transition: 'all 200ms ease'
                  }}
                />
                <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: touched.password && !isPasswordValid ? '#EF4444' : '#94A3B8' }} />
                
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex', alignItems: 'center'
                  }}
                  aria-label="Toggle Password Visibility"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {touched.password && !isPasswordValid && (
                <div style={{ fontSize: 11, color: '#EF4444', fontWeight: 600, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <AlertCircle size={12} /> Password must be at least 6 characters long
                </div>
              )}
            </div>

            <ShinyButton
              type="submit"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {loading ? 'Creating Account...' : (
                <>
                  Complete Registration <ArrowRight size={16} />
                </>
              )}
            </ShinyButton>
          </form>

          {/* Professional Terms of Service & Privacy Policy Footer */}
          <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 20, textAlign: 'center', lineHeight: 1.5 }}>
            By registering, you agree to Dayflow&apos;s{' '}
            <a href="#" style={{ color: '#2563EB', fontWeight: 600, textDecoration: 'underline' }}>Terms of Service</a>{' '}
            and{' '}
            <a href="#" style={{ color: '#2563EB', fontWeight: 600, textDecoration: 'underline' }}>Privacy Policy</a>.
          </div>

          <div style={{ textAlign: 'center', marginTop: 14, fontSize: 13, color: '#64748B' }}>
            Already registered?{' '}
            <a href="/login" style={{ color: '#2563EB', fontWeight: 700 }}>Sign In</a>
          </div>

        </div>

      </div>
    </div>
  );
}
