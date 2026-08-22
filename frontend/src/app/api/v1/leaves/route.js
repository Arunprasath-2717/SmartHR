import { proxyToBackend } from '@/lib/api';

export async function GET(request) {
  return proxyToBackend(request, '/api/v1/leave');
}

export async function POST(request) {
  return proxyToBackend(request, '/api/v1/leave');
}
