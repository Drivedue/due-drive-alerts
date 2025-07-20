
import { useState, useEffect } from 'react';

interface MobileCapabilities {
  isMobile: boolean;
  isTouchDevice: boolean;
  hasVibration: boolean;
  hasCamera: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  screenHeight: number;
  screenWidth: number;
  safeAreaInsets: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

export const useMobileCapabilities = (): MobileCapabilities => {
  const [capabilities, setCapabilities] = useState<MobileCapabilities>({
    isMobile: false,
    isTouchDevice: false,
    hasVibration: false,
    hasCamera: false,
    isIOS: false,
    isAndroid: false,
    screenHeight: 0,
    screenWidth: 0,
    safeAreaInsets: { top: 0, bottom: 0, left: 0, right: 0 }
  });

  useEffect(() => {
    const checkCapabilities = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent) || window.innerWidth <= 768;
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const hasVibration = 'vibrate' in navigator;
      const hasCamera = 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;
      const isIOS = /iphone|ipad|ipod/.test(userAgent);
      const isAndroid = /android/.test(userAgent);

      // Get safe area insets
      const computedStyle = getComputedStyle(document.documentElement);
      const safeAreaTop = parseInt(computedStyle.getPropertyValue('--safe-area-inset-top')) || 0;
      const safeAreaBottom = parseInt(computedStyle.getPropertyValue('--safe-area-inset-bottom')) || 0;
      const safeAreaLeft = parseInt(computedStyle.getPropertyValue('--safe-area-inset-left')) || 0;
      const safeAreaRight = parseInt(computedStyle.getPropertyValue('--safe-area-inset-right')) || 0;

      setCapabilities({
        isMobile,
        isTouchDevice,
        hasVibration,
        hasCamera,
        isIOS,
        isAndroid,
        screenHeight: window.innerHeight,
        screenWidth: window.innerWidth,
        safeAreaInsets: {
          top: safeAreaTop,
          bottom: safeAreaBottom,
          left: safeAreaLeft,
          right: safeAreaRight
        }
      });
    };

    checkCapabilities();
    window.addEventListener('resize', checkCapabilities);
    
    return () => window.removeEventListener('resize', checkCapabilities);
  }, []);

  return capabilities;
};
