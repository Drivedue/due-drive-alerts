
import { useRef, useEffect, RefObject } from 'react';

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

interface PullToRefreshOptions {
  onRefresh: () => Promise<void>;
  threshold?: number;
}

export const useSwipeGestures = (ref: RefObject<HTMLElement>, handlers: SwipeHandlers) => {
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const minSwipeDistance = 50;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      touchStart.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStart.current) return;

      const touchEnd = {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY
      };

      const deltaX = touchStart.current.x - touchEnd.x;
      const deltaY = touchStart.current.y - touchEnd.y;

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (Math.abs(deltaX) > minSwipeDistance) {
          if (deltaX > 0) {
            handlers.onSwipeLeft?.();
          } else {
            handlers.onSwipeRight?.();
          }
        }
      } else {
        // Vertical swipe
        if (Math.abs(deltaY) > minSwipeDistance) {
          if (deltaY > 0) {
            handlers.onSwipeUp?.();
          } else {
            handlers.onSwipeDown?.();
          }
        }
      }

      touchStart.current = null;
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handlers]);
};

export const usePullToRefresh = (ref: RefObject<HTMLElement>, options: PullToRefreshOptions) => {
  const { onRefresh, threshold = 80 } = options;
  const pullDistance = useRef(0);
  const isRefreshing = useRef(false);
  const startY = useRef(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (element.scrollTop === 0) {
        startY.current = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (element.scrollTop === 0 && !isRefreshing.current) {
        const currentY = e.touches[0].clientY;
        pullDistance.current = Math.max(0, currentY - startY.current);
        
        if (pullDistance.current > threshold) {
          // Add visual feedback for pull-to-refresh
          element.style.transform = `translateY(${Math.min(pullDistance.current * 0.5, 40)}px)`;
        }
      }
    };

    const handleTouchEnd = async () => {
      if (pullDistance.current > threshold && !isRefreshing.current) {
        isRefreshing.current = true;
        element.style.transform = 'translateY(40px)';
        
        try {
          await onRefresh();
        } finally {
          element.style.transform = 'translateY(0)';
          isRefreshing.current = false;
          pullDistance.current = 0;
        }
      } else {
        element.style.transform = 'translateY(0)';
        pullDistance.current = 0;
      }
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onRefresh, threshold]);
};
