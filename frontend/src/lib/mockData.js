// -*- coding: utf-8 -*-
/**
 * Authoritative Mock Data Repository for Dayflow HRMS Frontend
 * Provides structured, type-safe data matching all UI dashboards, tables, and detail views.
 */

// 1. Employee Dashboard Data
export const employeeDashboardData = {
  today_worked_hours: 6.8,
  monthly_worked_hours: 154,
  leave_balance: {
    annual: 14,
    sick: 7,
    unpaid: 0,
    used: 6,
    total: 21
  },
  net_salary: 82500,
  recent_activity: [
    { id: 1, type: 'checkin', title: 'Attendance Check-in', desc: 'Checked in at 09:02 AM', text: 'Checked in at 09:02 AM', time: 'Today', color: '#10B981', icon: 'Clock' },
    { id: 2, type: 'leave', title: 'Leave Request Approved', desc: 'Annual leave approved for Sept 15', text: 'Annual leave approved for Sept 15', time: 'Yesterday', color: '#3B82F6', icon: 'CheckCircle2' },
    { id: 3, type: 'payroll', title: 'Payslip Available', desc: 'August 2026 Payslip issued', text: 'August 2026 Payslip issued', time: '3 days ago', color: '#8B5CF6', icon: 'CreditCard' }
  ],
  weekly_attendance: [
    { day: 'Mon', hours: 8.5 },
    { day: 'Tue', hours: 8.0 },
    { day: 'Wed', hours: 9.0 },
    { day: 'Thu', hours: 7.5 },
    { day: 'Fri', hours: 6.8 }
  ]
};

// 2. HR Admin Dashboard Data
export const hrDashboardData = {
  total_employees: 128,
  present_today: 114,
  absent_today: 6,
  on_leave: 9,
  pending_leaves: 5,
  attendance_rate: 95.4,
  active_employees: 122,
  new_this_month: 8,
  ai_anomalies_total: 2,
  ai_high_risk: 1,
  monthly_attendance: [
    { month: 'Mar', rate: 94 },
    { month: 'Apr', rate: 96 },
    { month: 'May', rate: 95 },
    { month: 'Jun', rate: 92 },
    { month: 'Jul', rate: 97 },
    { month: 'Aug', rate: 95 }
  ],
  employees: [
    { id: '#EMP-001', name: 'Alice Employee', initials: 'AE', title: 'Lead Software Engineer', dept: 'Engineering', active: true, email: 'alice@company.com' },
    { id: '#EMP-002', name: 'Bob Manager', initials: 'BM', title: 'HR Director', dept: 'Human Resources', active: true, email: 'bob@company.com' },
    { id: '#EMP-003', name: 'Carol Administrator', initials: 'CA', title: 'Principal DevOps Architect', dept: 'Engineering', active: true, email: 'carol@company.com' },
    { id: '#EMP-004', name: 'Dave Engineer', initials: 'DE', title: 'Senior QA Engineer', dept: 'Engineering', active: true, email: 'dave@company.com' },
    { id: '#EMP-005', name: 'Elena Rostova', initials: 'ER', title: 'Senior UI/UX Designer', dept: 'Product & Design', active: true, email: 'elena@company.com' }
  ],
  leave_distribution: [
    { label: 'Paid Leave', count: 26, pct: 62 },
    { label: 'Sick Leave', count: 12, pct: 28 },
    { label: 'Unpaid Leave', count: 4, pct: 10 }
  ],
  pending_approvals: [
    { id: 1, name: 'Dave Engineer', initials: 'DE', leave_type: 'Paid Leave', dates: 'Sep 01 – Sep 05' },
    { id: 2, name: 'Elena Rostova', initials: 'ER', leave_type: 'Sick Leave', dates: 'Aug 25 – Aug 26' },
    { id: 3, name: 'Frank Miller', initials: 'FM', leave_type: 'Unpaid Leave', dates: 'Sep 15 – Sep 25' }
  ],
  department_distribution: [
    { name: 'Engineering', count: 54, color: '#3B82F6' },
    { name: 'Product & Design', count: 22, color: '#10B981' },
    { name: 'Sales & Marketing', count: 28, color: '#F59E0B' },
    { name: 'Human Resources', count: 12, color: '#8B5CF6' },
    { name: 'Operations', count: 12, color: '#EC4899' }
  ]
};

