
import React from 'react';
import { useUserTypeColor } from '@/hooks/useUserTypeColor';

export default function FormInput({ label, ...props }) {
  const { borderColor, shadowColor } = useUserTypeColor();

  return (
    <div className="space-y-1 w-full">
      {label && <label className="block text-sm text-muted-foreground">{label}</label>}
      <input
        className="w-full bg-input border border-border rounded p-2 text-foreground transition-dynamic outline-none focus:ring-0 placeholder-gray-500"
        style={{
          '--focus-border': borderColor,
          '--focus-shadow': shadowColor,
        }}
        onFocus={(e) => {
          e.target.style.borderColor = borderColor;
          e.target.style.boxShadow = shadowColor;
        }}
        onBlur={(e) => {
          e.target.style.borderColor = '';
          e.target.style.boxShadow = '';
        }}
        {...props}
      />
    </div>
  );
}
