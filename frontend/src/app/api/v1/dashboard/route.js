import { NextResponse } from 'next/server';
import { employeeDashboardData } from '@/lib/mockData';

export async function GET() {
  return NextResponse.json({
    data: {
      employee: {
        id: 101,
        name: "John Doe"
      },
      attendance: {
        checked_in: employeeDashboardData.checked_in,
        today_worked_hours: employeeDashboardData.today_worked_hours,
        monthly_worked_hours: employeeDashboardData.monthly_worked_hours
      },
      leave: {
        remaining_days: employeeDashboardData.leave_balance.annual,
        pending_requests: 1
      },
      payroll: {
        latest_payslip: {
          id: 9001,
          period: employeeDashboardData.payslip_period,
          net_salary: employeeDashboardData.net_salary,
          currency: "INR"
        }
      }
    }
  });
}
