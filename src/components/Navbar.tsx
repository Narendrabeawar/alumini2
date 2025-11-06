"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { LogOut, User } from "lucide-react";
import { NotificationBell } from "@/components/NotificationBell";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
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
  const isPublicPage = pathname === "/" || pathname.startsWith("/login") || pathname.startsWith("/register") || pathname.startsWith("/invite");

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <nav className="border-b bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="text-xl font-bold bg-gradient-to-r from-blue-700 to-green-600 bg-clip-text text-transparent">
            Zexa Tech School, Ajmer Rajasthan
          </Link>
          <div className="flex items-center gap-4">
            {!user ? (
              // Public navbar - show Login/Register
              <>
                {!isLoginPage && (
                  <Button asChild variant="ghost">
                    <Link href="/login">Login</Link>
                  </Button>
                )}
                {!isRegisterPage && (
                  <Button asChild>
                    <Link href="/register">Register</Link>
                  </Button>
                )}
              </>
            ) : (
              // Logged in navbar - show Notifications, Profile/Logout
              <>
                <NotificationBell />
                <Button asChild variant="ghost">
                  <Link href="/profile">
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </Link>
                </Button>
                <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </>
            )}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}

