import { proxyToBackend } from '@/lib/api';

export async function GET(request, { params }) {
  const { id } = await params;
  return proxyToBackend(request, `/api/v1/payroll/${id}`);
}

export async function PATCH(request, { params }) {
  const { id } = await params;
  return proxyToBackend(request, `/api/v1/payroll/${id}`);
}
