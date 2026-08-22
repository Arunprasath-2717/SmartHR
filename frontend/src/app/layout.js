import './globals.css';
import { ToastProvider } from '@/components/ui/Toast';
import { AuthProvider } from '@/context/AuthContext';
import AppWrapper from '@/components/layout/AppWrapper';

export const metadata = {
  title: 'Dayflow HRMS — Smart HR Management',
  description: 'Human Resource Management System with AI-powered insights, attendance tracking, leave management and payroll.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          <AuthProvider>
            <AppWrapper>
              {children}
            </AppWrapper>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