// 3. Departments
export const departments = [
  'All',
  'Engineering',
  'Product & Design',
  'Sales & Marketing',
  'Human Resources',
  'Operations'
];

// 4. Employee Directory
export const employeesList = [
  {
    id: '#EMP-001',
    name: 'Alice Employee',
    initials: 'AE',
    email: 'alice@company.com',
    phone: '+1-555-0101',
    dept: 'Engineering',
    title: 'Lead Software Engineer',
    active: true,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop',
    joined: 'Jan 15, 2024'
  },
  {
    id: '#EMP-002',
    name: 'Bob Manager',
    initials: 'BM',
    email: 'bob@company.com',
    phone: '+1-555-0102',
    dept: 'Human Resources',
    title: 'HR Director',
    active: true,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop',
    joined: 'Mar 10, 2023'
  },
  {
    id: '#EMP-003',
    name: 'Carol Administrator',
    initials: 'CA',
    email: 'carol@company.com',
    phone: '+1-555-0103',
    dept: 'Engineering',
    title: 'Principal DevOps Architect',
    active: true,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop',
    joined: 'Jun 01, 2023'
  },
  {
    id: '#EMP-004',
    name: 'Dave Engineer',
    initials: 'DE',
    email: 'dave@company.com',
    phone: '+1-555-0104',
    dept: 'Engineering',
    title: 'Senior QA Engineer',
    active: true,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop',
    joined: 'Sep 20, 2024'
  },
  {
    id: '#EMP-005',
    name: 'Elena Rostova',
    initials: 'ER',
    email: 'elena@company.com',
    phone: '+1-555-0105',
    dept: 'Product & Design',
    title: 'Senior UI/UX Designer',
    active: true,
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop',
    joined: 'Nov 12, 2024'
  },
  {
    id: '#EMP-006',
    name: 'Frank Miller',
    initials: 'FM',
    email: 'frank@company.com',
    phone: '+1-555-0106',
    dept: 'Sales & Marketing',
    title: 'Growth Marketing Lead',
    active: true,
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop',
    joined: 'Feb 18, 2025'
  }
];

export const employeeDetail = {
  id: '#EMP-001',
  name: 'Alice Employee',
  initials: 'AE',
  email: 'alice@company.com',
  phone: '+1-555-0101',
  dept: 'Engineering',
  title: 'Lead Software Engineer',
  manager: 'Bob Manager',
  manager_initials: 'BM',
  active: true,
  attendance_rate: 96.5,
  net_salary: 82500,
  payslip_period: 'August 2026',
  leave_remaining: 14,
  address: '456 Oak Avenue, Metropolis, NY 10001',
  joined: 'Jan 15, 2024',
  emergency_contact: 'Bob Senior (+1-555-9876)',
  activities: [
    { color: 'var(--accent)', title: 'Checked in at 09:02 AM', desc: 'On time arrival', time: 'Today' },
    { color: 'var(--success)', title: 'Leave approved for Sept 15', desc: 'Approved by HR', time: 'Yesterday' },
    { color: 'var(--info)', title: 'Completed security review', desc: 'Quarterly compliance pass', time: '3 days ago' }
  ],
  leave_history_chart: [
    { label: 'Feb', value: 1 },
    { label: 'Mar', value: 0 },
    { label: 'Apr', value: 2 },
    { label: 'May', value: 1 },
    { label: 'Jun', value: 3 },
    { label: 'Jul', value: 1 },
    { label: 'Aug', value: 2 }
  ],
  attendance_records: [
    { date: '2026-08-22', check_in: '09:02 AM', check_out: '05:30 PM', hours: 8.5, status: 'Present' },
    { date: '2026-08-21', check_in: '08:55 AM', check_out: '05:15 PM', hours: 8.3, status: 'Present' },
    { date: '2026-08-20', check_in: '09:10 AM', check_out: '05:45 PM', hours: 8.6, status: 'Present' },
    { date: '2026-08-19', check_in: '09:00 AM', check_out: '05:00 PM', hours: 8.0, status: 'Present' },
    { date: '2026-08-18', check_in: '08:50 AM', check_out: '05:20 PM', hours: 8.5, status: 'Present' }
  ],
  salary: {
    basic: 65000,
    allowances: 15000,
    deductions: 5000,
    net: 75000
  },
  leave_balance: {
    annual: 14,
    sick: 7,
    used: 6
  }
};

// 5. Attendance
export const attendanceSummary = {
  present: 114,
  absent: 6,
  half_day: 8,
  avg_hours: 8.2
};

