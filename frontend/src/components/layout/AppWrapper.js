'use client';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';

export default function AppWrapper({ children }) {
  const pathname = usePathname();
  const { role } = useAuth();

  const isAuthPage = pathname === '/login' || pathname === '/signup';

  if (isAuthPage) {
    return <>{children}</>;
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
