import React from 'react';

interface GeminiLogoProps {
  className?: string;
  size?: number;
  animate?: boolean;
}

export const GeminiLogo: React.FC<GeminiLogoProps> = ({
  className = '',
  size = 28,
  animate = false,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${animate ? 'animate-pulse' : ''} ${className}`}
    >
      <defs>
        <linearGradient id="gemini-sparkle-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4e82ee" />
          <stop offset="35%" stopColor="#7ba5f9" />
          <stop offset="70%" stopColor="#9b72cb" />
          <stop offset="100%" stopColor="#d96570" />
        </linearGradient>
        <linearGradient id="gemini-glow-grad" x1="10%" y1="10%" x2="90%" y2="90%">
          <stop offset="0%" stopColor="#4285f4" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#9b72cb" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#d96570" stopOpacity="0.4" />
        </linearGradient>
      </defs>
      
      {/* 4-point curved Google Gemini Star */}
      <path
        d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z"
        fill="url(#gemini-sparkle-grad)"
      />
    </svg>
  );
};
