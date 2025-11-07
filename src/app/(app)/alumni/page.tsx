import SearchBar from "@/components/SearchBar";
import AlumniCard from "@/components/AlumniCard";
import { createClient } from "@/lib/supabase/server";
import { requireUser, getApprovalStatus } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Search, Filter } from "lucide-react";
import AlumniFilters from "@/components/AlumniFilters";

const PAGE_SIZE = 20;

async function getAlumni(params: { q?: string | null; page?: string | null; year?: string | null; dept?: string | null; company?: string | null; }) {
  const { q, page, year, dept, company } = params;
  const supabase = await createClient();

  const pageNum = Math.max(1, Number(page ?? "1"));
  const from = (pageNum - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  try {
    // Base filtered query builder (without pagination)
    let baseQuery = supabase
      .from("alumni_details")
      .select("id, headline, grad_year, department, current_company, current_title")
      .order("grad_year", { ascending: false });

    // Apply filters
    if (year) baseQuery = baseQuery.eq("grad_year", Number(year));
    if (dept) baseQuery = baseQuery.ilike("department", `%${dept}%`);
    if (company) baseQuery = baseQuery.ilike("current_company", `%${company}%`);

    // SQL-side search across alumni_details and profiles (name)
    if (q) {
      const search = q.replace(/%/g, "");
      // Find matching profile IDs by name
      const { data: nameMatches } = await supabase
        .from("profiles")
        .select("id")
        .ilike("full_name", `%${search}%`);

      const nameIds = (nameMatches || []).map((p: any) => p.id);
      const idsList = nameIds.length ? `(${nameIds.map((id: string) => `"${id}"`).join(",")})` : "()";

      // Build OR filter across columns and optional id match
      const orParts = [
        `department.ilike.%${search}%`,
        `current_company.ilike.%${search}%`,
        `current_title.ilike.%${search}%`,
      ];
      if (nameIds.length) {
        orParts.unshift(`id.in.${idsList}`);
      }
      baseQuery = baseQuery.or(orParts.join(","));
    }

    // Count with filters (server-side)
    const { count, error: countError } = await baseQuery.select("*", { count: "exact", head: true });
    if (countError) {
      console.error("Error counting alumni:", countError);
      return { data: [], count: 0, page: pageNum };
    }
    const totalCount = count || 0;

    // Data page with range
    const { data: pageAlumni, error: pageError } = await baseQuery.range(from, to);
    if (pageError) {
      console.error("Error fetching alumni page:", pageError);
      return { data: [], count: totalCount, page: pageNum };
    }

    // Get user IDs and fetch profiles separately
    const userIds = (pageAlumni || []).map((a: any) => a.id);
    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .in("id", userIds);

    // Convert storage paths to public URLs using Supabase storage
    if (profilesData) {
      for (const profile of profilesData) {
        if (profile.avatar_url) {
          // Get public URL from storage (handles both storage paths and full URLs)
          if (!profile.avatar_url.startsWith('http://') && !profile.avatar_url.startsWith('https://')) {
            // getPublicUrl is synchronous
            try {
              const { data } = supabase.storage.from('avatars').getPublicUrl(profile.avatar_url);
              if (data && data.publicUrl) {
                profile.avatar_url = data.publicUrl;
              } else {
                // Fallback: manually construct URL if getPublicUrl fails
                const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
                profile.avatar_url = `${supabaseUrl}/storage/v1/object/public/avatars/${profile.avatar_url}`;
              }
            } catch (error) {
              console.error(`Error getting public URL for avatar ${profile.avatar_url}:`, error);
              // Fallback: manually construct URL
              const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
              profile.avatar_url = `${supabaseUrl}/storage/v1/object/public/avatars/${profile.avatar_url}`;
            }
          }
          // If already a full URL, keep it as is
        }
      }
    }

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
    }

    // Create a map for quick lookup
    const profilesMap = new Map((profilesData || []).map((p: any) => [p.id, p]));

    // Combine data
    let combinedData = (pageAlumni || []).map((alumni: any) => ({
      ...alumni,
      profiles: profilesMap.get(alumni.id) || { full_name: null, avatar_url: null },
    }));

    return { data: combinedData, count: totalCount, page: pageNum };
  } catch (err) {
    console.error("Unexpected error in getAlumni:", err);
    return { data: [], count: 0, page: pageNum };
  }
}

