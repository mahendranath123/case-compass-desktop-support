
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
  
  const handleLogout = async () => {
    await logout();
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
                  {authState.profile?.username || authState.user?.email?.split('@')[0] || 'User'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {authState.profile?.full_name || authState.profile?.username || 'User'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {authState.user?.email}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      Role: {authState.profile?.role === 'admin' ? 'Administrator' : 'Support Agent'}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handlePasswordChange}>
                  Change Password
                </DropdownMenuItem>
                {authState.profile?.role === 'admin' && (
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
