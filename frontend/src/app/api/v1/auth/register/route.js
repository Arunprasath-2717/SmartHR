import { proxyToBackend } from '@/lib/api';

export async function POST(request) {
  return proxyToBackend(request, '/api/v1/auth/register');
}
