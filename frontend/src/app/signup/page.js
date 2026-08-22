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
  Sparkles,
  CheckCircle2,
  Eye,
  EyeOff,
  TrendingUp,
  UserCheck
} from 'lucide-react';

export default function SignupPage() {
  const { signup } = useAuth();
  const [selectedRole, setSelectedRole] = useState('employee'); // 'employee' | 'hr'
  const [employeeId, setEmployeeId] = useState('105');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({ employeeId: false, email: false, password: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Field validators
  const isEmployeeIdValid = employeeId.trim().length > 0 && /^\d+$/.test(employeeId.trim());
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPasswordValid = password.length >= 6;
  const isFormValid = isEmployeeIdValid && isEmailValid && isPasswordValid;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ employeeId: true, email: true, password: true });
    setError('');

    if (!isEmployeeIdValid) {
      setError('Please enter a valid numeric Employee ID (e.g. 105).');
      return;
    }
    if (!isEmailValid) {
      setError('Please enter a valid work email address.');
      return;
    }
    if (!isPasswordValid) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      await signup({ employeeId, email, password, role: selectedRole });
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
      background: '#F8FAFC',
      backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)',
      backgroundSize: '24px 24px',
      position: 'relative',
      padding: 24
    }}>
      {/* 2-Column Auth Layout */}
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
          justify: 'space-between',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Subtle background radial pattern */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'radial-gradient(circle 300px at 0% 0%, rgba(255,255,255,0.25) 0%, transparent 80%)',
            pointerEvents: 'none'
          }} />

          {/* Top Brand Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, zIndex: 1 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: '#0F172A', color: '#FFD000',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(0,0,0,0.15)'
            }}>
              <Hexagon size={22} fill="#FFD000" />
            </div>
            <span style={{ fontSize: 24, fontWeight: 900, color: '#0F172A', letterSpacing: '-0.03em' }}>
              dayflow
            </span>
          </div>

          {/* 3D HR Showcase Graphics Area */}
          <div style={{ position: 'relative', margin: '24px 0', textAlign: 'center', zIndex: 1 }}>
            {/* Center Professional Avatar Card with Floating Node Badges */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: 24,
              padding: '24px 20px',
              boxShadow: '0 16px 40px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.8)',
              marginBottom: 20,
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              {/* Floating Live Sync Chip */}
              <div style={{
                position: 'absolute', top: -14, right: 16,
                background: '#0F172A', color: '#6EE7B7',
                fontSize: 10, fontWeight: 800, padding: '4px 10px', borderRadius: 20,
                display: 'flex', alignItems: 'center', gap: 4,
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
              }}>
                <UserCheck size={12} /> Instant Onboarding
              </div>

              {/* Persona Avatar */}
              <div style={{
                width: 68, height: 68, borderRadius: '50%',
                background: 'linear-gradient(135deg, #10B981, #059669)',
                color: '#fff', fontSize: 24, fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(16,185,129,0.3)',
                border: '3px solid #fff', marginBottom: 10
              }}>
                JD
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A' }}>John Doe</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#059669', background: '#ECFDF5', padding: '2px 10px', borderRadius: 20, marginTop: 4 }}>
                Software Engineer Candidate
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(0,0,0,0.06)', width: '100%', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#0F172A' }}>ID #105</div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Verified</div>
                </div>
                <div style={{ width: 1, height: 24, background: 'rgba(0,0,0,0.08)' }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#10B981', display: 'flex', alignItems: 'center', gap: 2 }}>
                    <TrendingUp size={12} /> Ready
                  </div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Portal</div>
                </div>
              </div>
            </div>

            {/* Floating pill badges grid */}
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

            {/* Bottom Showcase Card */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: 18,
              padding: '14px 18px',
              boxShadow: '0 10px 24px rgba(0,0,0,0.08)',
              border: '1px solid rgba(255,255,255,0.8)'
            }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Sparkles size={16} color="#F59E0B" /> Smart HRMS Engine
              </div>
              <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
                Supporting various employment & attendance types
              </div>
            </div>
          </div>

          {/* Bottom Footer Badge */}
          <div style={{ fontSize: 11, fontWeight: 600, color: '#0F172A', opacity: 0.85, zIndex: 1, textAlign: 'center' }}>
            Dayflow Enterprise v1.0 • Account Registration
          </div>
        </div>

        {/* ── RIGHT COLUMN (Account Registration & Validated Form) ── */}
        <div style={{ padding: '32px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          
          <div style={{ marginBottom: 16 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
              Create your Dayflow account
            </h1>
            <p style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>
              Register with your Employee ID and work credentials to access your portal
            </p>
          </div>

          {/* Account Role Selection Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
            
            {/* Card 1: Employee */}
            <div
              onClick={() => setSelectedRole('employee')}
              style={{
                padding: '12px 14px',
                borderRadius: 16,
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
                <div style={{ fontSize: 12, fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Employee</span>
                  {selectedRole === 'employee' && <CheckCircle2 size={14} color="#F59E0B" />}
                </div>
              </div>
            </div>

            {/* Card 2: HR Officer / Admin */}
            <div
              onClick={() => setSelectedRole('hr')}
              style={{
                padding: '12px 14px',
                borderRadius: 16,
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
                <div style={{ fontSize: 12, fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>HR Officer</span>
                  {selectedRole === 'hr' && <CheckCircle2 size={14} color="#2563EB" />}
                </div>
              </div>
            </div>

          </div>

          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 12,
              background: '#FEE2E2', border: '1px solid rgba(239,68,68,0.2)', color: '#991B1B',
              fontSize: 12, fontWeight: 600, marginBottom: 14
            }}>
              <AlertCircle size={16} flexShrink={0} />
              <span>{error}</span>
            </div>
          )}

          {/* Registration Form with Strict Alignment & Real-Time Validators */}
          <form onSubmit={handleSubmit}>
            
            {/* Employee ID Group */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569' }}>
                  Employee ID <span style={{ color: '#EF4444' }}>*</span>
                </label>
                {touched.employeeId && isEmployeeIdValid && (
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#10B981', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <CheckCircle2 size={13} /> Valid ID
                  </span>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  placeholder="e.g. 105"
                  value={employeeId}
                  onChange={e => {
                    setEmployeeId(e.target.value);
                    setTouched(t => ({ ...t, employeeId: true }));
                  }}
                  onBlur={() => setTouched(t => ({ ...t, employeeId: true }))}
                  style={{
                    width: '100%',
                    padding: '10px 14px 10px 40px',
                    borderRadius: 12,
                    border: touched.employeeId && !isEmployeeIdValid ? '1.5px solid #EF4444' : '1.5px solid #CBD5E1',
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

            {/* Work Email Group */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569' }}>
                  Work Email <span style={{ color: '#EF4444' }}>*</span>
                </label>
                {touched.email && isEmailValid && (
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#10B981', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <CheckCircle2 size={13} /> Valid Email
                  </span>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  required
                  placeholder="john@dayflow.io"
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value);
                    setTouched(t => ({ ...t, email: true }));
                  }}
                  onBlur={() => setTouched(t => ({ ...t, email: true }))}
                  style={{
                    width: '100%',
                    padding: '10px 14px 10px 40px',
                    borderRadius: 12,
                    border: touched.email && !isEmailValid ? '1.5px solid #EF4444' : '1.5px solid #CBD5E1',
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
                  <AlertCircle size={12} /> Please enter a valid email address (e.g. john@dayflow.io)
                </div>
              )}
            </div>

            {/* Password Group with Show/Hide Toggle */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569' }}>
                  Password <span style={{ color: '#EF4444' }}>*</span>
                </label>
                {touched.password && isPasswordValid && (
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#10B981', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <CheckCircle2 size={13} /> Valid Password
                  </span>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    setTouched(t => ({ ...t, password: true }));
                  }}
                  onBlur={() => setTouched(t => ({ ...t, password: true }))}
                  style={{
                    width: '100%',
                    padding: '10px 42px 10px 40px',
                    borderRadius: 12,
                    border: touched.password && !isPasswordValid ? '1.5px solid #EF4444' : '1.5px solid #CBD5E1',
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
              disabled={loading || (touched.email && !isFormValid)}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {loading ? 'Creating Account...' : (
                <>
                  Complete Registration <ArrowRight size={16} />
                </>
              )}
            </ShinyButton>
          </form>

          {/* Legal Notice Footer */}
          <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 14, textAlign: 'center', lineHeight: 1.5 }}>
            By registering, you accept the <a href="#" style={{ color: '#2563EB', fontWeight: 600 }}>Terms of Service</a> and acknowledge our <a href="#" style={{ color: '#2563EB', fontWeight: 600 }}>Privacy Policy</a>.
          </div>

          <div style={{ textAlign: 'center', marginTop: 12, fontSize: 13, color: '#64748B' }}>
            Already registered?{' '}
            <a href="/login" style={{ color: '#2563EB', fontWeight: 700 }}>Sign In</a>
          </div>

        </div>

      </div>
    </div>
  );
}
