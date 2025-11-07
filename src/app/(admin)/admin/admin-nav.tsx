"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Users, Upload, Mail, Home, List, UserPlus,
  UserCircle, Settings, Calendar, CalendarPlus
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
    <div className="mt-6">
      <h3 className="px-4 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
        {title}
      </h3>
      <div className="mt-2 space-y-1">
        {children}
      </div>
    </div>
  );
}

export function AdminNav({ pendingCount }: { pendingCount: number }) {
  return (
    <nav className="space-y-2">
      <NavSection title="Admin Panel">
        <NavItem href="/admin/dashboard" icon={Home} label="Dashboard" />
        <NavItem href="/admin/alumni" icon={Users} label="Pending Approvals" badge={pendingCount} />
        <NavItem href="/admin/create-alumni" icon={UserPlus} label="Create Alumni" />
        <NavItem href="/admin/import" icon={Upload} label="Import Alumni" />
        <NavItem href="/admin/invites" icon={Mail} label="Send Invites" />
      </NavSection>

      <NavSection title="Events">
        <NavItem href="/admin/events/create" icon={CalendarPlus} label="Create Event" />
        <NavItem href="/events" icon={Calendar} label="View Events" section="/events" />
      </NavSection>

      <NavSection title="Alumni Directory">
        <NavItem href="/admin/alumni-list" icon={List} label="Alumni List" />
        <NavItem href="/alumni" icon={Home} label="Browse Alumni" section="/alumni" />
      </NavSection>

      <NavSection title="My Account">
        <NavItem href="/profile" icon={UserCircle} label="My Profile" />
        <NavItem href="/profile/setup" icon={Settings} label="Profile Setup" />
      </NavSection>
    </nav>
  );
}

