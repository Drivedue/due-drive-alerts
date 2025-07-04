
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
    <div className="min-h-screen bg-gray-50 pb-20">
      {title && (
        <div className="bg-blue-600 text-white p-4 sticky top-0 z-40">
          <div className="flex items-center justify-between">
            {showBackButton && (
              <button onClick={onBack} className="text-white">
                ←
              </button>
            )}
            <h1 className="text-lg font-semibold text-center flex-1">{title}</h1>
            <div className="w-6"></div>
          </div>
        </div>
      )}
      <div className="p-4">
        {children}
      </div>
      <MobileNavigation />
    </div>
  );
};

export default MobileLayout;
