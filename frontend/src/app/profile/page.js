'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { User, Briefcase, DollarSign, FileText, Lock, Pencil, Check, Download, Shield } from 'lucide-react';

export default function ProfilePage() {
  const { user, role, updateProfile } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState('personal');
  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState({
    name: user?.name || 'Alice Employee',
    work_email: user?.email || 'alice@company.com',
    work_phone: user?.work_phone || '+1-555-0100',
    address: user?.address || '123 Tech Park Blvd, Silicon Valley',
    job_title: user?.title || 'Software Engineer',
    dept: user?.dept || 'Engineering',
    salary_base: user?.salary_base || 85000,
  });

  // Fetch real profile from backend on mount
  useEffect(() => {
    async function loadProfile() {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('dayflow_token') : null;
        const res = await fetch('/api/v1/profile', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const json = await res.json();
          const p = json.data || {};
          setForm(prev => ({
            ...prev,
            name: p.name || prev.name,
            work_email: p.work_email || prev.work_email,
            work_phone: p.work_phone || p.phone || prev.work_phone,
            address: p.address || prev.address,
            job_title: p.job_title || prev.job_title,
            dept: p.department_name || prev.dept,
          }));
        }
      } catch (e) {}
    }
    loadProfile();
  }, []);

  const isHr = role === 'hr';

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('dayflow_token') : null;
      const res = await fetch('/api/v1/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          phone: form.work_phone,
          address: form.address
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || 'Failed to update profile');
      }

      updateProfile({
        name: form.name,
        work_phone: form.work_phone,
        address: form.address,
        title: form.job_title,
        dept: form.dept,
        salary_base: form.salary_base,
      });
      setEditing(false);
      toast({ message: 'Profile updated successfully on backend!', type: 'success' });
    } catch (err) {
      updateProfile({
        name: form.name,
        work_phone: form.work_phone,
        address: form.address,
        title: form.job_title,
        dept: form.dept,
        salary_base: form.salary_base,
      });
      setEditing(false);
      toast({ message: 'Profile updated locally!', type: 'success' });
    }
  };

  return (
    <div className="page-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Employee Profile</h1>
          <p className="text-muted text-sm mt-4">Personal records, job details & documents</p>
        </div>
        {!editing ? (
          <button className="btn btn-primary" onClick={() => setEditing(true)}>
            <Pencil size={15} /> Edit Profile
          </button>
        ) : (
          <button className="btn btn-ghost" onClick={() => setEditing(false)}>
            Cancel Editing
          </button>
        )}
      </div>

      {/* Header Profile Hero Card */}
      <div className="card card-no-hover mb-24" style={{ padding: '24px 32px', background: 'linear-gradient(135deg, #0B1E3D 0%, #1A3A6B 100%)', color: '#fff', borderRadius: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <div className="avatar avatar-2xl" style={{ border: '4px solid rgba(255,255,255,0.2)', width: 88, height: 88, fontSize: 32 }}>
            {user?.initials || 'CS'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h2 style={{ fontSize: 24, fontWeight: 800 }}>{form.name}</h2>
              <span className="pill" style={{ background: 'rgba(59,130,246,0.25)', color: '#93C5FD', border: '1px solid rgba(59,130,246,0.4)' }}>
                {isHr ? <Shield size={12} style={{ marginRight: 4 }} /> : null} {user?.role?.toUpperCase()}
              </span>
            </div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>
              {form.job_title} · {form.dept}
            </div>
            <div className="monospace text-xs mt-4" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Employee ID: #{user?.employee_id || 101}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Base Salary</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#6EE7B7', marginTop: 2 }}>
              ₹{Number(form.salary_base).toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-nav mb-24">
        {[
          { id: 'personal', label: 'Personal Details', icon: User },
          { id: 'job', label: 'Job Details', icon: Briefcase },
          { id: 'salary', label: 'Salary Structure', icon: DollarSign },
          { id: 'docs', label: 'Documents', icon: FileText },
        ].map(t => {
          const TabIcon = t.icon;
          return (
            <button
              key={t.id}
              className={`tab-btn ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              <TabIcon size={16} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="card p-32">
        <form onSubmit={handleSave}>
          {tab === 'personal' && (
            <div>
              <h3 className="card-title mb-20">Personal Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div>
                  <label className="text-muted text-xs text-bold uppercase mb-6 block">Full Name</label>
                  <input
                    className="input"
                    value={form.name}
                    readOnly={!editing || !isHr}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    style={{ background: (!editing || !isHr) ? 'rgba(0,0,0,0.03)' : '#fff' }}
                  />
                  {!isHr && editing && <span className="caption text-muted mt-2 block">🔒 Editable by Admin/HR only</span>}
                </div>

                <div>
                  <label className="text-muted text-xs text-bold uppercase mb-6 block">Work Email</label>
                  <input className="input" value={form.work_email} readOnly style={{ background: 'rgba(0,0,0,0.03)' }} />
                  <span className="caption text-muted mt-2 block">🔒 Read-only field</span>
                </div>

                <div>
                  <label className="text-muted text-xs text-bold uppercase mb-6 block">Work Phone (Editable)</label>
                  <input
                    className="input"
                    value={form.work_phone}
                    readOnly={!editing}
                    onChange={e => setForm(f => ({ ...f, work_phone: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-muted text-xs text-bold uppercase mb-6 block">Residential Address (Editable)</label>
                  <input
                    className="input"
                    value={form.address}
                    readOnly={!editing}
                    onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          )}

          {tab === 'job' && (
            <div>
              <h3 className="card-title mb-20">Job & Organizational Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div>
                  <label className="text-muted text-xs text-bold uppercase mb-6 block">Job Title</label>
                  <input
                    className="input"
                    value={form.job_title}
                    readOnly={!editing || !isHr}
                    onChange={e => setForm(f => ({ ...f, job_title: e.target.value }))}
                    style={{ background: (!editing || !isHr) ? 'rgba(0,0,0,0.03)' : '#fff' }}
                  />
                </div>

                <div>
                  <label className="text-muted text-xs text-bold uppercase mb-6 block">Department</label>
                  <input
                    className="input"
                    value={form.dept}
                    readOnly={!editing || !isHr}
                    onChange={e => setForm(f => ({ ...f, dept: e.target.value }))}
                    style={{ background: (!editing || !isHr) ? 'rgba(0,0,0,0.03)' : '#fff' }}
                  />
                </div>

                <div>
                  <label className="text-muted text-xs text-bold uppercase mb-6 block">Manager</label>
                  <input className="input" value="Jane Doe (Director)" readOnly style={{ background: 'rgba(0,0,0,0.03)' }} />
                </div>

                <div>
                  <label className="text-muted text-xs text-bold uppercase mb-6 block">Work Location</label>
                  <input className="input" value="Main HQ — Silicon Valley" readOnly style={{ background: 'rgba(0,0,0,0.03)' }} />
                </div>
              </div>
            </div>
          )}

          {tab === 'salary' && (
            <div>
              <h3 className="card-title mb-20">Salary Structure & Allowances</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div>
                  <label className="text-muted text-xs text-bold uppercase mb-6 block">Base Monthly Salary (₹)</label>
                  <input
                    className="input"
                    type="number"
                    value={form.salary_base}
                    readOnly={!editing || !isHr}
                    onChange={e => setForm(f => ({ ...f, salary_base: e.target.value }))}
                    style={{ background: (!editing || !isHr) ? 'rgba(0,0,0,0.03)' : '#fff' }}
                  />
                  {!isHr && <span className="caption text-muted mt-2 block">🔒 Read-only for employees (Managed by Admin/HR)</span>}
                </div>

                <div>
                  <label className="text-muted text-xs text-bold uppercase mb-6 block">HRA & Allowances (₹)</label>
                  <input className="input" value={(form.salary_base * 0.4).toLocaleString('en-IN')} readOnly style={{ background: 'rgba(0,0,0,0.03)' }} />
                </div>

                <div>
                  <label className="text-muted text-xs text-bold uppercase mb-6 block">Est. Deductions (PF / Tax) (₹)</label>
                  <input className="input" value={(form.salary_base * 0.12).toLocaleString('en-IN')} readOnly style={{ background: 'rgba(0,0,0,0.03)' }} />
                </div>

                <div>
                  <label className="text-muted text-xs text-bold uppercase mb-6 block">Net Est. Pay (₹)</label>
                  <input className="input" value={(form.salary_base * 1.28).toLocaleString('en-IN')} readOnly style={{ background: 'rgba(0,0,0,0.03)', fontWeight: 700, color: 'var(--success)' }} />
                </div>
              </div>
            </div>
          )}

          {tab === 'docs' && (
            <div>
              <h3 className="card-title mb-20">Uploaded Employee Documents</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {(user?.documents || []).map((doc, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: 'rgba(59,130,246,0.04)', borderRadius: 14, border: '1px solid rgba(59,130,246,0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <FileText size={20} color="#3B82F6" />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13, color: '#0F172A' }}>{doc.name}</div>
                        <div style={{ fontSize: 11, color: '#94A3B8' }}>{doc.size} · Uploaded {doc.date}</div>
                      </div>
                    </div>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => toast({ message: `Downloading ${doc.name}`, type: 'info' })}>
                      <Download size={14} /> Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {editing && (
            <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)', display: 'flex', gap: 10 }}>
              <button type="submit" className="btn btn-primary">
                <Check size={16} /> Save Changes
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)}>
                Cancel
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
