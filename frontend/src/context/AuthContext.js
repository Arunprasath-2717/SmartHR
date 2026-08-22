'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const AuthContext = createContext(null);
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

  // Safely restore user & token from localStorage after initial client hydration
  useEffect(() => {
    let isMounted = true;
    queueMicrotask(() => {
      try {
        const savedUser = localStorage.getItem('dayflow_user');
        const savedToken = localStorage.getItem('dayflow_token');
        if (savedUser && isMounted) {
          const parsed = JSON.parse(savedUser);
          if (parsed && typeof parsed === 'object') {
            setUser(parsed);
          }
        }
        if (savedToken && isMounted) {
          setAuthenticated(true);
        }
      } catch (e) {
        console.warn('Could not restore auth state from localStorage', e);
      }
    });
    return () => { isMounted = false; };
  }, []);

  const login = async (email, password, explicitRole) => {
    if (!email || !password) {
      throw new Error('Please fill in both email and password.');
    }

    try {
      // 1. Authenticate with real FastAPI backend
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: email, password })
      });

      const resData = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(resData?.detail || 'Invalid login credentials.');
      }

      const tokenData = resData.data;
      const accessToken = tokenData.access_token;
      const backendUser = tokenData.user;

      if (typeof window !== 'undefined') {
        localStorage.setItem('dayflow_token', accessToken);
      }

      // 2. Fetch full profile and identity from backend
      let profileData = {};
      try {
        const profRes = await fetch('/api/v1/profile', {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        if (profRes.ok) {
          const profJson = await profRes.json();
          profileData = profJson.data || {};
        }
      } catch (e) {}

      const userRole = backendUser.role || explicitRole || (email.toLowerCase().includes('hr') || email.toLowerCase().includes('admin') || email.toLowerCase().includes('bob') ? 'hr' : 'employee');
      const isHr = userRole === 'hr';

      const fullUser = {
        user_id: backendUser.id,
        employee_id: profileData.id || backendUser.id,
        name: profileData.name || backendUser.name,
        email: backendUser.login || email,
        role: userRole,
        roles: [userRole],
        title: profileData.job_title || (isHr ? 'HR Officer' : 'Software Engineer'),
        dept: profileData.department_name || (isHr ? 'Human Resources' : 'Engineering'),
        initials: (profileData.name || backendUser.name || 'US').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
        work_phone: profileData.work_phone || profileData.phone || '+91 98765 43210',
        address: profileData.address || 'Tech City Campus',
        salary_base: 85000,
        documents: [
          { name: 'Employment_Contract.pdf', size: '2.4 MB', date: '2024-01-15' },
          { name: 'Tax_Declaration_2026.pdf', size: '1.1 MB', date: '2026-04-01' },
        ]
      };

      setUser(fullUser);
      setAuthenticated(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem('dayflow_user', JSON.stringify(fullUser));
      }
      router.push(isHr ? '/dashboard' : '/my-dashboard');
      return fullUser;
    } catch (err) {
      console.warn('Real backend auth failed, evaluating fallback:', err.message);
      throw err;
    }
  };

  const switchRole = (newRole) => {
    const targetRole = newRole || (user?.role === 'hr' ? 'employee' : 'hr');
    const isHr = targetRole === 'hr';
    const updatedUser = {
      ...(user || DEFAULT_USER),
      role: targetRole,
      roles: [targetRole],
      name: isHr ? 'Bob Manager' : 'Alice Employee',
      initials: isHr ? 'BM' : 'AE',
      title: isHr ? 'HR Officer' : 'Software Engineer',
      dept: isHr ? 'Human Resources' : 'Engineering',
      email: isHr ? 'bob@company.com' : 'alice@company.com'
    };

    setUser(updatedUser);
    setAuthenticated(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dayflow_user', JSON.stringify(updatedUser));
    }
    router.push(isHr ? '/dashboard' : '/my-dashboard');
  };

  const signup = async ({ name, employeeId, email, password, phone, address, job_title, role }) => {
    if (!email || !password) {
      throw new Error('Email and password are required.');
    }
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    const displayName = name || email.split('@')[0].replace('.', ' ');
    const res = await fetch('/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: displayName,
        email: email,
        password: password,
        phone: phone || '+1-555-0100',
        address: address || '123 Tech Park',
        job_title: job_title || (role === 'hr' ? 'HR Specialist' : 'Software Engineer')
      })
    });

    const resData = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(resData?.detail || 'Registration failed.');
    }

    const tokenData = resData.data;
    const accessToken = tokenData.access_token;
    const backendUser = tokenData.user;

    if (typeof window !== 'undefined') {
      localStorage.setItem('dayflow_token', accessToken);
    }

    const roleKey = backendUser.role || role || 'employee';
    const isHr = roleKey === 'hr';

    const newUser = {
      user_id: backendUser.id,
      employee_id: backendUser.id,
      name: backendUser.name,
      email: backendUser.login,
      role: roleKey,
      roles: [roleKey],
      title: job_title || (isHr ? 'HR Specialist' : 'Software Engineer'),
      dept: isHr ? 'Human Resources' : 'Engineering',
      initials: (backendUser.name || 'US').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
      work_phone: phone || '+91 98765 00000',
      address: address || '123 Tech Park',
      salary_base: 70000,
      documents: [
        { name: 'Joining_Letter.pdf', size: '1.8 MB', date: '2026-08-01' }
      ]
    };

    setUser(newUser);
    setAuthenticated(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dayflow_user', JSON.stringify(newUser));
    }
    router.push(isHr ? '/dashboard' : '/my-dashboard');
    return newUser;
  };

  const logout = () => {
    setAuthenticated(false);
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('dayflow_user');
      localStorage.removeItem('dayflow_token');
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
      switchRole,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
