import { NextResponse } from 'next/server';

export async function POST() {
  const checkOutTime = new Date().toISOString();
  return NextResponse.json({
    data: {
      attendance_id: 5001,
      check_out: checkOutTime,
      worked_hours: 8.5,
      status: "completed"
    }
  });
}
