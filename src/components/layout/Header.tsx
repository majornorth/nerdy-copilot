import React from 'react';
import { Chat, CaretDown } from 'phosphor-react';
import { mockUser } from '../../data/mockData';
import { TutorCopilotButton } from '../ui/TutorCopilotButton';

interface HeaderProps {
  showCopilotButton?: boolean;
  onCopilotClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  showCopilotButton = true,
  onCopilotClick 
}) => {
  const isLiveRoute = typeof window !== 'undefined' && window.location.pathname === '/live';
  return (
    <header className="bg-white border-b border-gray-200 flex-shrink-0">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <div 
              className={`flex items-center flex-shrink-0 ${isLiveRoute ? 'cursor-pointer' : ''}`}
              onClick={isLiveRoute ? () => { try { window.location.assign('/'); } catch { window.location.href = '/'; } } : undefined}
              title={isLiveRoute ? 'Back to dashboard' : undefined}
              role={isLiveRoute ? 'button' as any : undefined}
              aria-label={isLiveRoute ? 'Back to dashboard' : undefined}
              tabIndex={isLiveRoute ? 0 : -1}
              onKeyDown={isLiveRoute ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); try { window.location.assign('/'); } catch { window.location.href = '/'; } } } : undefined}
            >
              <img 
                src="/varsity-tutors-logo.svg" 
                alt="Varsity Tutors" 
                width="150"
                height="49"
                className="w-[150px] h-[49px]"
              />
            </div>
            
            {!isLiveRoute && (
              <nav className="hidden md:flex space-x-8">
                <a href="#" className="text-gray-600 hover:text-brand-primary text-sm transition-colors">Opportunities</a>
                <a href="#" className="text-gray-600 hover:text-brand-primary text-sm transition-colors">Schedule</a>
                <a href="#" className="text-gray-600 hover:text-brand-primary text-sm transition-colors">Invoicing</a>
                <a href="#" className="text-gray-600 hover:text-brand-primary text-sm transition-colors">Students</a>
                <a href="#" className="text-gray-600 hover:text-brand-primary text-sm transition-colors">Classes</a>
              </nav>
            )}
          </div>

          {/* Right side - Messages and Profile */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            <button className="p-2 text-gray-400 hover:text-brand-primary transition-colors rounded-lg hover:bg-brand-primary-50">
              <Chat size={20} weight="regular" />
            </button>

            {showCopilotButton && (
              <TutorCopilotButton onClick={onCopilotClick} />
            )}
            
            <div className="flex items-center space-x-2 cursor-pointer hover:bg-brand-primary-50 rounded-lg px-2 py-1 transition-colors">
              <span className="text-sm font-medium text-gray-900">{mockUser.name}</span>
              <CaretDown size={20} weight="regular" className="text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
