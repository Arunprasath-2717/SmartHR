'use client';
import { useState } from 'react';
import { myLeaveBalance, myLeaveRequests } from '@/lib/mockData';
import { DonutChart } from '@/components/charts/Charts';
import { getStatusClass } from '@/lib/utils';
import Drawer from '@/components/ui/Drawer';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { CalendarDays, Check, X, Plus } from 'lucide-react';

const STATUS_FILTERS = ['All','Pending','Approved','Rejected','Cancelled'];

export default function MyLeavesPage() {
  const [filter, setFilter]       = useState('All');
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [cancelModal, setCancelModal]     = useState(false);
  const [drawerOpen, setDrawerOpen]       = useState(false);
  const toast = useToast();

  const filtered = myLeaveRequests.filter(l => filter === 'All' || l.status === filter);

  const openDrawer = (leave) => { setSelectedLeave(leave); setDrawerOpen(true); };

  const handleCancel = () => {
    setCancelModal(false);
    setDrawerOpen(false);
    toast({ message:'Leave request cancelled successfully.', type:'success' });
  };

  const getStep = (status) => {
    if (status === 'Pending')   return 1;
    if (status === 'Approved' || status === 'Rejected') return 2;
    if (status === 'Cancelled') return -1;
    return 0;
  };

  return (
    <div className="page-wrapper page-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Leaves</h1>
          <p className="caption mt-4">Track and manage your leave requests</p>
        </div>
        <button className="btn btn-primary" onClick={() => toast({ message:'Leave application form coming soon!', type:'info' })}>
          <Plus size={15} /> Apply for Leave
        </button>
      </div>

      {/* Leave Balance Row */}
      <div className="grid-3 mb-24">
        {myLeaveBalance.map((bal, i) => (
          <div key={i} className="card-glass p-24" style={{ animation:`card-in 400ms ease-out ${i*80}ms both` }}>
            <div className="label mb-12">{bal.type}</div>
            <div style={{ display:'flex', alignItems:'center', gap:16 }}>
              <DonutChart value={bal.remaining} max={bal.total} size={80} stroke={8}>
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontSize:20, fontWeight:700 }}>{bal.remaining}</div>
                </div>
              </DonutChart>
              <div>
                <div style={{ fontSize:13, fontWeight:600, marginBottom:4 }}>{bal.remaining} remaining</div>
                <div className="caption">Used: {bal.used} / {bal.total}</div>
                <div className="progress-bar mt-8" style={{ width:80 }}>
                  <div className="progress-fill" style={{ width:`${(bal.used/bal.total)*100}%` }} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="flex justify-between items-center mb-16 flex-wrap gap-12">
        <div className="filter-pills">
          {STATUS_FILTERS.map(s => (
            <button key={s} className={`filter-pill ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>{s}</button>
          ))}
        </div>
      </div>

      {/* Leave Requests Table */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon text-muted">
            <CalendarDays size={48} />
          </div>
          <h3>No leave requests</h3>
          <p>Apply for your first leave to get started.</p>
          <button className="btn btn-primary mt-16">
            <Plus size={15} /> Apply for Leave
          </button>
        </div>
      ) : (
        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th><input type="checkbox" style={{ accentColor:'var(--accent)' }} /></th>
                <th>Leave Type</th><th>Date Range</th><th>Days</th><th>Reason</th><th>Status</th><th>Created</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((leave, i) => (
                <tr
                  key={leave.id}
                  style={{ animation:`card-in 300ms ease-out ${i*40}ms both`, cursor:'pointer' }}
                  onClick={() => openDrawer(leave)}
                >
                  <td onClick={e => e.stopPropagation()}><input type="checkbox" style={{ accentColor:'var(--accent)' }} /></td>
                  <td><span className="pill pill-info">{leave.type}</span></td>
                  <td className="text-sm">{leave.from} → {leave.to}</td>
                  <td style={{ fontWeight:700 }}>{leave.days}d</td>
                  <td className="text-muted text-sm text-truncate" style={{ maxWidth:160 }}>{leave.reason}</td>
                  <td>
                    <span className={`pill ${getStatusClass(leave.status)}`}>
                      {leave.status === 'Pending' && <span className="pulse-dot" />}
                      {leave.status}
                    </span>
                  </td>
                  <td className="caption">{leave.created}</td>
                  <td onClick={e => e.stopPropagation()}>
                    {leave.status === 'Pending' && (
                      <button
                        className="btn btn-ghost-danger btn-sm"
                        onClick={() => { setSelectedLeave(leave); setCancelModal(true); }}
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Leave Detail Drawer */}
      <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} title={`Leave Request #${selectedLeave?.id}`} width={420}>
        {selectedLeave && (
          <div>
            {/* Status Badge */}
            <div style={{ textAlign:'center', marginBottom:24 }}>
              <span className={`pill ${getStatusClass(selectedLeave.status)}`} style={{ fontSize:14, padding:'8px 20px' }}>
                {selectedLeave.status === 'Pending' && <span className="pulse-dot" />}
                {selectedLeave.status}
              </span>
            </div>

            {/* Leave Information */}
            <div className="card-title mb-12">Leave Information</div>
            <div className="card" style={{ padding:'0 16px' }}>
              {[
                { label:'Leave Type', value:<span className="pill pill-info">{selectedLeave.type}</span> },
                { label:'From',       value:selectedLeave.from },
                { label:'To',         value:selectedLeave.to },
                { label:'Duration',   value:<strong>{selectedLeave.days} days</strong> },
                { label:'Submitted',  value:selectedLeave.created },
              ].map((row, i) => (
                <div key={i} className="info-row">
                  <span className="info-label">{row.label}</span>
                  <span className="info-value">{row.value}</span>
                </div>
              ))}
              <div className="info-row">
                <span className="info-label">Reason</span>
                <div style={{ background:'rgba(0,0,0,0.04)', borderLeft:'3px solid var(--accent)', borderRadius:4, padding:'8px 12px', fontSize:13, marginTop:4, color:'var(--text-muted)' }}>
                  {selectedLeave.reason}
                </div>
              </div>
            </div>

            {/* Status Timeline */}
            <div className="card-title mb-12 mt-24">Status Timeline</div>
            <div style={{ display:'flex', alignItems:'flex-start', gap:0, padding:'8px 0' }}>
              {['Submitted','Under Review','Decision'].map((step, i) => {
                const stepNum = getStep(selectedLeave.status);
                const done = i < stepNum;
                const active = i === stepNum;
                return (
                  <div key={i} style={{ display:'flex', alignItems:'center', flex: i < 2 ? 1 : 0, flexDirection: i < 2 ? 'row' : undefined }}>
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', flexShrink:0 }}>
                      <div style={{
                        width:32, height:32, borderRadius:'50%', border:`2px solid ${done ? 'var(--success)' : active ? 'var(--accent)' : 'rgba(0,0,0,0.12)'}`,
                        background: done ? 'var(--success)' : active ? 'var(--accent)' : '#fff',
                        color: done || active ? '#fff' : 'var(--text-muted)',
                        display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700,
                        ...(active ? { animation:'step-pulse 2s ease-in-out infinite' } : {}),
                      }}>
                        {done ? <Check size={14} /> : i + 1}
                      </div>
                      <span style={{ fontSize:10, color:'var(--text-muted)', marginTop:4, whiteSpace:'nowrap' }}>{step}</span>
                    </div>
                    {i < 2 && <div style={{ flex:1, height:2, background: done ? 'var(--success)' : 'rgba(0,0,0,0.1)', transition:'background 400ms' }} />}
                  </div>
                );
              })}
            </div>

            {/* Rejection reason */}
            {selectedLeave.status === 'Rejected' && selectedLeave.rejection_reason && (
              <div style={{ background:'var(--error-10)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:12, padding:16, marginTop:16 }}>
                <div style={{ fontWeight:700, color:'var(--error)', marginBottom:6, display:'flex', alignItems:'center', gap:6 }}>
                  <X size={16} /> Rejected
                </div>
                <div style={{ fontSize:13, color:'var(--text-muted)' }}>Reason: {selectedLeave.rejection_reason}</div>
              </div>
            )}

            {/* Approved callout */}
            {selectedLeave.status === 'Approved' && (
              <div style={{ background:'var(--success-10)', border:'1px solid rgba(34,197,94,0.2)', borderRadius:12, padding:16, marginTop:16 }}>
                <div style={{ fontWeight:700, color:'var(--success)', display:'flex', alignItems:'center', gap:6 }}>
                  <Check size={16} /> Approved
                </div>
              </div>
            )}

            {/* Cancel footer */}
            {selectedLeave.status === 'Pending' && (
              <div style={{ marginTop:32, paddingTop:20, borderTop:'1px solid var(--border)' }}>
                <button className="btn btn-ghost-danger" style={{ width:'100%', justifyContent:'center' }} onClick={() => setCancelModal(true)}>
                  Cancel Request
                </button>
              </div>
            )}
          </div>
        )}
      </Drawer>

      {/* Cancel Confirm Modal */}
      <Modal isOpen={cancelModal} onClose={() => setCancelModal(false)} title="Cancel Leave Request" width={380}>
        <p style={{ fontSize:14, color:'var(--text-muted)', marginBottom:24 }}>
          Are you sure you want to cancel this leave request? This action cannot be undone.
        </p>
        <div className="flex gap-10 justify-between">
          <button className="btn btn-ghost" onClick={() => setCancelModal(false)}>Keep Request</button>
          <button className="btn btn-danger" onClick={handleCancel}>Yes, Cancel</button>
        </div>
      </Modal>
    </div>
  );
}
