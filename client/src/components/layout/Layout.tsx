import type { ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, userRole } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-border p-4 flex justify-between items-center">
        <div className="font-bold text-xl text-primary">CLINOMA</div>
        <nav>
          <ul className="flex space-x-4">
            <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
            {user ? (
              <>
                <li><Link to="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link></li>
                {userRole === 'admin' && (
                  <li><Link to="/admin" className="hover:text-primary transition-colors font-medium text-accent">Admin</Link></li>
                )}
              </>
            ) : (
              <li><Link to="/login" className="hover:text-primary transition-colors">Login</Link></li>
            )}
          </ul>
        </nav>
      </header>
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
      <footer className="border-t border-border p-4 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} CLINOMA. All rights reserved.
      </footer>
    </div>
  );
}
