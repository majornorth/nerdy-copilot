import React from 'react';

interface ActionButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

// Styled action button matching the reference design
export const ActionButton: React.FC<ActionButtonProps> = ({ 
  children, 
  onClick, 
  className = "" 
}) => {
  const handleClick = () => {
    console.log('=== ACTION BUTTON CLICKED ===');
    console.log('Button text:', children);
    console.log('onClick handler exists:', !!onClick);
    console.log('=============================');
    onClick?.();
  };

  return (
    <button
      onClick={handleClick}
      className={`
        inline-flex items-center justify-center
        px-4 py-2.5
        bg-white
        border border-[#E3E2E7]
        rounded-[16px]
        font-medium text-brand-primary text-sm
        hover:border-brand-primary hover:bg-brand-primary hover:text-white
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2
        ${className}
      `}
    >
      {children}
    </button>
  );
};