
import { Car, LayoutDashboard, Settings, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useHaptics } from "@/hooks/useHaptics";
import { useMobileCapabilities } from "@/hooks/useMobileCapabilities";

const MobileNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { vibrate } = useHaptics();
  const { safeAreaInsets } = useMobileCapabilities();

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard", isActive: location.pathname === "/dashboard" },
    { icon: Car, label: "My Garage", path: "/garage", isActive: location.pathname === "/garage" || location.pathname === "/vehicles" || location.pathname === "/documents" },
    { icon: Settings, label: "Settings", path: "/settings", isActive: location.pathname === "/settings" },
    { icon: User, label: "Profile", path: "/profile", isActive: location.pathname === "/profile" }
  ];

  const handleNavigation = (path: string) => {
    vibrate('light');
    navigate(path);
  };

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 px-4 py-2 z-50"
      style={{ paddingBottom: Math.max(safeAreaInsets.bottom, 8) }}
    >
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => handleNavigation(item.path)}
            className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all duration-200 min-h-[56px] min-w-[56px] ${
              item.isActive 
                ? 'text-[#0A84FF] bg-blue-50 scale-110' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 active:scale-95'
            }`}
            aria-label={item.label}
          >
            <item.icon className={`h-5 w-5 ${item.isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
            <span className={`text-xs font-medium ${item.isActive ? 'font-semibold' : ''}`}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MobileNavigation;
