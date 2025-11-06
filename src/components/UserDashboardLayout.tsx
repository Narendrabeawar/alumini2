import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth";
import { UserDashboardNav } from "./UserDashboardNav";

export async function UserDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-100">
      <div className="flex">
        {/* Sidebar - Fixed */}
        <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-zinc-200 overflow-y-auto z-50">
          <div className="p-6 h-full flex flex-col">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-700 to-green-600 bg-clip-text text-transparent mb-6">
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

        {/* Main Content - Offset for fixed sidebar */}
        <main className="flex-1 ml-64 p-8 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}