export const attendanceRecords = [
  {
    id: 1,
    employee_id: '#EMP-001',
    name: 'Alice Employee',
    dept: 'Engineering',
    date: '2026-08-22',
    check_in: '09:02 AM',
    check_out: '05:30 PM',
    hours: 8.5,
    status: 'Present'
  },
  {
    id: 2,
    employee_id: '#EMP-002',
    name: 'Bob Manager',
    dept: 'Human Resources',
    date: '2026-08-22',
    check_in: '08:45 AM',
    check_out: '05:00 PM',
    hours: 8.2,
    status: 'Present'
  },
  {
    id: 3,
    employee_id: '#EMP-003',
    name: 'Carol Administrator',
    dept: 'Engineering',
    date: '2026-08-22',
    check_in: '09:15 AM',
    check_out: '06:00 PM',
    hours: 8.7,
    status: 'Present'
  },
  {
    id: 4,
    employee_id: '#EMP-004',
    name: 'Dave Engineer',
    dept: 'Engineering',
    date: '2026-08-22',
    check_in: '10:00 AM',
    check_out: '02:00 PM',
    hours: 4.0,
    status: 'Half-day'
  },
  {
    id: 5,
    employee_id: '#EMP-005',
    name: 'Elena Rostova',
    dept: 'Product & Design',
    date: '2026-08-22',
    check_in: '-',
    check_out: '-',
    hours: 0,
    status: 'Absent'
  }
];

// 6. Leave Management
export const myLeaveBalance = [
  {
    type: 'Paid Leave',
    remaining: 14,
    total: 20,
    used: 6
  },
  {
    type: 'Sick Leave',
    remaining: 7,
    total: 10,
    used: 3
  },
  {
    type: 'Unpaid Leave',
    remaining: 0,
    total: 5,
    used: 0
  }
];

export const myLeaveRequests = [
  {
    id: 101,
    type: 'Paid Leave',
    from: '2026-09-10',
    to: '2026-09-12',
    days: 3,
    reason: 'Family event & travel',
    status: 'Approved',
    created: '2026-08-18'
  },
  {
    id: 102,
    type: 'Sick Leave',
    from: '2026-08-05',
    to: '2026-08-06',
    days: 2,
    reason: 'Severe seasonal flu recovery',
    status: 'Approved',
    created: '2026-08-04'
  },
  {
    id: 103,
    type: 'Paid Leave',
    from: '2026-10-01',
    to: '2026-10-05',
    days: 5,
    reason: 'Annual autumn vacation',
    status: 'Pending',
    created: '2026-08-20'
  }
];

export const hrLeaveRequests = [
  {
    id: 201,
    employee: 'Dave Engineer',
    dept: 'Engineering',
    type: 'Paid Leave',
    from: '2026-09-01',
    to: '2026-09-05',
    days: 5,
    reason: 'Vacation trip',
    status: 'Pending',
    risk_score: 32,
    risk_level: 'LOW',
    created: '2026-08-20'
  },
  {
    id: 202,
    employee: 'Elena Rostova',
    dept: 'Product & Design',
    type: 'Sick Leave',
    from: '2026-08-25',
    to: '2026-08-26',
    days: 2,
    reason: 'Medical appointment',
    status: 'Pending',
    risk_score: 15,
    risk_level: 'LOW',
    created: '2026-08-21'
  },
  {
    id: 203,
    employee: 'Frank Miller',
    dept: 'Sales & Marketing',
    type: 'Unpaid Leave',
    from: '2026-09-15',
    to: '2026-09-25',
    days: 10,
    reason: 'Personal project completion',
    status: 'Pending',
    risk_score: 78,
    risk_level: 'HIGH',
    created: '2026-08-22'
  }
];

// 7. Payroll
export const hrPayrollKPIs = {
  total_issued: 8250000,
  employees_paid: 124,
  pending: 4
};

