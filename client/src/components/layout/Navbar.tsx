// src/components/layout/Navbar.tsx
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/features/auth/authSlice';
import { Moon, LogOut, UserCircle2 } from 'lucide-react'; // Example icons
// Import your theme toggle hook/function if you create one separately

export function Navbar() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  // const { theme, toggleTheme } = useTheme(); // Example if you have a theme context/hook

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  // Placeholder for theme toggle - we'll implement this properly later
  const handleThemeToggle = () => {
    console.log("Theme toggle clicked");
    // Example: document.documentElement.classList.toggle('dark');
  };

  return (
    <nav className="bg-card text-card-foreground border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-primary">
          Stocker.AI {/* Or your App Name */}
        </Link>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={handleThemeToggle}>
            {/* Placeholder: showing Moon icon always for now */}
            <Moon className="h-5 w-5" /> 
            {/* {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />} */}
            <span className="sr-only">Toggle theme</span>
          </Button>
          {isAuthenticated && user ? (
            <>
              <span className="text-sm hidden sm:inline">Welcome, {user.full_name || user.email}</span>
              <Link to="/dashboard"> {/* Or a profile page */}
                <Button variant="ghost" size="icon" title="Profile">
                    <UserCircle2 className="h-5 w-5" />
                </Button>
              </Link>
              <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}