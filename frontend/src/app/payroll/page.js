'use client';
import { hrPayrollList, hrPayrollKPIs } from '@/lib/mockData';
import { useCounter } from '@/hooks/useCounter';
import { getStatusClass } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function HRPayrollPage() {
  const router = useRouter();
  const totalIssued = useCounter(hrPayrollKPIs.total_issued, 1200, 0, true);
  const paid        = useCounter(hrPayrollKPIs.employees_paid, 1200, 0, true);
  const pending     = useCounter(hrPayrollKPIs.pending, 1200, 0, true);

  return (
    <div className="page-wrapper page-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Payroll</h1>
          <p className="caption mt-4">Manage and review employee payroll</p>
        </div>
        <div className="flex gap-10">
          <input type="month" className="input" style={{ width:160 }} defaultValue="2026-08" />
          <select className="input" style={{ width:140 }}><option>All Status</option><option>Paid</option><option>Pending</option></select>
        </div>
      </div>

      {/* KPI Glass Cards */}
      <div className="grid-3 mb-24">
        <div className="card-glass p-24" style={{ animation:'card-in 400ms ease-out 0ms both' }}>
          <div className="label mb-8">Total Payroll Issued</div>
          <div style={{ fontSize:36, fontWeight:700 }}>₹{totalIssued.toLocaleString('en-IN')}</div>
          <div className="caption mt-4">August 2026</div>
        </div>
        <div className="card-glass p-24" style={{ animation:'card-in 400ms ease-out 80ms both' }}>
          <div className="label mb-8">Employees Paid</div>
          <div style={{ fontSize:36, fontWeight:700, color:'var(--success)' }}>{paid}</div>
          <div className="caption mt-4">out of 120</div>
        </div>
        <div className="card-glass p-24" style={{ animation:'card-in 400ms ease-out 160ms both' }}>
          <div className="label mb-8">Pending Processing</div>
          <div style={{ fontSize:36, fontWeight:700, color:'var(--warning)' }}>{pending}</div>
          <div className="flex gap-6 mt-8">
            <span className="pulse-dot" style={{ color:'var(--warning)', width:8, height:8 }} />
            <span className="caption">Needs attention</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ animation:'card-in 400ms ease-out 240ms both' }}>
        <div className="section-header">
          <span className="card-title">All Payslips — August 2026</span>
          <button className="btn btn-ghost btn-sm">⬇ Export</button>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Employee</th><th>Period</th><th>Gross</th><th>Deductions</th><th>Net</th><th>Status</th><th></th>
            </tr>
          </thead>
          <tbody>
            {hrPayrollList.map((slip, i) => (
              <tr key={slip.id} style={{ animation:`card-in 300ms ease-out ${i*40}ms both`, cursor:'pointer' }}
                onClick={() => router.push('/my-payroll/1')}>
                <td>
                  <div className="flex items-center gap-8">
                    <div className="avatar avatar-sm">{slip.initials}</div>
                    <span style={{ fontWeight:600 }}>{slip.name}</span>
                  </div>
                </td>
                <td className="text-muted">{slip.period}</td>
                <td>₹{slip.gross.toLocaleString('en-IN')}</td>
                <td className="text-error">–₹{slip.deductions.toLocaleString('en-IN')}</td>
                <td style={{ fontWeight:700, fontSize:15, color:'var(--accent)' }}>₹{slip.net.toLocaleString('en-IN')}</td>
                <td><span className={`pill ${getStatusClass(slip.status)}`}>● {slip.status}</span></td>
                <td><button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); router.push('/my-payroll/1'); }}>View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
