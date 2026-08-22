import { NextResponse } from 'next/server';
import { myLeaveRequests } from '@/lib/mockData';

export async function GET() {
  return NextResponse.json({
    data: myLeaveRequests.map(r => ({
      id: parseInt(r.id) || 3001,
      leave_type: { id: 1, name: r.type },
      date_from: r.from,
      date_to: r.to,
      days: r.days,
      reason: r.reason,
      status: r.status.toLowerCase(),
      created_at: r.created
    })),
    pagination: { page: 1, page_size: 20, total: myLeaveRequests.length, total_pages: 1 }
  });
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const newLeave = {
    id: Math.floor(Math.random() * 1000) + 3000,
    status: "pending",
    message: "Leave request submitted successfully.",
    leave_type_id: body.leave_type_id || 1,
    date_from: body.date_from || "2026-09-10",
    date_to: body.date_to || "2026-09-12",
    reason: body.reason || "Personal Leave"
  };
  return NextResponse.json({ data: newLeave }, { status: 201 });
}
