
import React from 'react';
import { Button } from '@/components/ui/button';
import { useHaptics } from '@/hooks/useHaptics';
import { useMobileCapabilities } from '@/hooks/useMobileCapabilities';
import { cn } from '@/lib/utils';

interface FloatingActionButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  label?: string;
  variant?: 'primary' | 'secondary';
  size?: 'default' | 'large';
  className?: string;
}

const FloatingActionButton = ({
  onClick,
  icon,
  label,
  variant = 'primary',
  size = 'default',
  className
}: FloatingActionButtonProps) => {
  const { vibrate } = useHaptics();
  const { safeAreaInsets } = useMobileCapabilities();

  const handleClick = () => {
    vibrate('medium');
    onClick();
  };

  const baseClasses = "fixed z-40 rounded-full shadow-lg transition-all duration-200 active:scale-95";
  const variantClasses = {
    primary: "bg-[#0A84FF] hover:bg-[#0A84FF]/90 text-white",
    secondary: "bg-white hover:bg-gray-50 text-gray-900 border border-gray-200"
  };
  const sizeClasses = {
    default: "h-14 w-14",
    large: "h-16 w-16"
  };

  const positionStyle = {
    bottom: Math.max(safeAreaInsets.bottom + 96, 112),
    right: 24
  };

  return (
    <Button
      onClick={handleClick}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      style={positionStyle}
      aria-label={label}
    >
      {icon}
    </Button>
  );
};

export default FloatingActionButton;
