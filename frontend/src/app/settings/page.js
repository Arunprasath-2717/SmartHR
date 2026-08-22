'use client';
import { useState } from 'react';
import { useToast } from '@/components/ui/Toast';
import { Lock, Check, Heart, Hexagon } from 'lucide-react';

const NAV_ITEMS = ['Profile', 'Notifications', 'Security', 'About'];

export default function SettingsPage() {
  const [activeNav, setActiveNav] = useState('Profile');
  const [saving, setSaving]       = useState(false);
  const [dirty, setDirty]         = useState(false);
  const [form, setForm] = useState({ name:'John Doe', email:'john@dayflow.io', phone:'+91 98765 43210', dept:'Engineering', title:'Software Engineer' });
  const [saved, setSaved] = useState('');
  const toast = useToast();

  const editableFields = { phone: true };

  const handleChange = (field, val) => {
    if (!editableFields[field]) return;
    setForm(f => ({ ...f, [field]: val }));
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    setSaving(false);
    setDirty(false);
    setSaved('phone');
    toast({ message:'Profile updated successfully!', type:'success' });
    setTimeout(() => setSaved(''), 2000);
  };

  return (
    <div className="page-wrapper page-in">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'220px 1fr', gap:24 }}>
        {/* Left Nav */}
        <div className="card" style={{ height:'fit-content', animation:'card-in 400ms ease-out 0ms both', overflow:'visible' }}>
          {NAV_ITEMS.map(item => (
            <button
              key={item}
              style={{
                display:'block', width:'100%', textAlign:'left', padding:'14px 20px',
                fontSize:13, fontWeight:500, cursor:'pointer', border:'none', background:'transparent',
                color: activeNav === item ? 'var(--accent)' : 'var(--text-primary)',
                borderLeft: activeNav === item ? '3px solid var(--accent)' : '3px solid transparent',
                background: activeNav === item ? 'var(--accent-10)' : 'transparent',
                transition:'all 200ms',
              }}
              onClick={() => setActiveNav(item)}
            >
              {item}
            </button>
          ))}
        </div>

        {/* Right Panel */}
        <div style={{ animation:'card-in 400ms ease-out 80ms both' }}>
          {activeNav === 'Profile' && (
            <div className="card">
              <div className="section-header">
                <span className="card-title">Profile Settings</span>
              </div>
              <div style={{ padding:24 }}>
                {/* Avatar */}
                <div style={{ display:'flex', alignItems:'center', gap:20, marginBottom:32, paddingBottom:24, borderBottom:'1px solid var(--border)' }}>
                  <div className="avatar avatar-2xl">JD</div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:16, marginBottom:4 }}>John Doe</div>
                    <div className="caption mb-12">Software Engineer · Engineering</div>
                    <button className="btn btn-ghost btn-sm">Change Photo</button>
                  </div>
                </div>

                {/* Fields */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
                  {[
                    { label:'Full Name',   key:'name',  editable:false },
                    { label:'Work Email',  key:'email', editable:false },
                    { label:'Work Phone',  key:'phone', editable:true  },
                    { label:'Department',  key:'dept',  editable:false },
                    { label:'Job Title',   key:'title', editable:false },
                  ].map((field, i) => (
                    <div key={field.key}>
                      <label style={{ display:'block', fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', color:'var(--text-muted)', marginBottom:6 }}>
                        {field.label}
                      </label>
                      <div style={{ position:'relative' }}>
                        <input
                          className="input"
                          value={form[field.key]}
                          readOnly={!field.editable}
                          onChange={e => handleChange(field.key, e.target.value)}
                          style={{
                            background: field.editable ? '#fff' : 'rgba(0,0,0,0.03)',
                            color: field.editable ? 'var(--text-primary)' : 'var(--text-muted)',
                            cursor: field.editable ? 'text' : 'default',
                          }}
                        />
                        {!field.editable && (
                          <span style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-light)', display:'flex', alignItems:'center' }}>
                            <Lock size={14} />
                          </span>
                        )}
                        {field.editable && saved === field.key && (
                          <span style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', fontSize:11, color:'var(--success)', fontWeight:600, display:'flex', alignItems:'center', gap:4 }}>
                            <Check size={14} /> Saved
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop:24, paddingTop:20, borderTop:'1px solid var(--border)' }}>
                  <button
                    className={`btn btn-primary ${!dirty || saving ? 'btn-disabled' : ''}`}
                    disabled={!dirty}
                    onClick={handleSave}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeNav === 'Notifications' && (
            <div className="card p-32" style={{ display:'flex', flexDirection:'column', gap:20 }}>
              <div className="card-title">Notification Preferences</div>
              {['Leave Approval Updates', 'Payslip Available', 'Attendance Reminders', 'AI Anomaly Alerts'].map((pref, i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 0', borderBottom:'1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontWeight:600, fontSize:13 }}>{pref}</div>
                    <div className="caption mt-2">Receive email and in-app notifications</div>
                  </div>
                  <label style={{ position:'relative', width:44, height:24, cursor:'pointer' }}>
                    <input type="checkbox" defaultChecked={i < 3} style={{ opacity:0, width:0, height:0 }} />
                    <span style={{ position:'absolute', inset:0, borderRadius:12, background:`var(--${i < 3 ? 'accent' : 'border-med'})`, transition:'background 200ms' }} />
                    <span style={{ position:'absolute', top:3, left: i < 3 ? 22 : 3, width:18, height:18, background:'#fff', borderRadius:50, transition:'left 200ms', boxShadow:'0 1px 3px rgba(0,0,0,0.2)' }} />
                  </label>
                </div>
              ))}
            </div>
          )}

          {activeNav === 'Security' && (
            <div className="card p-32">
              <div className="card-title mb-20">Security Settings</div>
              <div style={{ marginBottom:20 }}>
                <label className="label mb-8">Current Password</label>
                <input className="input" type="password" placeholder="••••••••" />
              </div>
              <div style={{ marginBottom:20 }}>
                <label className="label mb-8">New Password</label>
                <input className="input" type="password" placeholder="••••••••" />
              </div>
              <div style={{ marginBottom:24 }}>
                <label className="label mb-8">Confirm New Password</label>
                <input className="input" type="password" placeholder="••••••••" />
              </div>
              <button className="btn btn-primary" onClick={() => toast({ message:'Password updated!', type:'success' })}>Update Password</button>
            </div>
          )}

          {activeNav === 'About' && (
            <div className="card p-32 text-center" style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
              <Hexagon size={48} color="var(--accent)" style={{ marginBottom:16 }} />
              <div style={{ fontSize:24, fontWeight:800, letterSpacing:'-0.02em', marginBottom:8 }}>DayFlow HRMS</div>
              <div className="caption mb-4">Version 1.0.0</div>
              <div className="caption">Human Resource Management System</div>
              <div className="caption mt-4 flex items-center gap-4 justify-center">
                Built with <Heart size={14} color="#EF4444" fill="#EF4444" /> using Next.js
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
