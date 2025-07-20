
import { ReactNode, useRef } from 'react';
import MobileNavigation from './MobileNavigation';
import { useMobileCapabilities } from '@/hooks/useMobileCapabilities';
import { usePullToRefresh } from '@/hooks/useGestures';
import { useHaptics } from '@/hooks/useHaptics';

interface MobileLayoutProps {
  children: ReactNode;
  title?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  onRefresh?: () => Promise<void>;
  enablePullToRefresh?: boolean;
}

const MobileLayout = ({ 
  children, 
  title, 
  showBackButton, 
  onBack,
  onRefresh,
  enablePullToRefresh = false
}: MobileLayoutProps) => {
  const { safeAreaInsets } = useMobileCapabilities();
  const { vibrate } = useHaptics();
  const contentRef = useRef<HTMLDivElement>(null);

  // Enable pull-to-refresh if callback is provided
  if (enablePullToRefresh && onRefresh) {
    usePullToRefresh(contentRef, { onRefresh });
  }

  const handleBackPress = () => {
    vibrate('light');
    onBack?.();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {title && (
        <div 
          className="bg-[#0A84FF] text-white px-4 py-3 sticky top-0 z-40 shadow-sm"
          style={{ paddingTop: Math.max(safeAreaInsets.top + 12, 16) }}
        >
          <div className="flex items-center justify-between">
            {showBackButton && (
              <button 
                onClick={handleBackPress} 
                className="text-white p-2 -ml-2 rounded-full active:bg-white/10 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center" 
                aria-label="Go back"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <h1 className="text-lg font-semibold text-center flex-1 px-2">{title}</h1>
            <div className="w-10"></div>
          </div>
        </div>
      )}
      
      <div 
        ref={contentRef}
        className="flex-1 overflow-y-auto overscroll-behavior-y-contain"
        style={{ 
          paddingBottom: Math.max(safeAreaInsets.bottom + 80, 96),
          minHeight: 'calc(100vh - 120px)'
        }}
      >
        <div className="p-4 pb-8">
          {children}
        </div>
        
        {/* Pull-to-refresh indicator */}
        {enablePullToRefresh && (
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full opacity-0 transition-opacity">
            <div className="bg-white rounded-full p-2 shadow-lg">
              <svg className="w-5 h-5 animate-spin text-[#0A84FF]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          </div>
        )}
      </div>
      
      <MobileNavigation />
    </div>
  );
};

export default MobileLayout;
