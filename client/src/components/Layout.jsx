import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BookOpen, User, LogOut, Shield } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import RecruiterNote from './RecruiterNote';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isAdmin = user?.role === 'admin';

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '?';
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation */}
      <nav className="sticky top-0 w-full border-b border-border/40 bg-background backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-14 items-center justify-between">
            {/* Logo - Simplified */}
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="p-1.5 rounded-md bg-gradient-to-br from-gray-900 to-gray-700 group-hover:from-gray-800 group-hover:to-gray-600 transition-colors">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight hidden sm:block">BookReview</span>
              <span className="text-base font-bold tracking-tight sm:hidden">BR</span>
            </Link>

            {/* Center Navigation - Hidden on mobile */}
            <div className="hidden lg:flex items-center space-x-1">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/">Home</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/books">Books</Link>
              </Button>
              {isAdmin && (
                <Button variant="ghost" size="sm" asChild className="text-orange-600 hover:text-orange-700 hover:bg-orange-50">
                  <Link to="/admin/dashboard">
                    <Shield className="h-3 w-3 mr-1" />
                    Admin
                  </Link>
                </Button>
              )}
            </div>

            {/* User Authentication - Compact */}
            <div className="flex items-center space-x-2">
              {user ? (
                <div className="flex items-center space-x-2">
                  {/* Welcome message - Hidden on small screens */}
                  <div className="hidden md:block text-sm">
                    <span className="text-muted-foreground">Hi, </span>
                    <span className="font-medium">{user.name.split(' ')[0]}</span>
                    {isAdmin && (
                      <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                        Admin
                      </span>
                    )}
                  </div>

                  {/* User Avatar Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0 ">
                        <Avatar className="h-8 w-8 border border-border">
                          <AvatarFallback className="bg-muted text-muted-foreground font-semibold text-sm">
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-48 bg-gray-100" align="end" forceMount>
                      <div className="flex items-center justify-start gap-2 p-2">
                        <div className="flex flex-col space-y-0.5 leading-none">
                          <p className="font-medium text-sm">{user.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          {isAdmin && (
                            <p className="text-xs font-medium text-orange-600">Administrator</p>
                          )}
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to={`/profile/${user._id || user.id || 'me'}`} className="cursor-pointer">
                          <User className="h-4 w-4 mr-2" />
                          Profile
                        </Link>
                      </DropdownMenuItem>
                      
                      {/* Admin Dashboard in mobile/tablet menu */}
                      {isAdmin && (
                        <DropdownMenuItem asChild className="lg:hidden">
                          <Link to="/admin/dashboard" className="cursor-pointer text-orange-600">
                            <Shield className="h-4 w-4 mr-2" />
                            Admin Dashboard
                          </Link>
                        </DropdownMenuItem>
                      )}
                      
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/login">Sign In</Link>
                  </Button>
                  <Button size="sm" asChild className="bg-gray-900 hover:bg-gray-800 text-white">
                    <Link to="/register">Sign Up</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Recruiter Note - Fixed at bottom */}
      <RecruiterNote />
    </div>
  );
};

export default Layout;