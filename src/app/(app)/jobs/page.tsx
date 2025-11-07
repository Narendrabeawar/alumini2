import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { requireUser, getApprovalStatus } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, MapPin, DollarSign, Calendar, ExternalLink, Mail } from "lucide-react";
import { format } from "date-fns";

async function getJobs() {
  const supabase = await createClient();
  
  const { data: jobs, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("is_published", true)
    .or("expires_at.is.null,expires_at.gt." + new Date().toISOString())
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching jobs:", error);
    return [];
  }

  return jobs || [];
}

export default async function JobsPage() {
  const user = await requireUser();
  
  const status = await getApprovalStatus(user.id);
  if (status !== "approved") {
    redirect("/profile/pending");
  }

  const jobs = await getJobs();

  const jobTypeColors: Record<string, string> = {
    "full-time": "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    "part-time": "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    "contract": "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    "internship": "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
    "freelance": "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300",
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-green-600 bg-clip-text text-transparent mb-2">
          Job Opportunities
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Discover career opportunities shared by alumni and partners
        </p>
      </div>

      {jobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job: any) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                      {job.title}
                    </h3>
                    <p className="text-lg font-medium text-blue-600 dark:text-blue-400">
                      {job.company}
                    </p>
                  </div>
                  {job.job_type && (
                    <Badge className={jobTypeColors[job.job_type] || "bg-zinc-100 text-zinc-700"}>
                      {job.job_type.replace("-", " ")}
                    </Badge>
                  )}
                </div>

                {job.description && (
                  <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-4 line-clamp-3">
                    {job.description}
                  </p>
                )}

                <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                  {job.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span>{job.location}</span>
                    </div>
                  )}

                  {job.salary_range && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span>{job.salary_range}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-zinc-400" />
                    <span>Posted {format(new Date(job.created_at), "MMM d, yyyy")}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {job.application_url && (
                    <Button asChild className="flex-1">
                      <a href={job.application_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Apply
                      </a>
                    </Button>
                  )}
                  {job.application_email && (
                    <Button asChild variant="outline" className="flex-1">
                      <a href={`mailto:${job.application_email}`}>
                        <Mail className="w-4 h-4 mr-2" />
                        Email
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-zinc-200">
          <CardContent className="p-12 text-center">
            <Briefcase className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              No job opportunities available
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400">
              Check back later for new opportunities
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

