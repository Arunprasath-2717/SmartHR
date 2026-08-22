import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    data: {
      authenticated: true,
      user_id: 10,
      employee_id: 101,
      role: "hr"
    }
  });
}
