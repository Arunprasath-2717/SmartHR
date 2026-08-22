import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    data: {
      user_id: 10,
      employee_id: 101,
      name: "Carla Sanford",
      email: "carla@dayflow.io",
      role: "hr",
      roles: ["hr"]
    }
  });
}
