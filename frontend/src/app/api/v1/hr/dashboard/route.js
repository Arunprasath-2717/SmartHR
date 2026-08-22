import { NextResponse } from 'next/server';
import { hrDashboardData } from '@/lib/mockData';

export async function GET() {
  return NextResponse.json({
    data: {
      employees: {
        total: hrDashboardData.total_employees,
        active: hrDashboardData.active_employees
      },
      attendance: {
        present_today: hrDashboardData.present_today,
        absent_today: hrDashboardData.absent_today,
        rate: hrDashboardData.attendance_rate
      },
      leaves: {
        pending: hrDashboardData.pending_leaves
      },
      anomalies: {
        total: hrDashboardData.ai_anomalies_total,
        high_risk: hrDashboardData.ai_high_risk
      }
    }
  });
}
