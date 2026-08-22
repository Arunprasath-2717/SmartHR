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
    await new Promise(r => setTimeout(r, 1200));
    setSubmitting(false);
    setShowModal(false);
    toast({ message:`Employee "${form.name}" created successfully!`, type:'success' });
    setForm({ name:'', email:'', phone:'', dept:'', title:'', active:true });
  };

  return (
    <div className="page-wrapper page-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Employees</h1>
          <p className="caption mt-4">{filtered.length} employees</p>
        </div>
        <div className="page-header-right">
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              id="employee-search"
              className="input input-glass"
              placeholder="Search employees..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width:220 }}
            />
          </div>
          <select
            className="input"
            style={{ width:160 }}
            value={dept}
            onChange={e => setDept(e.target.value)}
          >
            {departments.map(d => <option key={d}>{d}</option>)}
          </select>
          <button className="btn btn-primary" onClick={() => setShowModal(true)} id="add-employee-btn">
            + Add Employee
          </button>
        </div>
      </div>

      {/* Employee Grid */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <h3>No employees found</h3>
          <p>No employees found for &ldquo;{search}&rdquo;. Try a different search.</p>
        </div>
      ) : (
        <div className="grid-4">
          {filtered.map((emp, i) => (
            <a
              key={emp.id}
              href={`/employees/${emp.id.replace('#','')}`}
              className="card"
              style={{
                padding:24, textDecoration:'none', display:'block',
                animation:`card-in 400ms ease-out ${i * 40}ms both`,
                cursor:'pointer',
              }}
            >
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
                <div className="avatar avatar-xl">{emp.initials}</div>
                <span className={`pill ${emp.active ? 'pill-active' : 'pill-inactive'}`}>● {emp.active ? 'Active' : 'Inactive'}</span>
              </div>
              <div style={{ fontWeight:700, fontSize:15, marginBottom:3 }}>{emp.name}</div>
              <div className="caption mb-8">{emp.title}</div>
              <span className="pill pill-info" style={{ fontSize:10 }}>{emp.dept}</span>
              <div className="caption mt-12 text-truncate" style={{ fontSize:11 }}>{emp.email}</div>
            </a>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="pagination mt-20">
        <span className="pagination-info">Showing 1–{filtered.length} of {filtered.length}</span>
        <div className="pagination-controls">
          <button className="page-btn">‹</button>
          <button className="page-btn active">1</button>
          <button className="page-btn">2</button>
          <button className="page-btn">›</button>
        </div>
      </div>

      {/* Create Employee Modal (Screen 05) */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add New Employee">
        <form onSubmit={handleSubmit}>
          {[
            { label:'Full Name *',  name:'name',  type:'text',  required:true  },
            { label:'Work Email *', name:'email', type:'email', required:true  },
            { label:'Work Phone',   name:'phone', type:'tel',   required:false },
            { label:'Job Title',    name:'title', type:'text',  required:false },
          ].map((field, i) => (
            <div
              key={field.name}
              className="form-group"
              style={{ animation:`card-in 300ms ease-out ${i*50}ms both` }}
            >
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
            <label htmlFor="emp-active" style={{ fontSize:13, fontWeight:500 }}>Active Employee</label>
          </div>
          <div className="flex gap-10 justify-between">
            <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
            <button
              type="submit"
              id="create-employee-submit"
              className={`btn btn-primary ${submitting ? 'btn-disabled' : ''}`}
              disabled={submitting}
            >
              {submitting ? (
                <span style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ animation:'spin 0.8s linear infinite', display:'inline-block' }}>⟳</span>
                  Creating...
                </span>
              ) : 'Create Employee'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
