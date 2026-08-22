import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    data: {
      id: 101,
      name: "Carla Sanford",
      work_email: "carla@dayflow.io",
      work_phone: "+91 98765 43210",
      job_title: "HR Officer",
      department: {
        id: 1,
        name: "Human Resources"
      },
      manager: {
        id: 25,
        name: "Jane Doe"
      },
      avatar_url: null
    }
  });
}

export async function PATCH(request) {
  const body = await request.json().catch(() => ({}));
  return NextResponse.json({
    data: {
      id: 101,
      work_phone: body.work_phone || "+91 98765 43210",
      address: body.address || "123 Tech Park Blvd"
    }
  });
}
