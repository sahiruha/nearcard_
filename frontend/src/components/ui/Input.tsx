'use client';

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className = '', id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-text-secondary">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full px-4 py-3 bg-bg-input border border-border rounded-[var(--radius-md)] text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-near-green transition-colors ${className}`}
        {...props}
      />
    </div>
  );
}
