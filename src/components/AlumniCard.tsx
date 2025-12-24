import Link from "next/link";
import { Building2, GraduationCap } from "lucide-react";
import Avatar from "@/components/Avatar";

export interface AlumniCardProps {
  id: string;
  name: string;
  headline?: string | null;
  company?: string | null;
  role?: string | null;
  gradYear?: number | null;
  department?: string | null;
  avatarUrl?: string | null;
}

export default function AlumniCard({ id, name, headline, company, role, gradYear, department, avatarUrl }: AlumniCardProps) {
  const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <Link href={`/alumni/${id}`}>
      <div className="group relative bg-white rounded-xl border border-zinc-200 p-4 sm:p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-200 cursor-pointer">
        <div className="flex items-start gap-3 sm:gap-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <Avatar
              src={avatarUrl || null}
              alt={name}
              initials={initials}
              size="md"
              className="group-hover:border-blue-200 transition-colors"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base sm:text-lg text-zinc-900 group-hover:text-blue-700 transition-colors truncate">
                  {name}
                </h3>
                {headline && (
                  <p className="text-xs sm:text-sm text-zinc-600 mt-1 line-clamp-2">{headline}</p>
                )}
              </div>
              {gradYear && (
                <span className="flex-shrink-0 px-2 sm:px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200">
                  {gradYear}
                </span>
              )}
            </div>

            {/* Info Grid */}
            <div className="mt-3 sm:mt-4 space-y-2">
              {company && (
                <div className="flex items-center gap-2 text-sm text-zinc-700">
                  <Building2 className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                  <span className="truncate">
                    {company}
                    {role && <span className="text-zinc-500"> · {role}</span>}
                  </span>
                </div>
              )}
              {department && (
                <div className="flex items-center gap-2 text-sm text-zinc-600">
                  <GraduationCap className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                  <span className="truncate">{department}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
