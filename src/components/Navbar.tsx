"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { LogOut, User, Users, Calendar, Briefcase, Image as ImageIcon, Newspaper, Search, Menu, X } from "lucide-react";
import { NotificationBell } from "@/components/NotificationBell";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const supabase = createClient();

  useEffect(() => {
    // Check if user is logged in
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const isLoginPage = pathname === "/login";
  const isRegisterPage = pathname === "/register";

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/alumni?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  }

  const navLinks = [
    { href: "/alumni", label: "ALUMNI DIRECTORY", icon: Users },
    { href: "/events", label: "EVENTS", icon: Calendar },
    { href: "/jobs", label: "CAREER OPPORTUNITY", icon: Briefcase },
    { href: "/gallery", label: "GALLERY", icon: ImageIcon },
    { href: "/news", label: "NEWS & UPDATES", icon: Newspaper },
  ];

  return (
    <nav className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 shadow-lg sticky top-0 z-50 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Desktop Navbar */}
        <div className="hidden lg:flex items-center h-20 relative gap-4 xl:gap-6">
          {/* Logo Card - Left Side */}
          <Link 
            href="/" 
            className="flex flex-col items-center justify-center px-5 xl:px-7 py-3 xl:py-4 bg-blue-900 dark:bg-zinc-900 rounded-lg border border-blue-800 dark:border-zinc-800 hover:bg-blue-800 transition-colors shrink-0 shadow-xl min-w-[220px] xl:min-w-[260px]"
          >
            <div className="text-xs xl:text-sm text-green-400 font-medium tracking-widest uppercase mb-1 whitespace-nowrap">alumni</div>
            <div className="text-xl xl:text-2xl font-bold text-white tracking-tight text-center whitespace-nowrap">ZEXA TECH SCHOOL</div>
            <div className="text-xs xl:text-sm text-blue-200 dark:text-zinc-400 font-light whitespace-nowrap">Ajmer, Rajasthan</div>
          </Link>

          {/* Left Navigation Links */}
          <div className="flex items-center gap-4 xl:gap-6 shrink-0">
            <Link
              href="/alumni"
              className={`text-xs xl:text-sm font-semibold uppercase tracking-wider transition-colors whitespace-nowrap ${
                pathname.startsWith("/alumni")
                  ? "text-green-400 border-b-2 border-green-400 pb-1"
                  : "text-white hover:text-green-400"
              }`}
            >
              ALUMNI DIRECTORY
            </Link>
            <Link
              href="/events"
              className={`text-xs xl:text-sm font-semibold uppercase tracking-wider transition-colors whitespace-nowrap ${
                pathname.startsWith("/events")
                  ? "text-green-400 border-b-2 border-green-400 pb-1"
                  : "text-white hover:text-green-400"
              }`}
            >
              EVENTS
            </Link>
          </div>

          {/* Spacer */}
          <div className="flex-1"></div>

          {/* Right Navigation Links */}
          <div className="flex items-center gap-4 xl:gap-6 shrink-0">
            <Link
              href="/jobs"
              className={`text-xs xl:text-sm font-semibold uppercase tracking-wider transition-colors whitespace-nowrap ${
                pathname.startsWith("/jobs")
                  ? "text-green-400 border-b-2 border-green-400 pb-1"
                  : "text-white hover:text-green-400"
              }`}
            >
              CAREER OPPORTUNITY
            </Link>
            <Link
              href="/gallery"
              className={`text-xs xl:text-sm font-semibold uppercase tracking-wider transition-colors whitespace-nowrap ${
                pathname.startsWith("/gallery")
                  ? "text-green-400 border-b-2 border-green-400 pb-1"
                  : "text-white hover:text-green-400"
              }`}
            >
              GALLERY
            </Link>
          </div>

          {/* Right Side: Search & Auth */}
          <div className="flex items-center gap-2 xl:gap-3 shrink-0">
            {user ? (
              <>
                <form onSubmit={handleSearch} className="hidden 2xl:flex items-center gap-2">
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-40 xl:w-48 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20 focus:border-green-400 text-sm"
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                  </div>
                </form>
                <NotificationBell />
                <Button asChild variant="ghost" size="sm" className="text-white hover:bg-white/10 hover:text-green-400 text-xs xl:text-sm">
                  <Link href="/profile">
                    <User className="w-4 h-4 mr-2" />
                    <span>Profile</span>
                  </Link>
                </Button>
                <Button
                  onClick={handleLogout}
                  size="sm"
                  className="bg-blue-700 hover:bg-blue-600 text-white border-0 text-xs xl:text-sm px-3 xl:px-4"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  <span>Logout</span>
                </Button>
              </>
            ) : (
              <>
                <form onSubmit={handleSearch} className="hidden 2xl:flex items-center gap-2">
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-40 xl:w-48 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20 focus:border-green-400 text-sm"
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                  </div>
                </form>
                {!isLoginPage && (
                  <Button asChild variant="ghost" size="sm" className="text-white hover:bg-white/10 hover:text-green-400 text-xs xl:text-sm">
                    <Link href="/login">Login</Link>
                  </Button>
                )}
                {!isRegisterPage && (
                  <Button asChild size="sm" className="bg-green-500 hover:bg-green-600 text-white border-0 text-xs xl:text-sm px-3 xl:px-4">
                    <Link href="/register">Register</Link>
                  </Button>
                )}
              </>
            )}
            <ThemeToggle />
          </div>
        </div>


        {/* Mobile Navbar */}
        <div className="lg:hidden flex items-center justify-between h-16">
          <Link href="/" className="flex flex-col items-start">
            <div className="text-xs text-green-400 font-medium tracking-widest uppercase">alumni</div>
            <div className="text-lg font-bold text-white">ZEXA TECH SCHOOL</div>
          </Link>

          <div className="flex items-center gap-2">
            {user && <NotificationBell />}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden pb-4 border-t border-blue-700/50">
            <div className="flex flex-col gap-2 mt-4">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                      pathname.startsWith(link.href)
                        ? "bg-green-500/20 text-green-400 border-l-4 border-green-400"
                        : "text-white hover:bg-white/10"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-semibold uppercase tracking-wider">{link.label}</span>
                  </Link>
                );
              })}
              <div className="border-t border-blue-700/50 mt-2 pt-2">
                {user ? (
                  <>
                    <Link
                      href="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 rounded-lg text-white hover:bg-white/10"
                    >
                      <User className="w-4 h-4" />
                      <span className="text-sm font-semibold">Profile</span>
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 px-4 py-2 rounded-lg text-white hover:bg-white/10 w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm font-semibold">Logout</span>
                    </button>
                  </>
                ) : (
                  <>
                    {!isLoginPage && (
                      <Link
                        href="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-center px-4 py-2 rounded-lg text-white hover:bg-white/10 mb-2"
                      >
                        Login
                      </Link>
                    )}
                    {!isRegisterPage && (
                      <Link
                        href="/register"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-center px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white"
                      >
                        Register
                      </Link>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

