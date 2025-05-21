
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, ClipboardList, PlusCircle, Settings } from "lucide-react";

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const navItems = [
    {
      label: "Dashboard",
      icon: <Home className="h-5 w-5" />,
      href: "/dashboard",
    },
    {
      label: "All Cases",
      icon: <ClipboardList className="h-5 w-5" />,
      href: "/cases",
    },
    {
      label: "New Case",
      icon: <PlusCircle className="h-5 w-5" />,
      href: "/new-case",
    },
    {
      label: "Settings",
      icon: <Settings className="h-5 w-5" />,
      href: "/settings",
    },
  ];

  return (
    <aside className="border-r h-screen w-56 bg-sidebar transition-all fixed top-16 left-0 animate-fade-in">
      <div className="flex flex-col gap-2 p-4">
        {navItems.map((item) => (
          <Button
            key={item.href}
            variant={location.pathname === item.href ? "default" : "ghost"}
            className={cn(
              "justify-start gap-2",
              location.pathname === item.href
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
            onClick={() => navigate(item.href)}
          >
            {item.icon}
            <span>{item.label}</span>
          </Button>
        ))}
      </div>
    </aside>
  );
};
