import { NextResponse } from 'next/server';
import { hrLeaveRequests } from '@/lib/mockData';

export async function GET() {
  return NextResponse.json({
    data: hrLeaveRequests.map(r => ({
      id: parseInt(r.id) || 3001,
      employee: { id: parseInt(r.employee_id.replace('#','')) || 101, name: r.employee },
      leave_type: { id: 1, name: r.type },
      date_from: r.from,
      date_to: r.to,
      days: r.days,
      reason: r.reason,
      status: r.status.toLowerCase(),
      ai_flagged: r.ai_flagged,
      ai_score: r.ai_score
    })),
    pagination: { page: 1, page_size: 20, total: hrLeaveRequests.length, total_pages: 1 }
  });
}
