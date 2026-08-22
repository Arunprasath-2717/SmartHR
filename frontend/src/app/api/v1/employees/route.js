import { NextResponse } from 'next/server';
import { employeesList } from '@/lib/mockData';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('page_size') || '20');
  const search = (searchParams.get('search') || '').toLowerCase();

  const filtered = employeesList.filter(e =>
    !search || e.name.toLowerCase().includes(search) || e.email.toLowerCase().includes(search)
  );

  return NextResponse.json({
    data: filtered.map(e => ({
      id: parseInt(e.id.replace('#','')) || 101,
      name: e.name,
      email: e.email,
      department: e.dept,
      job_title: e.title,
      active: e.active
    })),
    pagination: {
      page,
      page_size: pageSize,
      total: filtered.length,
      total_pages: Math.ceil(filtered.length / pageSize)
    }
  });
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const newEmp = {
    id: Math.floor(Math.random() * 900) + 100,
    name: body.name || "New Employee",
    work_email: body.work_email || "new@dayflow.io",
    work_phone: body.work_phone || "+91 98765 00000",
    department: body.department_id || 5,
    job_title: body.job_title || "Software Engineer"
  };
  return NextResponse.json({ data: newEmp }, { status: 201 });
}
