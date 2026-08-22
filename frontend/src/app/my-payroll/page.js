'use client';
import { useState } from 'react';
import { myPayslips, payslipDetail } from '@/lib/mockData';
import { useCounter } from '@/hooks/useCounter';
import { getStatusClass } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function MyPayrollPage() {
  const d = payslipDetail;
  const netSalary = useCounter(d.net, 1200, 0, true);
  const gross = useCounter(d.gross, 1200, 0, true);
  const deductions = useCounter(d.total_deductions, 1200, 0, true);
  const router = useRouter();
  const maxVal = d.gross;

  return (
    <div className="page-wrapper page-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Payroll</h1>
          <p className="caption mt-4">View and download your payslips</p>
        </div>
      </div>

      {/* Latest Payslip Hero (Glass) */}
      <div className="card-glass p-32 mb-24" style={{ animation:'card-in 400ms ease-out 0ms both' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:32, alignItems:'center' }}>
          <div>
            <div className="label mb-8">{myPayslips[0].period}</div>
            <div style={{ fontSize:56, fontWeight:700, letterSpacing:'-0.03em', lineHeight:1 }}>
              ₹{netSalary.toLocaleString('en-IN')}
            </div>
            <div className="caption mt-4">Net Salary</div>
            <div className="flex gap-12 items-center mt-16">
              <span className="pill pill-paid">● {myPayslips[0].status}</span>
              <span className="caption">{myPayslips[0].from} – {myPayslips[0].to}, 2026</span>
            </div>
          </div>
          <div>
            {[
              { label:'Gross',       val: gross,       max: maxVal, color:'var(--info)' },
              { label:'Deductions',  val: deductions,  max: maxVal, color:'var(--error)' },
              { label:'Net',         val: netSalary,   max: maxVal, color:'var(--accent)' },
            ].map((row, i) => (
              <div key={i} style={{ marginBottom: i < 2 ? 16 : 0 }}>
                <div className="flex justify-between mb-4">
                  <span style={{ fontSize:12, fontWeight:500, color:'var(--text-muted)' }}>{row.label}</span>
                  <span style={{ fontSize:12, fontWeight:700 }}>₹{row.val.toLocaleString('en-IN')}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ background: row.color, width:`${(row.val / maxVal) * 100}%` }} />
                </div>
              </div>
            ))}
            <button className="btn btn-ghost mt-16" onClick={() => router.push(`/my-payroll/1`)}>View Details →</button>
          </div>
        </div>
      </div>

      {/* Payslip History */}
      <div className="card" style={{ animation:'card-in 400ms ease-out 200ms both' }}>
        <div className="section-header">
          <span className="card-title">Payslip History</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Period</th><th>Date Range</th><th>Gross</th><th>Deductions</th><th>Net</th><th>Status</th><th></th>
            </tr>
          </thead>
          <tbody>
            {myPayslips.map((slip, i) => (
              <tr key={slip.id} style={{ animation:`card-in 300ms ease-out ${i*50}ms both`, cursor:'pointer' }}
                onClick={() => router.push(`/my-payroll/${slip.id}`)}>
                <td style={{ fontWeight:600 }}>{slip.period}</td>
                <td className="text-muted text-sm">{slip.from} – {slip.to}</td>
                <td>₹{slip.gross.toLocaleString('en-IN')}</td>
                <td className="text-error">–₹{slip.deductions.toLocaleString('en-IN')}</td>
                <td style={{ fontWeight:700, fontSize:15 }}>₹{slip.net.toLocaleString('en-IN')}</td>
                <td><span className={`pill ${getStatusClass(slip.status)}`}>● {slip.status}</span></td>
                <td><button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); router.push(`/my-payroll/${slip.id}`); }}>View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
