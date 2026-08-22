'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { ShieldAlert } from 'lucide-react';

const HR_ONLY_ROUTES = [
  '/dashboard',
  '/employees',
  '/leaves',
  '/payroll',
  '/analytics',
  '/ai-insights'
];

export default function AppWrapper({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { role, authenticated } = useAuth();
  const toast = useToast();

  const isAuthPage = pathname === '/login' || pathname === '/signup';

  const isHrRoute = HR_ONLY_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'));
  const isUnauthorized = role === 'employee' && isHrRoute;

  useEffect(() => {
    if (!authenticated && !isAuthPage) {
      router.push('/login');
      return;
    }

    if (isUnauthorized) {
      toast({ message: 'Access Denied: HR Officer privileges required.', type: 'error' });
      router.replace('/my-dashboard');
    }
  }, [authenticated, role, pathname, isUnauthorized, isAuthPage, router, toast]);

  if (isAuthPage) {
    return <>{children}</>;
  }

  if (isUnauthorized) {
    return (
      <div className="app-shell">
        <Sidebar role={role} />
        <main className="main-content">
          <TopBar />
          <div style={{ padding: '60px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#FEE2E2', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <ShieldAlert size={32} />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>403 — Access Restricted</h2>
            <p style={{ fontSize: 14, color: '#64748B', maxWidth: 400, marginBottom: 24 }}>
              This section is restricted to HR Officers only. Redirecting you to your Employee Dashboard...
            </p>
            <button className="btn btn-primary" onClick={() => router.push('/my-dashboard')}>
              Go to Employee Dashboard
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Sidebar role={role} />
      <main className="main-content">
        <TopBar />
        <div style={{ padding: '28px 32px', position: 'relative', zIndex: 1 }}>
          {children}
        </div>
      </main>
    </div>
  );
}
