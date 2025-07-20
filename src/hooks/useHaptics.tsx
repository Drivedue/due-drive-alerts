
import { useMobileCapabilities } from './useMobileCapabilities';

export type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

export const useHaptics = () => {
  const { hasVibration, isIOS } = useMobileCapabilities();

  const vibrate = (pattern: HapticPattern) => {
    if (!hasVibration) return;

    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30],
      success: [10, 50, 10],
      warning: [20, 100, 20, 100, 20],
      error: [50, 100, 50]
    };

    try {
      if (isIOS && (window as any).navigator?.vibrate) {
        // iOS haptic feedback
        navigator.vibrate(patterns[pattern]);
      } else if (navigator.vibrate) {
        // Android vibration
        navigator.vibrate(patterns[pattern]);
      }
    } catch (error) {
      console.log('Haptic feedback not supported');
    }
  };

  return { vibrate };
};
