
import { ReactNode } from 'react';
import MobileNavigation from './MobileNavigation';

interface MobileLayoutProps {
  children: ReactNode;
  title?: string;
  showBackButton?: boolean;
  onBack?: () => void;
}

const MobileLayout = ({ children, title, showBackButton, onBack }: MobileLayoutProps) => {
  return (
    <div className="min-h-screen bg-white">
      {title && (
        <div className="bg-[#0A84FF] text-white p-4 sticky top-0 z-40 safe-area-top">
          <div className="flex items-center justify-between">
            {showBackButton && (
              <button onClick={onBack} className="text-white p-1 -ml-1" aria-label="Go back">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <h1 className="text-lg font-semibold text-center flex-1">{title}</h1>
            <div className="w-6"></div>
          </div>
        </div>
      )}
      <div className="p-4 pb-24 min-h-screen">
        {children}
      </div>
      <MobileNavigation />
    </div>
  );
};

export default MobileLayout;
