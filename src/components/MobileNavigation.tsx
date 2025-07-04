
import { Car, LayoutDashboard, Settings, User, Plus } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

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
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => (
          <Button
            key={item.label}
            variant="ghost"
            size="sm"
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center gap-1 p-2 ${
              item.isActive ? 'text-[#0A84FF]' : 'text-gray-500'
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs">{item.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default MobileNavigation;
