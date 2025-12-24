"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserDashboardNav } from "./UserDashboardNav";
import { LogOut } from "lucide-react";
import { signOut } from "@/app/actions/auth";

export function UserDashboardLayoutClient({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-100">
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-zinc-200 px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold bg-gradient-to-r from-blue-700 to-green-600 bg-clip-text text-transparent">
          Alumni Dashboard
        </h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      <div className="flex">
        {/* Mobile Overlay */}
        {mobileMenuOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar - Hidden on mobile, drawer on mobile when open */}
        <aside
          className={`fixed left-0 top-0 h-screen w-64 bg-white border-r border-zinc-200 overflow-y-auto z-50 transition-transform duration-300 ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 lg:static lg:z-auto`}
        >
          <div className="p-4 sm:p-6 h-full flex flex-col pt-16 lg:pt-6">
            <h1 className="hidden lg:block text-xl font-bold bg-gradient-to-r from-blue-700 to-green-600 bg-clip-text text-transparent mb-6">
              Alumni Dashboard
            </h1>
            <div className="flex-1">
              <UserDashboardNav />
            </div>

            <div className="mt-auto pt-6 border-t border-zinc-200">
              <form action={signOut}>
                <Button type="submit" variant="outline" className="w-full">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </form>
            </div>
          </div>
        </aside>

        {/* Main Content - Full width on mobile, offset on desktop */}
        <main className="flex-1 w-full lg:ml-64 p-4 sm:p-6 md:p-8 min-h-screen pt-16 lg:pt-8">
          {children}
        </main>
      </div>
    </div>
  );
}

