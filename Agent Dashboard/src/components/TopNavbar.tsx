import { Bell, LogOut, Radio } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { checkApiHealth, HealthResponse } from "@/lib/api";

const TopNavbar = () => {
  const navigate = useNavigate();
  const agent = localStorage.getItem("agent_name") || "Agent";
  const initials = agent.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  const [backendStatus, setBackendStatus] = useState<"checking" | "online" | "offline">("checking");
  const [healthData, setHealthData] = useState<HealthResponse | null>(null);

  useEffect(() => {
    let isMounted = true;
    const check = async () => {
      const res = await checkApiHealth();
      if (!isMounted) return;
      if (res.online && res.data) {
        setBackendStatus("online");
        setHealthData(res.data);
      } else {
        setBackendStatus("offline");
      }
    };

    check();
    const interval = setInterval(check, 12000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("agent_logged_in");
    localStorage.removeItem("agent_name");
    navigate("/login");
  };

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-semibold text-foreground">
          Resolve<span className="text-primary">IQ</span> — Agent Dashboard
        </h2>

        {/* Backend Connectivity Status Badge */}
        {backendStatus === "online" ? (
          <span
            title={`FastAPI backend connected | Domains: ${healthData?.loaded_domains.join(", ") || "All"}`}
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-success/15 text-success border border-success/30"
          >
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            Live AI Backend
          </span>
        ) : backendStatus === "checking" ? (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] text-muted-foreground bg-secondary">
            <Radio className="w-3 h-3 animate-spin text-muted-foreground" />
            Connecting...
          </span>
        ) : (
          <span
            title="FastAPI server not detected at VITE_API_BASE_URL (running with mock data)"
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-secondary text-muted-foreground border border-border"
          >
            <span className="w-2 h-2 rounded-full bg-muted-foreground" />
            Demo Mode (Mock RAG)
          </span>
        )}
      </div>

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
        <button onClick={handleLogout} className="p-2 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground" title="Sign Out">
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
};

export default TopNavbar;
