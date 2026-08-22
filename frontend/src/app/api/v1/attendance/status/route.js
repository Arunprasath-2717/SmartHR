import { NextResponse } from 'next/server';

let currentAttendance = {
  checked_in: false,
  attendance_id: null,
  check_in: null
};

export async function GET() {
  return NextResponse.json({ data: currentAttendance });
}