async function getAlumniStats() {
  const supabase = await createClient();
  
  // Get unique graduation years
  const { data: yearsData } = await supabase
    .from("alumni_details")
    .select("grad_year")
    .not("grad_year", "is", null);
  
  const uniqueYears = [...new Set((yearsData || []).map((y: any) => y.grad_year))].sort((a, b) => b - a);

  // Get unique departments
  const { data: deptData } = await supabase
    .from("alumni_details")
    .select("department")
    .not("department", "is", null);
  
  const uniqueDepartments = [...new Set((deptData || []).map((d: any) => d.department).filter(Boolean))].sort();

  return { uniqueYears, uniqueDepartments };
}

export default async function AlumniList({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const user = await requireUser();
  
  const status = await getApprovalStatus(user.id);
  if (status !== "approved") {
    redirect("/profile/pending");
  }

  const params = await searchParams;
  const q = (params.q as string) || null;
  const year = (params.year as string) || null;
  const dept = (params.dept as string) || null;
  const company = (params.company as string) || null;
  const page = (params.page as string) || null;

  const { data, count } = await getAlumni({ q, page, year, dept, company });
  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const stats = await getAlumniStats();

  const hasFilters = !!(year || dept || company || q);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-green-600 bg-clip-text text-transparent">
            Alumni Directory
          </h1>
          <p className="text-zinc-600 mt-1">Connect with your fellow graduates</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
          <Users className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-semibold text-blue-900">{count}</span>
          <span className="text-sm text-blue-700">alumni</span>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="border-zinc-200">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <SearchBar />
            </div>
            <AlumniFilters stats={stats} currentFilters={{ year, dept, company }} />
          </div>
        </CardContent>
      </Card>

      {/* Active Filters */}
      {hasFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-zinc-600">Active filters:</span>
          {q && (
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full border border-blue-200">
              Search: {q}
            </span>
          )}
          {year && (
            <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full border border-green-200">
              Year: {year}
            </span>
          )}
          {dept && (
            <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full border border-purple-200">
              Dept: {dept}
            </span>
          )}
          {company && (
            <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full border border-orange-200">
              Company: {company}
            </span>
          )}
          <a
            href="/alumni"
            className="px-3 py-1 bg-zinc-100 text-zinc-700 text-sm rounded-full border border-zinc-200 hover:bg-zinc-200 transition-colors"
          >
            Clear all
          </a>
        </div>
      )}

      {/* Results */}
      {data.length > 0 ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.map((row: any) => (
              <AlumniCard
                key={row.id}
                id={row.id}
                name={row.profiles?.full_name ?? "—"}
                headline={row.headline}
                company={row.current_company}
                role={row.current_title}
                gradYear={row.grad_year}
                department={row.department}
                avatarUrl={row.profiles?.avatar_url}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                const params = new URLSearchParams();
                if (q) params.set("q", q);
                if (year) params.set("year", year);
                if (dept) params.set("dept", dept);
                if (company) params.set("company", company);
                params.set("page", String(pageNum));
                
                return (
                  <a
                    key={pageNum}
                    href={`/alumni?${params.toString()}`}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      Number(page) === pageNum || (!page && pageNum === 1)
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50"
                    }`}
                  >
                    {pageNum}
                  </a>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <Card className="border-zinc-200">
          <CardContent className="p-12 text-center">
            <Search className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-zinc-900 mb-2">No alumni found</h3>
            <p className="text-zinc-600 mb-4">
              {hasFilters
                ? "Try adjusting your filters or search query"
                : "No alumni registered yet"}
            </p>
            {hasFilters && (
              <a
                href="/alumni"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </a>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
