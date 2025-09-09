import React from 'react';
import { Sparkle } from 'phosphor-react';

interface TutorCopilotButtonProps {
  children?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const TutorCopilotButton: React.FC<TutorCopilotButtonProps> = ({ 
  children = "Tutor Copilot", 
  onClick, 
  className = "" 
}) => {
  return (
    <button
      onClick={onClick}
      className={`relative rounded-[40px] transition-all duration-200 hover:scale-105 active:scale-95 p-[2px] w-[155px] h-[40px] ${className}`}
      style={{
        background: "linear-gradient(105.06deg, #DB00FF 0%, #FF2E00 20%, #AD00FF 69.5%, #001AFF 100%)"
      }}
    >
      {/* Inner content with background */}
      <div
        className="bg-[#ffffff] rounded-[38px] size-full relative"
        style={{
          backgroundImage:
            "linear-gradient(105.06deg, rgba(219, 0, 255, 0.08) 0%, rgba(255, 46, 0, 0.08) 20%, rgba(173, 0, 255, 0.08) 69.5%, rgba(0, 26, 255, 0.08) 100%), none",
        }}
      >
        <div className="flex flex-row items-center relative size-full">
          <div className="box-border content-stretch flex flex-row gap-3 items-center justify-center overflow-clip px-5 py-2 relative size-full">
            <Sparkle size={24} weight="regular" className="text-[#1d192c]" />
            <div className="font-['Poppins:Medium',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#1d192c] text-[14px] text-left text-nowrap tracking-[0.25px]">
              <p className="adjustLetterSpacing block leading-[24px] whitespace-pre">
                {children}
              </p>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
};