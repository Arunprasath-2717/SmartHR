import './globals.css';
import { ToastProvider } from '@/components/ui/Toast';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';

export const metadata = {
  title: 'DayFlow HRMS — Smart HR Management',
  description: 'Human Resource Management System with AI-powered insights, attendance tracking, leave management and payroll.',
};

const CURRENT_ROLE = 'hr'; // Switch to 'employee' for employee view

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          <div className="app-shell">
            <Sidebar role={CURRENT_ROLE} />
            <main className="main-content">
              <TopBar />
              <div style={{ padding:'28px 32px' }}>
                {children}
              </div>
            </main>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
