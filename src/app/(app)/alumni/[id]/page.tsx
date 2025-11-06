import { createClient } from "@/lib/supabase/server";
import { requireUser, getApprovalStatus } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, GraduationCap, MapPin, Briefcase, User, Calendar, Award, Phone, MessageCircle, Linkedin, Twitter, Facebook, Instagram, Github, Globe } from "lucide-react";
import Avatar from "@/components/Avatar";

interface EducationItem { 
  degree: string | null; 
  major: string | null; 
  start_year: number | null; 
  end_year: number | null; 
}

interface WorkItem { 
  company: string | null; 
  role: string | null; 
  start_date: string | null; 
  end_date: string | null; 
  description: string | null; 
}

interface SkillItem { 
  name: string | null; 
}

async function getProfile(userId: string) {
  const supabase = await createClient();
  
  // Fetch all data in parallel
  const [
    { data: profile }, 
    { data: details }, 
    { data: education }, 
    { data: work }, 
    { data: skills }
  ] = await Promise.all([
    supabase.from("profiles").select("full_name, avatar_url").eq("id", userId).single(),
    supabase.from("alumni_details").select("headline, bio, grad_year, department, current_company, current_title, location, father_name, primary_mobile, whatsapp_number, linkedin_url, twitter_url, facebook_url, instagram_url, github_url, website_url").eq("id", userId).single(),
    supabase.from("education").select("degree, major, start_year, end_year").eq("user_id", userId).order("start_year", { ascending: true }),
    supabase.from("work_history").select("company, role, start_date, end_date, description").eq("user_id", userId).order("start_date", { ascending: false }),
    supabase.from("skills").select("name").eq("user_id", userId).order("name"),
  ]);

  // Get public URL for avatar if it's a storage path
  let avatarUrl = profile?.avatar_url || null;
  if (avatarUrl && !avatarUrl.startsWith('http://') && !avatarUrl.startsWith('https://')) {
    // getPublicUrl is synchronous
    try {
      const { data } = supabase.storage.from('avatars').getPublicUrl(avatarUrl);
      if (data && data.publicUrl) {
        avatarUrl = data.publicUrl;
      } else {
        // Fallback: manually construct URL if getPublicUrl fails
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        avatarUrl = `${supabaseUrl}/storage/v1/object/public/avatars/${avatarUrl}`;
      }
    } catch (error) {
      console.error(`Error getting public URL for avatar ${avatarUrl}:`, error);
      // Fallback: manually construct URL
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      avatarUrl = `${supabaseUrl}/storage/v1/object/public/avatars/${avatarUrl}`;
    }
  }

  return { 
    profile, 
    details, 
    education: (education as EducationItem[]) ?? [], 
    work: (work as WorkItem[]) ?? [], 
    skills: (skills as SkillItem[]) ?? [],
    avatarUrl
  };
}

