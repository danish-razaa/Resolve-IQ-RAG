import { Link, useLocation } from "react-router-dom";
import { BarChart3, FileText, Copy } from "lucide-react";

const navItems = [
  { label: "Home", path: "/", icon: BarChart3 },
  { label: "Complaints", path: "/complaints", icon: FileText },
  { label: "Duplicates", path: "/duplicates", icon: Copy },
];

const AppSidebar = () => {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 bg-sidebar border-r border-sidebar-border flex flex-col z-50">
      <div className="p-5 border-b border-sidebar-border">
        <h1 className="text-xl font-bold text-sidebar-primary tracking-tight">
          Resolve<span className="text-primary">IQ</span>
        </h1>
      </div>
      <nav className="flex-1 py-4">
        {navItems.map((item) => {
          const isActive =
            item.path === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-5 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? "text-sidebar-primary border-l-2 border-sidebar-primary bg-sidebar-accent"
                  : "text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent/50 border-l-2 border-transparent"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default AppSidebar;
