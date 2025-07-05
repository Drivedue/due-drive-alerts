
import { Car, LayoutDashboard, Settings, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const MobileNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard", isActive: location.pathname === "/dashboard" },
    { icon: Car, label: "My Garage", path: "/garage", isActive: location.pathname === "/garage" || location.pathname === "/vehicles" || location.pathname === "/documents" },
    { icon: Settings, label: "Settings", path: "/settings", isActive: location.pathname === "/settings" },
    { icon: User, label: "Profile", path: "/profile", isActive: location.pathname === "/profile" }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50 safe-area-bottom">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
              item.isActive ? 'text-[#0A84FF] bg-blue-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
            aria-label={item.label}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MobileNavigation;
