import React from 'react';
import { cn } from '../../utils/cn';

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: 'primary' | 'secondary' | 'muted';
  underline?: 'always' | 'hover' | 'never';
  children: React.ReactNode;
}

export const Link: React.FC<LinkProps> = ({
  variant = 'primary',
  underline = 'hover',
  className,
  children,
  ...props
}) => {
  const baseStyles = 'transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 rounded-sm';
  
  const variants = {
    primary: 'text-brand-primary hover:text-brand-primary-hover',
    secondary: 'text-gray-600 hover:text-brand-primary',
    muted: 'text-gray-500 hover:text-gray-700'
  };
  
  const underlineStyles = {
    always: 'underline',
    hover: 'hover:underline',
    never: 'no-underline'
  };

  return (
    <a
      className={cn(
        baseStyles,
        variants[variant],
        underlineStyles[underline],
        className
      )}
      {...props}
    >
      {children}
    </a>
  );
};