'use client';

import { cn } from '@/lib/utils';

export type StatusType = 
  | 'pending' 
  | 'approved' 
  | 'rejected' 
  | 'cancelled'
  | 'draft'
  | 'active'
  | 'inactive'
  | 'paid'
  | 'partial'
  | 'unpaid'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';

interface StatusBadgeProps {
  status: StatusType | string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const statusStyles: Record<string, string> = {
  // Application/Approval statuses
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
  cancelled: 'bg-gray-100 text-gray-600 border-gray-200',
  draft: 'bg-slate-100 text-slate-600 border-slate-200',
  
  // Activity statuses
  active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  inactive: 'bg-gray-100 text-gray-600 border-gray-200',
  
  // Payment statuses
  paid: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  partial: 'bg-amber-100 text-amber-700 border-amber-200',
  unpaid: 'bg-red-100 text-red-700 border-red-200',
  
  // Generic statuses
  success: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-100 text-amber-700 border-amber-200',
  error: 'bg-red-100 text-red-700 border-red-200',
  info: 'bg-blue-100 text-blue-700 border-blue-200',
};

const sizeStyles = {
  sm: 'text-[10px] px-2 py-0.5',
  md: 'text-xs px-2.5 py-1',
  lg: 'text-sm px-3 py-1.5',
};

export function StatusBadge({ status, size = 'md', className }: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase();
  const style = statusStyles[normalizedStatus] || statusStyles.info;
  
  return (
    <span
      className={cn(
        'inline-flex items-center font-bold uppercase tracking-wide rounded-full border',
        style,
        sizeStyles[size],
        className
      )}
    >
      {status}
    </span>
  );
}

export function StatusDot({ status, className }: { status: StatusType | string; className?: string }) {
  const normalizedStatus = status.toLowerCase();
  
  const dotColors: Record<string, string> = {
    pending: 'bg-amber-500',
    approved: 'bg-emerald-500',
    rejected: 'bg-red-500',
    cancelled: 'bg-gray-400',
    active: 'bg-emerald-500',
    inactive: 'bg-gray-400',
    paid: 'bg-emerald-500',
    partial: 'bg-amber-500',
    unpaid: 'bg-red-500',
  };
  
  return (
    <span
      className={cn(
        'w-2 h-2 rounded-full inline-block',
        dotColors[normalizedStatus] || 'bg-blue-500',
        className
      )}
    />
  );
}
