
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { useAuth } from "@/contexts/AuthContext";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { authState } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1">
        {authState.isAuthenticated && <Sidebar />}
        <main className={`flex-1 pt-16 ${authState.isAuthenticated ? 'ml-56' : ''} animate-fade-in`}>
          <div className="container py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
