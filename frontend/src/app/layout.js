import './globals.css';
import { ToastProvider } from '@/components/ui/Toast';
import Sidebar from '@/components/layout/Sidebar';

export const metadata = {
  title: 'DayFlow HRMS — Smart HR Management',
  description: 'Modern Human Resource Management System with attendance, leave, payroll, and AI-powered anomaly insights.',
};

// Role can be switched here — in real app comes from auth
const CURRENT_ROLE = 'hr'; // toggle to 'employee' to see employee views

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          <div className="app-shell">
            <Sidebar role={CURRENT_ROLE} />
            <main className="main-content">
              {children}
            </main>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
