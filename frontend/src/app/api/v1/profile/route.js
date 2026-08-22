import { proxyToBackend } from '@/lib/api';

export async function GET(request) {
  return proxyToBackend(request, '/api/v1/profile');
}

export async function PATCH(request) {
  return proxyToBackend(request, '/api/v1/profile');
}
