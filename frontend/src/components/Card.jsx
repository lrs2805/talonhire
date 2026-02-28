
import React from 'react';
import { useUserTypeColor } from '@/hooks/useUserTypeColor';

export default function Card({ children, className = '' }) {
  const { borderColor, shadowColor } = useUserTypeColor();

  return (
    <div 
      className={`bg-card p-6 rounded-lg border border-border transition-dynamic hover:-translate-y-1 ${className}`}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = borderColor;
        e.currentTarget.style.boxShadow = shadowColor;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '';
        e.currentTarget.style.boxShadow = '';
      }}
    >
      {children}
    </div>
  );
}
