'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();

const DEFAULT_USER = {
  user_id: 10,
  employee_id: 101,
  name: 'Carla Sanford',
  email: 'carla@dayflow.io',
  role: 'hr',
  roles: ['hr'],
  title: 'HR Officer',
  dept: 'Human Resources',
  initials: 'CS',
  work_phone: '+91 98765 43210',
  address: '123 Tech Park Blvd, Silicon Valley',
  salary_base: 85000,
  documents: [
    { name: 'Employment_Contract.pdf', size: '2.4 MB', date: '2024-01-15' },
    { name: 'Tax_Declaration_2026.pdf', size: '1.1 MB', date: '2026-04-01' },
  ]
};

export function AuthProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState(DEFAULT_USER);
  const [authenticated, setAuthenticated] = useState(true);

  // Safely restore user from localStorage after initial client hydration
  useEffect(() => {
    try {
      const saved = localStorage.getItem('dayflow_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          setUser(parsed);
        }
      }
    } catch (e) {
      console.warn('Could not restore auth user from localStorage', e);
    }
  }, []);

  useEffect(() => {
    if (user) {
      try {
        localStorage.setItem('dayflow_user', JSON.stringify(user));
      } catch (e) {}
    }
  }, [user]);

  const login = async (email, password) => {
    if (!email || !password) {
      throw new Error('Please fill in both email and password.');
    }
    // Determine role based on email or default to employee
    const isHr = email.toLowerCase().includes('hr') || email.toLowerCase().includes('carla') || email.toLowerCase().includes('admin');
    const newUser = {
      user_id: isHr ? 10 : 12,
      employee_id: isHr ? 101 : 102,
      name: isHr ? 'Carla Sanford' : 'John Doe',
      email: email,
      role: isHr ? 'hr' : 'employee',
      roles: [isHr ? 'hr' : 'employee'],
      title: isHr ? 'HR Officer' : 'Software Engineer',
      dept: isHr ? 'Human Resources' : 'Engineering',
      initials: isHr ? 'CS' : 'JD',
      work_phone: '+91 98765 43210',
      address: '123 Tech Park Blvd, Silicon Valley',
      salary_base: isHr ? 85000 : 75000,
      documents: [
        { name: 'Employment_Contract.pdf', size: '2.4 MB', date: '2024-01-15' },
        { name: 'Tax_Declaration_2026.pdf', size: '1.1 MB', date: '2026-04-01' },
      ]
    };

    setUser(newUser);
    setAuthenticated(true);
    router.push(newUser.role === 'hr' ? '/dashboard' : '/my-dashboard');
    return newUser;
  };

  const signup = async ({ employeeId, email, password, role }) => {
    if (!employeeId || !email || !password) {
      throw new Error('All fields are required.');
    }
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    const newUser = {
      user_id: Math.floor(Math.random() * 1000) + 20,
      employee_id: parseInt(employeeId) || 105,
      name: email.split('@')[0].replace('.', ' ').toUpperCase(),
      email: email,
      role: role || 'employee',
      roles: [role || 'employee'],
      title: role === 'hr' ? 'HR Specialist' : 'Team Member',
      dept: role === 'hr' ? 'Human Resources' : 'Operations',
      initials: email.slice(0, 2).toUpperCase(),
      work_phone: '+91 98765 00000',
      address: '456 Innovation Way',
      salary_base: 60000,
      documents: [
        { name: 'Joining_Letter.pdf', size: '1.8 MB', date: '2026-08-01' }
      ]
    };

    setUser(newUser);
    setAuthenticated(true);
    router.push(newUser.role === 'hr' ? '/dashboard' : '/my-dashboard');
    return newUser;
  };

  const logout = () => {
    setAuthenticated(false);
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('dayflow_user');
    }
    router.push('/login');
  };

  const updateProfile = (updates) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  return (
    <AuthContext.Provider value={{
      user,
      role: user?.role || 'employee',
      authenticated,
      login,
      signup,
      logout,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
