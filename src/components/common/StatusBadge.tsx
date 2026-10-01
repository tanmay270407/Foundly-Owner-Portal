import React from 'react';
import { CollegeStatus, RequestStatus } from '../../types';

interface StatusBadgeProps {
  status: CollegeStatus | RequestStatus | 'active' | 'revoked' | 'suspended';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const normalized = status.toLowerCase();

  let dotColor = 'bg-neutral-500';
  let textColor = 'text-neutral-700';
  let badgeBg = 'bg-neutral-100 border-neutral-200';
  let label: string = status;

  switch (normalized) {
    case 'active':
    case 'approved':
      dotColor = 'bg-neutral-900';
      textColor = 'text-neutral-900 font-semibold';
      badgeBg = 'bg-neutral-100 border-neutral-300';
      label = normalized === 'approved' ? 'Approved' : 'Active';
      break;
    case 'pending':
    case 'under_review':
      dotColor = 'bg-neutral-600';
      textColor = 'text-neutral-800';
      badgeBg = 'bg-neutral-100 border-neutral-200';
      label = normalized === 'under_review' ? 'Under Review' : 'Pending';
      break;
    case 'rejected':
    case 'suspended':
    case 'revoked':
    case 'inactive':
      dotColor = 'bg-neutral-400';
      textColor = 'text-neutral-500';
      badgeBg = 'bg-neutral-50 border-neutral-200';
      label =
        normalized === 'rejected'
          ? 'Rejected'
          : normalized === 'suspended'
          ? 'Suspended'
          : normalized === 'revoked'
          ? 'Revoked'
          : 'Inactive';
      break;
    default:
      dotColor = 'bg-neutral-500';
      textColor = 'text-neutral-700';
      badgeBg = 'bg-neutral-100 border-neutral-200';
      label = status;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[11px] font-medium tracking-tight ${badgeBg} ${textColor} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
};
