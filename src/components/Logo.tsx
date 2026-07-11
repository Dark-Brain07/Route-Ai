import React from 'react';

export default function Logo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2EE56B" />
          <stop offset="100%" stopColor="#1DA64D" />
        </linearGradient>
      </defs>
      
      {/* Routing Orbit (Agentic Network) - Spins slowly */}
      <path 
        d="M80 50 A30 30 0 1 0 50 80" 
        stroke="url(#logoGrad)" 
        strokeWidth="8" 
        strokeLinecap="round" 
        strokeDasharray="12 18" 
        className="origin-center animate-[spin_10s_linear_infinite]"
      />
      
      {/* AI Node (Flashing active dot on the orbit) */}
      <circle cx="80" cy="50" r="6" fill="#2EE56B" className="animate-pulse" />

      {/* Modern 'R' (Route) inside the orbit */}
      <path
        d="M38 68V32H54C62 32 62 48 54 48H38M48 48L58 68"
        stroke="currentColor"
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
