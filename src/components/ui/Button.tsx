import React from 'react';
import { IconProps } from 'phosphor-react';
import { cn } from '../../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'lesson-plan';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  leftIcon?: React.ComponentType<IconProps>;
  rightIcon?: React.ComponentType<IconProps>;
  iconWeight?: 'thin' | 'light' | 'regular' | 'bold';
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className,
  children,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  iconWeight = 'regular',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-brand-primary text-white hover:bg-brand-primary-hover focus:ring-brand-primary shadow-sm hover:shadow-md',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-brand-primary hover:text-brand-primary focus:ring-brand-primary transition-colors',
    ghost: 'text-gray-700 hover:bg-brand-primary-50 hover:text-brand-primary focus:ring-brand-primary',
    'lesson-plan': 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-brand-primary hover:text-brand-primary focus:ring-brand-primary transition-colors'
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm gap-2',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-3'
  };

  // All button icons are now 20px
  const iconSize = 20;

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {LeftIcon && (
        <LeftIcon 
          size={iconSize} 
          weight={iconWeight}
        />
      )}
      {children}
      {RightIcon && (
        <RightIcon 
          size={iconSize} 
          weight={iconWeight}
        />
      )}
    </button>
  );
};