export default async function AlumniDetail({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const status = await getApprovalStatus(user.id);
  
  if (status !== "approved") {
    redirect("/profile/pending");
  }

  const { id } = await params;
  const { profile, details, education, work, skills, avatarUrl } = await getProfile(id);

  if (!profile) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <Card>
          <CardContent className="p-12 text-center">
            <User className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-zinc-900 mb-2">Profile Not Found</h2>
            <p className="text-zinc-600">The alumni profile you&apos;re looking for doesn&apos;t exist or isn&apos;t approved yet.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const fullName = profile.full_name || "Unknown";
  const initials = fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Header Section */}
      <Card className="border-zinc-200 mb-6">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            {/* Avatar */}
            <div className="shrink-0">
              <Avatar
                src={avatarUrl || null}
                alt={fullName}
                initials={initials}
                size="lg"
                className="border-4 border-zinc-100 shadow-lg"
              />
            </div>

            {/* Name and Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-green-600 bg-clip-text text-transparent mb-2">
                {fullName}
              </h1>
              {details?.headline && (
                <p className="text-lg text-zinc-700 mb-3">{details.headline}</p>
              )}
              <div className="flex flex-wrap gap-4 text-sm text-zinc-600">
                {details?.current_company && (
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-4 h-4" />
                    <span>{details.current_company}</span>
                    {details.current_title && <span className="text-zinc-400">· {details.current_title}</span>}
                  </div>
                )}
                {details?.department && (
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4" />
                    <span>{details.department}</span>
                  </div>
                )}
                {details?.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    <span>{details.location}</span>
                  </div>
                )}
                {details?.grad_year && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    <span>Graduated {details.grad_year}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* About Section */}
          {details?.bio && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  About
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-zinc-700 whitespace-pre-wrap leading-relaxed">{details.bio}</p>
              </CardContent>
            </Card>
          )}

          {/* Experience Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Experience
              </CardTitle>
            </CardHeader>
            <CardContent>
              {work.length > 0 ? (
                <div className="space-y-4">
                  {work.map((w, i) => (
                    <div key={i} className="relative pl-6 border-l-2 border-zinc-200 last:border-l-0 pb-4 last:pb-0">
                      <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-500 border-2 border-white"></div>
                      <div>
                        <h3 className="font-semibold text-zinc-900">
                          {w.role || "Role not specified"}
                        </h3>
                        <p className="text-zinc-600 font-medium">{w.company}</p>
                        <p className="text-sm text-zinc-500 mt-1">
                          {w.start_date && new Date(w.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          {w.end_date ? ` - ${new Date(w.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}` : ' - Present'}
                        </p>
                        {w.description && (
                          <p className="text-sm text-zinc-600 mt-2">{w.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-zinc-500 text-sm">No work experience added.</p>
              )}
            </CardContent>
          </Card>

          {/* Education Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Education
              </CardTitle>
            </CardHeader>
            <CardContent>
              {education.length > 0 ? (
                <div className="space-y-4">
                  {education.map((e, i) => (
                    <div key={i} className="p-4 rounded-lg border border-zinc-200 bg-zinc-50">
                      <h3 className="font-semibold text-zinc-900">
                        {e.degree || "Degree"}
                        {e.major && <span className="text-zinc-600 font-normal"> in {e.major}</span>}
                      </h3>
                      <p className="text-sm text-zinc-600 mt-1">
                        {e.start_year && e.end_year ? `${e.start_year} - ${e.end_year}` : e.start_year || e.end_year || "Year not specified"}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-zinc-500 text-sm">No education added.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Skills Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Skills
              </CardTitle>
            </CardHeader>
            <CardContent>
              {skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {skills.map((s, i) => (
                    <Badge key={i} variant="secondary" className="text-sm">
                      {s.name}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-zinc-500 text-sm">No skills added.</p>
              )}
            </CardContent>
          </Card>

          {/* Contact Details */}
          {(details?.primary_mobile || details?.whatsapp_number || details?.linkedin_url || details?.twitter_url || details?.facebook_url || details?.instagram_url || details?.github_url || details?.website_url) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Contact Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {details.primary_mobile && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-zinc-500" />
                    <a href={`tel:${details.primary_mobile}`} className="text-sm text-blue-600 hover:underline">
                      {details.primary_mobile}
                    </a>
                  </div>
                )}
                {details.whatsapp_number && (
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-zinc-500" />
                    <a href={`https://wa.me/${details.whatsapp_number.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-sm text-green-600 hover:underline">
                      {details.whatsapp_number}
                    </a>
                  </div>
                )}
                {details.linkedin_url && (
                  <div className="flex items-center gap-2">
                    <Linkedin className="w-4 h-4 text-blue-600" />
                    <a href={details.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline truncate">
                      LinkedIn Profile
                    </a>
                  </div>
                )}
                {details.twitter_url && (
                  <div className="flex items-center gap-2">
                    <Twitter className="w-4 h-4 text-blue-400" />
                    <a href={details.twitter_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline truncate">
                      Twitter/X Profile
                    </a>
                  </div>
                )}
                {details.facebook_url && (
                  <div className="flex items-center gap-2">
                    <Facebook className="w-4 h-4 text-blue-700" />
                    <a href={details.facebook_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline truncate">
                      Facebook Profile
                    </a>
                  </div>
                )}
                {details.instagram_url && (
                  <div className="flex items-center gap-2">
                    <Instagram className="w-4 h-4 text-pink-600" />
                    <a href={details.instagram_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline truncate">
                      Instagram Profile
                    </a>
                  </div>
                )}
                {details.github_url && (
                  <div className="flex items-center gap-2">
                    <Github className="w-4 h-4 text-zinc-700" />
                    <a href={details.github_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline truncate">
                      GitHub Profile
                    </a>
                  </div>
                )}
                {details.website_url && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-zinc-500" />
                    <a href={details.website_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline truncate">
                      Personal Website
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Additional Info */}
          {(details?.father_name || details?.grad_year) && (
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {details.father_name && (
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wide">Father&apos;s Name</p>
                    <p className="text-sm text-zinc-900 mt-1">{details.father_name}</p>
                  </div>
                )}
                {details.grad_year && (
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wide">Graduation Year</p>
                    <p className="text-sm text-zinc-900 mt-1">{details.grad_year}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
