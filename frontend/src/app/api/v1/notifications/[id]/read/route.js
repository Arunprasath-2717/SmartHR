import { proxyToBackend } from '@/lib/api';

export async function PATCH(request, { params }) {
  const { id } = await params;
  return proxyToBackend(request, `/api/v1/notifications/${id}/read`);
}
