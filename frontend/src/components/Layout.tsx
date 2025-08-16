import { useState, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  useCurrentUser,
  useLogout,
  useUnreadNotificationCount,
  usePendingCounterOffersCount,
} from "../hooks/api";
import { useRealtimeNotifications } from "../hooks/useRealtimeNotifications";
import { Button } from "./ui/Button";
import {
  HammerIcon,
  BellIcon,
  UserIcon,
  MenuIcon,
  XIcon,
  ShoppingBagIcon,
  TrendingUpIcon,
  FireIcon,
} from "./ui/Icons";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { data: currentUser } = useCurrentUser();
  const { data: unreadCount } = useUnreadNotificationCount();
  const { data: pendingCounterOffers } = usePendingCounterOffersCount();
  const logoutMutation = useLogout();

  // Enable real-time notifications
  useRealtimeNotifications();

  // Click outside to close user menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const isAuthenticated = !!currentUser?.user;

  const NavLink = ({
    to,
    children,
    icon,
    badge,
  }: {
    to: string;
    children: React.ReactNode;
    icon?: React.ReactNode;
    badge?: number;
  }) => (
    <Link
      to={to}
      className="relative flex items-center gap-1.5 text-dark-300 hover:text-white transition-all duration-300 hover:scale-105 group whitespace-nowrap text-sm font-medium"
      activeProps={{ className: "text-primary-400 font-semibold" }}
    >
      {icon && <span className="transition-colors flex-shrink-0">{icon}</span>}
      <span className="flex-shrink-0">{children}</span>
      {badge && badge > 0 && (
        <span className="absolute -top-1.5 -right-1.5 bg-gradient-primary text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium shadow-glow animate-pulse">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
      <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-primary transition-all duration-300 group-hover:w-full" />
    </Link>
  );

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Header */}
      <header className="sticky top-0 z-50 glass backdrop-blur-xl border-b border-surface-600">
        <div className="container-custom">
          <div className="flex justify-between items-center h-20 px-2">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2 group flex-shrink-0"
            >
              <div className="relative">
                <img
                  src="/favicon.png"
                  alt="AuctionHub Logo"
                  className="w-8 h-8 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-primary-500 blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-gradient tracking-tight">
                  AuctionHub
                </span>
                <span className="text-xs text-dark-400 -mt-1 tracking-wide">
                  Premium Auctions
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-4 xl:space-x-6 flex-1 justify-center max-w-3xl">
              <NavLink to="/" icon={<FireIcon size="sm" />}>
                Live Auctions
              </NavLink>

              {isAuthenticated &&
                (currentUser.user.role === "seller" ||
                currentUser.user.role === "admin" ? (
                  <>
                    <NavLink
                      to="/sell/new"
                      icon={<ShoppingBagIcon size="sm" />}
                    >
                      Create Auction
                    </NavLink>
                    <NavLink
                      to="/sell/mine"
                      icon={<TrendingUpIcon size="sm" />}
                    >
                      My Auctions
                    </NavLink>
                  </>
                ) : null)}

              {isAuthenticated && (
                <>
                  <NavLink
                    to="/counter-offers/pending"
                    icon={<HammerIcon size="sm" />}
                    badge={pendingCounterOffers?.count}
                  >
                    Counter-Offers
                  </NavLink>
                  <NavLink
                    to="/notifications"
                    icon={<BellIcon size="sm" />}
                    badge={unreadCount?.count}
                  >
                    Notifications
                  </NavLink>
                </>
              )}
            </nav>

            {/* Auth Section */}
            <div className="flex items-center space-x-2 lg:space-x-3 flex-shrink-0">
              {isAuthenticated ? (
                <div className="flex items-center space-x-2">
                  {/* User Avatar Dropdown */}
                  <div className="relative" ref={userMenuRef}>
                    {/* Avatar Container with Background */}
                    <div className="relative p-1 bg-surface-800/80 rounded-full backdrop-blur-sm border border-surface-700/50">
                      <button
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        className="relative w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-white font-semibold text-sm hover:scale-105 transition-all duration-200 shadow-lg"
                      >
                        {currentUser.user.name.charAt(0).toUpperCase()}
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-surface-800 animate-pulse shadow-sm" />
                      </button>
                    </div>

                    {/* Dropdown Menu */}
                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-3 w-52 bg-surface-900/95 rounded-2xl border border-surface-700/30 shadow-2xl backdrop-blur-xl z-50 overflow-hidden">
                        {/* User Info Section */}
                        <div className="p-4 bg-gradient-to-r from-surface-800/50 to-surface-900/50 border-b border-surface-700/50">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center text-white font-semibold text-base shadow-lg">
                                {currentUser.user.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-surface-900 animate-pulse" />
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-dark-100">
                                {currentUser.user.name}
                              </div>
                              <div className="text-xs text-primary-400 capitalize flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                {currentUser.user.role}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Separator Line */}
                        <div className="h-px bg-gradient-to-r from-transparent via-surface-600 to-transparent"></div>

                        {/* Actions Section */}
                        <div className="p-3 bg-surface-900/60">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              handleLogout();
                              setIsUserMenuOpen(false);
                            }}
                            isLoading={logoutMutation.isPending}
                            className="w-full justify-start text-xs text-red-400 hover:text-red-300 hover:bg-red-500/15 rounded-xl py-2.5 px-3 transition-all duration-200"
                          >
                            <svg
                              className="w-4 h-4 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                              />
                            </svg>
                            {logoutMutation.isPending
                              ? "Signing out..."
                              : "Sign Out"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="hidden md:flex items-center space-x-2">
                  <Link to="/auth/login">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="whitespace-nowrap text-xs px-3 py-1.5"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/auth/register">
                    <Button
                      variant="gradient"
                      size="sm"
                      className="whitespace-nowrap text-xs px-3 py-1.5"
                    >
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <XIcon /> : <MenuIcon />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-surface-600 bg-surface-900/95 backdrop-blur-xl">
            <div className="container-custom py-6 space-y-4">
              <NavLink to="/" icon={<FireIcon size="sm" />}>
                Live Auctions
              </NavLink>

              {isAuthenticated &&
                (currentUser.user.role === "seller" ||
                currentUser.user.role === "admin" ? (
                  <>
                    <NavLink
                      to="/sell/new"
                      icon={<ShoppingBagIcon size="sm" />}
                    >
                      Create Auction
                    </NavLink>
                    <NavLink
                      to="/sell/mine"
                      icon={<TrendingUpIcon size="sm" />}
                    >
                      My Auctions
                    </NavLink>
                  </>
                ) : null)}

              {isAuthenticated && (
                <>
                  <NavLink
                    to="/counter-offers/pending"
                    icon={<HammerIcon size="sm" />}
                    badge={pendingCounterOffers?.count}
                  >
                    Counter-Offers
                  </NavLink>
                  <NavLink
                    to="/notifications"
                    icon={<BellIcon size="sm" />}
                    badge={unreadCount?.count}
                  >
                    Notifications
                  </NavLink>
                </>
              )}

              {/* Mobile Auth */}
              <div className="pt-4 border-t border-surface-600">
                {isAuthenticated ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-surface-800 rounded-xl">
                      <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                        <UserIcon className="text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-dark-100">
                          {currentUser.user.name}
                        </div>
                        <div className="text-sm text-primary-400 capitalize">
                          {currentUser.user.role}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={handleLogout}
                      isLoading={logoutMutation.isPending}
                      className="w-full"
                    >
                      {logoutMutation.isPending ? "Signing out..." : "Sign Out"}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link to="/auth/login" className="block">
                      <Button variant="outline" size="md" className="w-full">
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/auth/register" className="block">
                      <Button variant="gradient" size="md" className="w-full">
                        Get Started
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="container-custom py-8 min-h-[calc(100vh-200px)]">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-surface-900/50 border-t border-surface-700/50 mt-16">
        <div className="container-custom px-6 lg:px-12 py-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <img
                src="/favicon.png"
                alt="AuctionHub Logo"
                className="w-6 h-6"
              />
              <span className="text-lg font-bold text-gradient">
                AuctionHub
              </span>
            </div>

            <p className="text-dark-400 text-sm max-w-md mx-auto">
              The premier destination for premium auctions. Discover rare items
              and bid with confidence.
            </p>

            <div className="flex items-center justify-center gap-6 text-xs text-dark-500">
              <a href="#" className="hover:text-primary-400 transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-primary-400 transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-primary-400 transition-colors">
                Support
              </a>
            </div>

            <div className="border-t border-surface-700/50 pt-4 mt-6">
              <p className="text-dark-400 text-xs flex items-center justify-center gap-2">
                <span>crafted by</span>
                <span className="text-primary-400 font-semibold">sandeep</span>
                <span>with</span>
                <span className="text-red-400 animate-pulse">❤️</span>
                <span>& lots of</span>
                <span className="text-yellow-400">☕</span>
                <span className="text-blue-400">💻</span>
                <span className="text-green-400">🚀</span>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
