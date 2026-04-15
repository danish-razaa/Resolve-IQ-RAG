import { Bell, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TopNavbar = () => {
  const navigate = useNavigate();
  const agent = localStorage.getItem("agent_name") || "Agent";
  const initials = agent.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const handleLogout = () => {
    localStorage.removeItem("agent_logged_in");
    localStorage.removeItem("agent_name");
    navigate("/login");
  };

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-6 sticky top-0 z-40">
      <h2 className="text-sm font-semibold text-foreground">
        Resolve<span className="text-primary">IQ</span> — Agent Dashboard
      </h2>
      <div className="flex items-center gap-4">
        <div className="relative">
          <Bell className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer" />
          <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-destructive text-[10px] font-bold flex items-center justify-center text-destructive-foreground">
            3
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center text-primary text-xs font-semibold">
            {initials}
          </div>
          <span className="text-sm font-medium text-foreground">{agent}</span>
        </div>
        <button onClick={handleLogout} className="p-2 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
};

export default TopNavbar;
