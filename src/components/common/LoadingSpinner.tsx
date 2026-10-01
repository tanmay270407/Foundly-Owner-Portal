import React from 'react';

export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; message?: string }> = ({
  size = 'md',
  message,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-3',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
      <div
        className={`${sizeClasses[size]} rounded-full border-neutral-200 border-t-neutral-900 animate-spin`}
        role="status"
        aria-label="Loading"
      />
      {message && <p className="text-xs text-neutral-600 font-medium tracking-wide">{message}</p>}
    </div>
  );
};

export const SkeletonStatCard: React.FC = () => {
  return (
    <div className="p-5 bg-white border border-neutral-200 rounded-xl space-y-3 animate-pulse shadow-xs">
      <div className="flex items-center justify-between">
        <div className="w-24 h-3 bg-neutral-200 rounded" />
        <div className="w-6 h-6 bg-neutral-200 rounded" />
      </div>
      <div className="w-16 h-7 bg-neutral-200 rounded" />
      <div className="w-32 h-2.5 bg-neutral-100 rounded" />
    </div>
  );
};

export const SkeletonTableRow: React.FC = () => {
  return (
    <div className="flex items-center justify-between py-3.5 px-4 border-b border-neutral-100 animate-pulse">
      <div className="space-y-1.5 flex-1">
        <div className="w-36 h-3.5 bg-neutral-200 rounded" />
        <div className="w-24 h-2.5 bg-neutral-100 rounded" />
      </div>
      <div className="w-16 h-4 bg-neutral-200 rounded" />
    </div>
  );
};
