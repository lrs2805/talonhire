
import React from 'react';
import { useUserTypeColor } from '@/hooks/useUserTypeColor';

export default function Footer() {
  const { textClass, glowClass } = useUserTypeColor();

  return (
    <footer className="border-t border-border bg-background/80 backdrop-blur-md mt-auto transition-dynamic">
      <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className={`text-xl font-bold font-[Orbitron] ${textClass} ${glowClass} transition-dynamic`}>
          TalonHire
        </div>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span className="hover:text-foreground transition-colors cursor-pointer">Privacy Policy</span>
          <span className="hover:text-foreground transition-colors cursor-pointer">Terms of Service</span>
          <span className="hover:text-foreground transition-colors cursor-pointer">Contact</span>
        </div>
        <div className="text-xs text-muted-foreground">
          © 2026 TalonHire. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
