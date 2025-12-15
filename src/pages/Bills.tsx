import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Zap, Wifi, Tv, Droplets, Smartphone, Gamepad2, 
  GraduationCap, Plus, Eye, EyeOff, Wallet, Home, 
  FileText, History, Settings, User 
} from "lucide-react";
import { toast } from "sonner";

interface BillItem {
  id: string;
  name: string;
  date: string;
  amount: string;
  icon: React.ReactNode;
  gradient: string;
}

interface ActionButton {
  id: string;
  name: string;
  icon: React.ReactNode;
  gradient: string;
}

const Bills = () => {
  const navigate = useNavigate();
  const [showBalance, setShowBalance] = useState(true);
  const [activeAction, setActiveAction] = useState("electricity");
  const [activeNav, setActiveNav] = useState("bills");
  
  const balance = "₦ 45,820.50";

  const actionButtons: ActionButton[] = [
    { id: "electricity", name: "Electricity", icon: <Zap className="w-6 h-6" />, gradient: "bg-gradient-to-br from-rose-300 to-rose-200" },
    { id: "internet", name: "Internet", icon: <Wifi className="w-6 h-6" />, gradient: "bg-gradient-to-br from-blue-300 to-cyan-200" },
    { id: "tv", name: "Cable TV", icon: <Tv className="w-6 h-6" />, gradient: "bg-gradient-to-br from-orange-200 to-orange-300" },
    { id: "water", name: "Water", icon: <Droplets className="w-6 h-6" />, gradient: "bg-gradient-to-br from-green-300 to-cyan-300" },
    { id: "airtime", name: "Airtime", icon: <Smartphone className="w-6 h-6" />, gradient: "bg-gradient-to-br from-lime-300 to-green-300" },
    { id: "gaming", name: "Gaming", icon: <Gamepad2 className="w-6 h-6" />, gradient: "bg-gradient-to-br from-pink-200 to-purple-200" },
    { id: "education", name: "Education", icon: <GraduationCap className="w-6 h-6" />, gradient: "bg-gradient-to-br from-blue-300 to-indigo-400" },
    { id: "more", name: "More", icon: <Plus className="w-6 h-6" />, gradient: "bg-gradient-to-br from-rose-400 to-pink-500" },
  ];

  const recentBills: BillItem[] = [
    { id: "1", name: "IKEDC Electricity Bill", date: "Paid on 15 May, 2023", amount: "₦ 8,450", icon: <Zap className="w-6 h-6" />, gradient: "bg-gradient-to-br from-rose-300 to-rose-200" },
    { id: "2", name: "Spectranet Internet", date: "Paid on 12 May, 2023", amount: "₦ 15,000", icon: <Wifi className="w-6 h-6" />, gradient: "bg-gradient-to-br from-blue-300 to-cyan-200" },
    { id: "3", name: "DSTV Subscription", date: "Paid on 10 May, 2023", amount: "₦ 18,500", icon: <Tv className="w-6 h-6" />, gradient: "bg-gradient-to-br from-orange-200 to-orange-300" },
    { id: "4", name: "Lagos Water", date: "Paid on 5 May, 2023", amount: "₦ 3,200", icon: <Droplets className="w-6 h-6" />, gradient: "bg-gradient-to-br from-green-300 to-cyan-300" },
  ];

  const handleActionClick = (actionId: string, actionName: string) => {
    setActiveAction(actionId);
    toast.info(`Opening ${actionName} bill payment screen...`);
  };

  const handleBillClick = (bill: BillItem) => {
    toast.info(`Viewing details for ${bill.name} - ${bill.amount}`);
  };

  const handleNavClick = (navId: string) => {
    setActiveNav(navId);
    if (navId === "home") navigate("/dashboard");
    else if (navId === "settings") navigate("/settings");
    else if (navId === "history") toast.info("Opening transaction history...");
    else if (navId === "bills") toast.info("You're already on Bills");
  };

  return (
    <div className="min-h-screen bg-muted/30 max-w-lg mx-auto relative">
      {/* Header */}
      <header className="bg-gradient-to-br from-[hsl(210,65%,35%)] to-[hsl(205,70%,47%)] text-white px-5 pt-5 pb-8 rounded-b-[25px] relative overflow-hidden">
        <div className="flex justify-between items-center mb-6 relative z-10">
          <div className="flex items-center gap-2 font-bold text-2xl">
            <Zap className="w-7 h-7" />
            <span>Opay</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
        </div>
        
        <div className="bg-white/15 backdrop-blur-md rounded-[20px] p-5 relative z-10 mt-2">
          <div className="text-sm opacity-90 mb-1">
            {showBalance ? "Available Balance" : "Hidden Balance"}
          </div>
          <div className="text-3xl font-bold mb-4">
            {showBalance ? balance : "******"}
          </div>
          <div className="flex justify-between text-sm">
            <button 
              onClick={() => setShowBalance(!showBalance)}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              <span>{showBalance ? "Hide Balance" : "Show Balance"}</span>
            </button>
            <button 
              onClick={() => toast.info("Redirecting to add money screen...")}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Wallet className="w-4 h-4" />
              <span>Add Money</span>
            </button>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="px-5 -mt-4 relative z-10 pb-24">
        {/* Quick Actions */}
        <section className="bg-card rounded-[20px] p-5 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-5 text-[hsl(210,65%,35%)]">Bills Payment</h2>
          <div className="grid grid-cols-4 gap-3 sm:gap-4">
            {actionButtons.map((action) => (
              <button
                key={action.id}
                onClick={() => handleActionClick(action.id, action.name)}
                className={`flex flex-col items-center text-center p-3 rounded-[15px] transition-all duration-300 hover:-translate-y-1 ${
                  activeAction === action.id ? "bg-blue-50" : "hover:bg-muted/50"
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 text-white ${action.gradient}`}>
                  {action.icon}
                </div>
                <span className="text-xs sm:text-sm font-medium text-muted-foreground">{action.name}</span>
              </button>
            ))}
          </div>
        </section>
        
        {/* Recent Bills */}
        <section className="bg-card rounded-[20px] p-5 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-5 text-[hsl(210,65%,35%)]">Recent Bills</h2>
          <div className="space-y-1">
            {recentBills.map((bill, index) => (
              <button
                key={bill.id}
                onClick={() => handleBillClick(bill)}
                className={`w-full flex items-center py-4 transition-colors hover:bg-muted/30 ${
                  index !== recentBills.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 text-white ${bill.gradient}`}>
                  {bill.icon}
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-foreground">{bill.name}</div>
                  <div className="text-sm text-muted-foreground">{bill.date}</div>
                </div>
                <div className="font-bold text-[hsl(210,65%,35%)]">{bill.amount}</div>
              </button>
            ))}
          </div>
        </section>
        
        {/* Promo Banner */}
        <section className="bg-gradient-to-br from-[hsl(210,65%,35%)] to-[hsl(210,60%,50%)] rounded-[20px] p-5 text-white flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="text-center sm:text-left">
            <h3 className="text-lg font-semibold mb-1">Pay Bills & Win!</h3>
            <p className="text-sm opacity-90">Get a chance to win ₦10,000 on every bill payment this month</p>
          </div>
          <button 
            onClick={() => toast.info("Promotion details: Pay any bill above ₦5,000 this month to enter the draw for ₦10,000 cash prize!")}
            className="bg-white/20 hover:bg-white/30 transition-colors px-5 py-2.5 rounded-full font-semibold whitespace-nowrap"
          >
            Learn More
          </button>
        </section>
      </main>
      
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-card border-t border-border flex justify-around py-3 rounded-t-[25px] shadow-lg">
        {[
          { id: "home", icon: <Home className="w-6 h-6" />, label: "Home" },
          { id: "bills", icon: <FileText className="w-6 h-6" />, label: "Bills" },
          { id: "history", icon: <History className="w-6 h-6" />, label: "History" },
          { id: "settings", icon: <Settings className="w-6 h-6" />, label: "Settings" },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavClick(item.id)}
            className={`flex flex-col items-center px-4 py-1.5 rounded-[15px] transition-colors ${
              activeNav === item.id 
                ? "text-[hsl(210,65%,35%)] bg-blue-50" 
                : "text-muted-foreground hover:text-[hsl(210,65%,35%)] hover:bg-blue-50"
            }`}
          >
            {item.icon}
            <span className="text-xs font-medium mt-1">{item.label}</span>
          </button>
        ))}
      </nav>
      
      {/* Footer */}
      <footer className="text-center py-5 text-xs text-muted-foreground border-t border-border bg-card mb-16">
        <p>Opay Bills Payment v2.1 • Secure & Reliable</p>
        <p>© 2023 Opay. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Bills;
