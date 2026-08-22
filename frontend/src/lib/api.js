// -*- coding: utf-8 -*-
/**
 * Dayflow Frontend API Client & Server Proxy Helper
 * Connects Next.js 16 (Client & Route Handlers) to FastAPI Backend
 */
import { NextResponse } from 'next/server';

const FASTAPI_BASE_URL = process.env.BACKEND_API_URL || 'http://localhost:8000';

/**
 * Server-side proxy helper for Next.js Route Handlers to forward to FastAPI
 */
export async function proxyToBackend(request, backendPath, customMethod = null) {
  try {
    const url = new URL(request.url);
    const targetUrl = `${FASTAPI_BASE_URL}${backendPath}${url.search}`;
    const method = customMethod || request.method;

    const headers = new Headers();
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      headers.set('authorization', authHeader);
    }
    headers.set('content-type', 'application/json');

    let body = null;
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      try {
        const json = await request.json();
        body = JSON.stringify(json);
      } catch (e) {
        body = null;
      }
    }

    const resp = await fetch(targetUrl, {
      method,
      headers,
      body,
      cache: 'no-store'
    });

    const data = await resp.json().catch(() => ({}));
    return NextResponse.json(data, { status: resp.status });
  } catch (error) {
    console.error(`Proxy error connecting to FastAPI (${backendPath}):`, error);
    return NextResponse.json(
      { detail: 'Failed to communicate with Dayflow Backend service.', error: String(error) },
      { status: 502 }
    );
  }
}

/**
 * Client-side API request helper for React components & AuthContext
 */
export async function clientFetch(path, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('dayflow_token') : null;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Target relative path (Next.js route handler proxy) or direct backend
  const url = path.startsWith('http') ? path : (path.startsWith('/api') ? path : `/api/v1${path}`);

  const resp = await fetch(url, {
    ...options,
    headers
  });

  const json = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    const errorMsg = json?.detail || json?.message || `Request failed with status ${resp.status}`;
    const err = new Error(errorMsg);
    err.status = resp.status;
    err.data = json;
    throw err;
  }

  return json;
}