export const hrPayrollList = [
  {
    id: 1,
    name: 'Alice Employee',
    initials: 'AE',
    dept: 'Engineering',
    period: 'August 2026',
    gross: 80000,
    deductions: 5000,
    net: 75000,
    status: 'Paid'
  },
  {
    id: 2,
    name: 'Bob Manager',
    initials: 'BM',
    dept: 'Human Resources',
    period: 'August 2026',
    gross: 95000,
    deductions: 6000,
    net: 89000,
    status: 'Paid'
  },
  {
    id: 3,
    name: 'Carol Administrator',
    initials: 'CA',
    dept: 'Engineering',
    period: 'August 2026',
    gross: 88000,
    deductions: 5500,
    net: 82500,
    status: 'Paid'
  },
  {
    id: 4,
    name: 'Dave Engineer',
    initials: 'DE',
    dept: 'Engineering',
    period: 'August 2026',
    gross: 60000,
    deductions: 3000,
    net: 57000,
    status: 'Pending'
  }
];

export const myPayslips = [
  {
    id: '1',
    period: 'August 2026',
    from: 'Aug 01',
    to: 'Aug 31',
    gross: 80000,
    deductions: 5000,
    net: 75000,
    status: 'Paid'
  },
  {
    id: '2',
    period: 'July 2026',
    from: 'Jul 01',
    to: 'Jul 31',
    gross: 80000,
    deductions: 5000,
    net: 75000,
    status: 'Paid'
  },
  {
    id: '3',
    period: 'June 2026',
    from: 'Jun 01',
    to: 'Jun 30',
    gross: 80000,
    deductions: 5000,
    net: 75000,
    status: 'Paid'
  }
];

export const payslipDetail = {
  id: 'PAY-2026-08',
  period: 'August 2026',
  employee_name: 'Alice Employee',
  initials: 'AE',
  job_title: 'Lead Software Engineer',
  dept: 'Engineering',
  from: 'Aug 01',
  to: 'Aug 31',
  status: 'Paid',
  gross: 80000,
  basic: 65000,
  hra: 10000,
  special_allowance: 5000,
  tax_deduction: 3500,
  provident_fund: 1500,
  total_deductions: 5000,
  net: 75000,
  earnings: [
    { label: 'Basic Salary', amount: 65000 },
    { label: 'House Rent Allowance (HRA)', amount: 10000 },
    { label: 'Special Allowance', amount: 5000 }
  ],
  deductions: [
    { label: 'Income Tax (TDS)', amount: 3500 },
    { label: 'Provident Fund (PF)', amount: 1500 }
  ]
};

// 8. Analytics
export const analyticsOverview = {
  total_employees: 128,
  avg_hours: 8.2,
  attendance_rate: 95.4,
  pending_leaves: 5,
  approved_this_month: 24
};

export const attendanceTrend = [
  { date: '01 Aug', present: 115, absent: 5 },
  { date: '05 Aug', present: 112, absent: 8 },
  { date: '10 Aug', present: 116, absent: 4 },
  { date: '15 Aug', present: 110, absent: 10 },
  { date: '20 Aug', present: 114, absent: 6 },
  { date: '22 Aug', present: 114, absent: 6 }
];

export const leaveAnalytics = {
  total: 42,
  approved: 32,
  pending: 5,
  rejected: 5,
  by_type: [
    { type: 'Paid Leave', count: 26 },
    { type: 'Sick Leave', count: 12 },
    { type: 'Unpaid Leave', count: 4 }
  ]
};

// 9. AI Anomaly Insights
export const anomalies = [
  {
    id: 1,
    employee_name: 'Frank Miller',
    department: 'Sales & Marketing',
    anomaly_type: 'Long Extended Leave Cluster',
    risk_level: 'HIGH',
    score: 88,
    reasons: [
      'Unusually long leave requested (10 consecutive days)',
      'Adjacent to Q3 product launch timeline',
      'No secondary cover designated'
    ],
    recommended_action: 'Manager consultation required before approval.',
    date: '2026-08-22'
  },
  {
    id: 2,
    employee_name: 'Dave Engineer',
    department: 'Engineering',
    anomaly_type: 'Irregular Half-Day Pattern',
    risk_level: 'MEDIUM',
    score: 62,
    reasons: [
      'Multiple consecutive half-day shifts logged',
      'Worked hours below core team minimum (4.0h vs 8.0h expected)'
    ],
    recommended_action: 'Verify sprint task progress with project manager.',
    date: '2026-08-21'
  },
  {
    id: 3,
    employee_name: 'Elena Rostova',
    department: 'Product & Design',
    anomaly_type: 'Standard Leave Pattern',
    risk_level: 'LOW',
    score: 18,
    reasons: [
      'Single medical appointment leave request',
      'High remaining leave balance available'
    ],
    recommended_action: 'Fast-track approval recommended.',
    date: '2026-08-20'
  }
];
