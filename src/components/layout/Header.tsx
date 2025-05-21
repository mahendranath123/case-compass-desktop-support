
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserCircle, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Header = () => {
  const { authState, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const handlePasswordChange = () => {
    navigate('/change-password');
  };
  
  const handleUserManagement = () => {
    navigate('/user-management');
  };

  return (
    <header className="border-b bg-background z-10">
      <div className="container flex items-center justify-between h-16">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold animate-fade-in">
              TS
            </div>
            <span className="text-xl font-bold animate-fade-in">Tech Support Tracker</span>
          </div>
        </div>
        
        {authState.isAuthenticated && (
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <UserCircle className="h-4 w-4" />
                  {authState.user?.username}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handlePasswordChange}>
                  Change Password
                </DropdownMenuItem>
                {authState.user?.role === 'admin' && (
                  <DropdownMenuItem onClick={handleUserManagement}>
                    User Management
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" /> Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </header>
  );
};
