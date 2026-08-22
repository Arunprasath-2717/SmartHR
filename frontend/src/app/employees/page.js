'use client';
import { useState } from 'react';
import { employeesList, departments } from '@/lib/mockData';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';

export default function EmployeesPage() {
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name:'', email:'', phone:'', dept:'', title:'', active:true });
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const filtered = employeesList.filter(e => {
    const matchSearch = !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.email.toLowerCase().includes(search.toLowerCase());
    const matchDept   = dept === 'All' || e.dept === dept;
    return matchSearch && matchDept;
  });

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1000));
    setSubmitting(false);
    setShowModal(false);
    toast({ message:`Employee "${form.name}" created successfully!`, type:'success' });
    setForm({ name:'', email:'', phone:'', dept:'', title:'', active:true });
  };

  return (
    <div className="page-in">
      {/* Header Bar */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Team Members</h1>
          <p className="text-muted text-sm mt-4">Managing {filtered.length} active employees across departments</p>
        </div>
        <div className="page-header-right">
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              id="employee-search"
              className="input"
              placeholder="Search team members..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width:240, borderRadius:20 }}
            />
          </div>
          <select
            className="input"
            style={{ width:160, borderRadius:20 }}
            value={dept}
            onChange={e => setDept(e.target.value)}
          >
            {departments.map(d => <option key={d}>{d}</option>)}
          </select>
          <button className="btn btn-primary" onClick={() => setShowModal(true)} id="add-employee-btn">
            + Add Member
          </button>
        </div>
      </div>

      {/* Employee Cards Grid */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <h3>No team members found</h3>
          <p>Try adjusting your search query or department filter.</p>
        </div>
      ) : (
        <div className="grid-4">
          {filtered.map((emp, i) => (
            <a
              key={emp.id}
              href={`/employees/${emp.id.replace('#','')}`}
              className="card card-3d"
              style={{
                padding:24, textDecoration:'none', display:'block',
                animation:`card-in-3d 500ms ease-out ${i * 45}ms both`,
              }}
            >
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
                <div className="avatar avatar-xl" style={{ background: `linear-gradient(135deg, ${['#3B82F6','#10B981','#8B5CF6','#F59E0B'][i % 4]}, ${['#1D4ED8','#059669','#6D28D9','#D97706'][i % 4]})` }}>
                  {emp.initials}
                </div>
                <span className={`pill ${emp.active ? 'pill-active' : 'pill-inactive'}`}>
                  ● {emp.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div style={{ fontWeight:700, fontSize:16, color:'#0F172A', marginBottom:3 }}>{emp.name}</div>
              <div style={{ fontSize:12, color:'#64748B', marginBottom:12 }}>{emp.title}</div>
              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:16 }}>
                <span className="pill pill-info" style={{ fontSize:10 }}>{emp.dept}</span>
                <span className="monospace text-xs text-muted">{emp.id}</span>
              </div>
              <div style={{ paddingTop:12, borderTop:'1px solid rgba(59,130,246,0.06)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span className="text-muted text-xs text-truncate" style={{ maxWidth:150 }}>{emp.email}</span>
                <span style={{ color:'#3B82F6', fontSize:14, fontWeight:700 }}>→</span>
              </div>
            </a>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="pagination mt-24">
        <span className="pagination-info">Showing 1–{filtered.length} of {filtered.length} team members</span>
        <div className="pagination-controls">
          <button className="page-btn">‹</button>
          <button className="page-btn active">1</button>
          <button className="page-btn">2</button>
          <button className="page-btn">›</button>
        </div>
      </div>

      {/* Create Employee Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add New Team Member">
        <form onSubmit={handleSubmit}>
          {[
            { label:'Full Name *',  name:'name',  type:'text',  required:true  },
            { label:'Work Email *', name:'email', type:'email', required:true  },
            { label:'Work Phone',   name:'phone', type:'tel',   required:false },
            { label:'Job Title',    name:'title', type:'text',  required:false },
          ].map((field, i) => (
            <div key={field.name} className="form-group" style={{ animation:`card-in 300ms ease-out ${i*50}ms both` }}>
              <input
                id={`emp-${field.name}`}
                className="input"
                type={field.type}
                required={field.required}
                placeholder=" "
                value={form[field.name]}
                onChange={e => setForm(f => ({ ...f, [field.name]: e.target.value }))}
                onFocus={e => e.target.closest('.form-group').classList.add('focused')}
                onBlur={e => {
                  const fg = e.target.closest('.form-group');
                  fg.classList.remove('focused');
                  if (e.target.value) fg.classList.add('has-value');
                  else fg.classList.remove('has-value');
                }}
              />
              <label htmlFor={`emp-${field.name}`}>{field.label}</label>
            </div>
          ))}
          <div className="form-group" style={{ animation:'card-in 300ms ease-out 200ms both' }}>
            <select
              id="emp-dept"
              className="input"
              value={form.dept}
              onChange={e => setForm(f => ({ ...f, dept: e.target.value }))}
            >
              <option value="">Select Department</option>
              {departments.filter(d => d !== 'All').map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-10 mb-20" style={{ animation:'card-in 300ms ease-out 250ms both' }}>
            <input
              type="checkbox" id="emp-active" checked={form.active}
              onChange={e => setForm(f => ({ ...f, active: e.target.checked }))}
              style={{ width:16, height:16, accentColor:'var(--accent)' }}
            />
            <label htmlFor="emp-active" style={{ fontSize:13, fontWeight:500 }}>Active Member</label>
          </div>
          <div className="flex gap-10 justify-between">
            <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
            <button
              type="submit"
              id="create-employee-submit"
              className={`btn btn-primary ${submitting ? 'btn-disabled' : ''}`}
              disabled={submitting}
            >
              {submitting ? 'Creating...' : 'Create Member'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
