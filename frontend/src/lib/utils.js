// -*- coding: utf-8 -*-
/**
 * Utility functions for UI animations, formatters, and status styling.
 */

export function easeOutExpo(x) {
  return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
}

export function getStatusClass(status) {
  if (!status) return 'pill-pending';
  const s = String(status).toLowerCase();
  
  switch (s) {
    case 'present':
    case 'approved':
    case 'paid':
    case 'active':
    case 'healthy':
    case 'low':
      return 'pill-approved';
    case 'absent':
    case 'rejected':
    case 'failed':
    case 'danger':
    case 'high':
      return 'pill-rejected';
    case 'half-day':
    case 'pending':
    case 'warning':
    case 'medium':
      return 'pill-pending';
    case 'cancelled':
    case 'leave':
    case 'inactive':
      return 'pill-cancelled';
    default:
      return 'pill-pending';
  }
}

export function formatCurrency(amount, currency = 'USD') {
  if (currency === 'INR') {
    return `₹${Number(amount || 0).toLocaleString('en-IN')}`;
  }
  return `$${Number(amount || 0).toLocaleString('en-US')}`;
}

export function formatDate(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}
