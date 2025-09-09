import React from 'react';

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
}

// Text component with gradient matching the reference design
export const GradientText: React.FC<GradientTextProps> = ({ 
  children, 
  className = "" 
}) => {
  return (
    <span 
      className={`font-bold ${className}`}
      style={{
        background: "linear-gradient(169.144deg, rgba(219, 0, 255, 0.7) 0%, rgba(255, 46, 0, 0.7) 20%, rgba(173, 0, 255, 0.7) 69.5%, rgba(0, 26, 255, 0.7) 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text"
      }}
    >
      {children}
    </span>
  );
};