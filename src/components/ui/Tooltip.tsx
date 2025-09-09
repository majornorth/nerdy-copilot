import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../utils/cn';

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
}

/**
 * Tooltip component that displays helpful text on hover
 * Features a purple gradient background with white text and arrow pointer
 * Supports multiple positioning options and customizable delay
 * Uses React Portal to render outside of stacking context issues
 */
export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  position = 'bottom',
  delay = 300,
  className
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const timeoutRef = useRef<NodeJS.Timeout>();
  const triggerRef = useRef<HTMLDivElement>(null);

  const calculatePosition = () => {
    if (!triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const tooltipOffset = 8; // Distance from trigger element

    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = rect.top - tooltipOffset;
        left = rect.left + rect.width / 2;
        break;
      case 'bottom':
        top = rect.bottom + tooltipOffset;
        left = rect.left + rect.width / 2;
        break;
      case 'left':
        top = rect.top + rect.height / 2;
        left = rect.left - tooltipOffset;
        break;
      case 'right':
        top = rect.top + rect.height / 2;
        left = rect.right + tooltipOffset;
        break;
    }

    setTooltipPosition({ top, left });
  };

  const handleMouseEnter = () => {
    setIsVisible(true);
    calculatePosition();
    timeoutRef.current = setTimeout(() => {
      setShowTooltip(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
    setShowTooltip(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getTransformClasses = () => {
    switch (position) {
      case 'top':
        return 'transform -translate-x-1/2 -translate-y-full';
      case 'bottom':
        return 'transform -translate-x-1/2';
      case 'left':
        return 'transform -translate-x-full -translate-y-1/2';
      case 'right':
        return 'transform -translate-y-1/2';
      default:
        return 'transform -translate-x-1/2';
    }
  };

  const getArrowClasses = () => {
    switch (position) {
      case 'top':
        return 'top-full left-1/2 transform -translate-x-1/2';
      case 'bottom':
        return 'bottom-full left-1/2 transform -translate-x-1/2';
      case 'left':
        return 'left-full top-1/2 transform -translate-y-1/2';
      case 'right':
        return 'right-full top-1/2 transform -translate-y-1/2';
      default:
        return 'bottom-full left-1/2 transform -translate-x-1/2';
    }
  };

  const getArrowBorderStyle = () => {
    const borderWidth = '6px';
    const borderColor = '#6366f1';
    
    switch (position) {
      case 'top':
        return {
          borderWidth,
          borderStyle: 'solid',
          borderTopColor: borderColor,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: 'transparent',
        };
      case 'bottom':
        return {
          borderWidth,
          borderStyle: 'solid',
          borderBottomColor: borderColor,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderTopColor: 'transparent',
        };
      case 'left':
        return {
          borderWidth,
          borderStyle: 'solid',
          borderLeftColor: borderColor,
          borderTopColor: 'transparent',
          borderBottomColor: 'transparent',
          borderRightColor: 'transparent',
        };
      case 'right':
        return {
          borderWidth,
          borderStyle: 'solid',
          borderRightColor: borderColor,
          borderTopColor: 'transparent',
          borderBottomColor: 'transparent',
          borderLeftColor: 'transparent',
        };
      default:
        return {
          borderWidth,
          borderStyle: 'solid',
          borderBottomColor: borderColor,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderTopColor: 'transparent',
        };
    }
  };

  const tooltipElement = isVisible ? (
    <div
      className={cn(
        'fixed px-3 py-2 text-sm font-medium text-white rounded-lg shadow-lg pointer-events-none select-none break-words',
        'transition-opacity duration-200',
        showTooltip ? 'opacity-100' : 'opacity-0',
        getTransformClasses(),
        className
      )}
      style={{
        top: tooltipPosition.top,
        left: tooltipPosition.left,
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
        maxWidth: className?.includes('max-w-') ? undefined : 'max-content',
        zIndex: 999999, // Extremely high z-index to ensure visibility
      }}
    >
      {content}
      
      {/* Arrow */}
      <div
        className={cn('absolute w-0 h-0', getArrowClasses())}
        style={getArrowBorderStyle()}
      />
    </div>
  ) : null;

  return (
    <>
      <div 
        ref={triggerRef}
        className="inline-block"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>
      
      {/* Render tooltip in a portal to avoid stacking context issues */}
      {tooltipElement && createPortal(tooltipElement, document.body)}
    </>
  );
};