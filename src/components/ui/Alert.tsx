'use client';

import React from 'react';

interface AlertProps {
  variant?: 'success' | 'error' | 'warning' | 'info';
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<string, string> = {
  success: 'bg-green-50 border-green-400 text-green-800',
  error: 'bg-red-50 border-red-400 text-red-800',
  warning: 'bg-yellow-50 border-yellow-400 text-yellow-800',
  info: 'bg-blue-50 border-blue-400 text-blue-800',
};

export default function Alert({ variant = 'info', children, className = '' }: AlertProps) {
  return (
    <div className={`rounded-md border-l-4 p-4 ${variantStyles[variant]} ${className}`} role="alert">
      {children}
    </div>
  );
}
