import { NextResponse } from 'next/server';

export async function POST() {
  const checkInTime = new Date().toISOString();
  return NextResponse.json({
    data: {
      attendance_id: 5001,
      check_in: checkInTime,
      status: "checked_in"
    }
  }, { status: 201 });
}
