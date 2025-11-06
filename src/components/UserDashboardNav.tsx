"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  User, Users, Home, Settings, FileText, Calendar
} from "lucide-react";

interface NavItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  badge?: number;
  section?: string;
}

function NavItem({ href, icon: Icon, label, badge, section }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href || (section && pathname.startsWith(section));

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        isActive
          ? "bg-gradient-to-r from-blue-50 to-green-50 text-blue-700 font-semibold border border-blue-200"
          : "hover:bg-blue-50 text-zinc-700 hover:text-blue-600"
      }`}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
      {badge && badge > 0 && (
        <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
          {badge}
        </span>
      )}
    </Link>
  );
}

function NavSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 px-4">
        {title}
      </h3>
      <div className="space-y-1">
        {children}
      </div>
    </div>
  );
}

export function UserDashboardNav() {
  return (
    <nav className="space-y-2">
      <NavSection title="Main">
        <NavItem href="/dashboard" icon={Home} label="Dashboard" />
        <NavItem href="/alumni" icon={Users} label="Alumni Directory" section="/alumni" />
        <NavItem href="/events" icon={Calendar} label="Events" section="/events" />
      </NavSection>

      <NavSection title="My Account">
        <NavItem href="/profile" icon={User} label="My Profile" section="/profile" />
        <NavItem href="/profile/setup" icon={Settings} label="Profile Settings" />
      </NavSection>
    </nav>
  );
}

