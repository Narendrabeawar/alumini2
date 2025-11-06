"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import AvatarUploader from "@/components/AvatarUploader";
import { showToast } from "@/lib/toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { trackEvent } from "@/lib/analytics";

interface InitialData {
  profile: { full_name: string | null; avatar_url: string | null } | null;
  details: {
    headline: string | null;
    bio: string | null;
    grad_year: number | null;
    department: string | null;
    current_company: string | null;
    current_role: string | null;
    location: string | null;
    primary_mobile: string | null;
    whatsapp_number: string | null;
    linkedin_url: string | null;
    twitter_url: string | null;
    facebook_url: string | null;
    instagram_url: string | null;
    github_url: string | null;
    website_url: string | null;
  } | null;
  education: { id: string; degree: string | null; major: string | null; start_year: number | null; end_year: number | null }[];
  work: { id: string; company: string | null; role: string | null; start_date: string | null; end_date: string | null; description: string | null }[];
  skills: { id: string; name: string | null }[];
}

const ProfileSchema = z.object({
  fullName: z.string().min(1, "Full name is required").max(120),
  fatherName: z.string().max(120).optional().or(z.literal("")),
  headline: z.string().max(160).optional().or(z.literal("")),
  bio: z.string().max(1000).optional().or(z.literal("")),
  gradYear: z
    .string()
    .refine((v) => v === "" || (/^\d{4}$/.test(v) && Number(v) >= 1950 && Number(v) <= 2100), {
      message: "Enter a valid 4-digit year",
    }),
  department: z.string().max(120).optional().or(z.literal("")),
  company: z.string().max(120).optional().or(z.literal("")),
  role: z.string().max(120).optional().or(z.literal("")),
  location: z.string().max(120).optional().or(z.literal("")),
  primaryMobile: z.string().max(20).optional().or(z.literal("")),
  whatsappNumber: z.string().max(20).optional().or(z.literal("")),
  linkedinUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  twitterUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  facebookUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  instagramUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  githubUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  websiteUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
});

type ProfileValues = z.infer<typeof ProfileSchema>;

export default function ProfileEditForm({ userId, initialData }: { userId: string; initialData: InitialData }) {
  const supabase = createClient();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [fullName, setFullName] = useState(initialData.profile?.full_name ?? "");
  const [avatarUrl, setAvatarUrl] = useState(initialData.profile?.avatar_url ?? "");
  const [headline, setHeadline] = useState(initialData.details?.headline ?? "");
  const [bio, setBio] = useState(initialData.details?.bio ?? "");
  const [gradYear, setGradYear] = useState(initialData.details?.grad_year?.toString() ?? "");
  const [department, setDepartment] = useState(initialData.details?.department ?? "");
  const [company, setCompany] = useState(initialData.details?.current_company ?? "");
  const [role, setRole] = useState(initialData.details?.current_title ?? "");
  const [location, setLocation] = useState(initialData.details?.location ?? "");
  const [fatherName, setFatherName] = useState(initialData.details?.father_name ?? "");
  const [primaryMobile, setPrimaryMobile] = useState(initialData.details?.primary_mobile ?? "");
  const [whatsappNumber, setWhatsappNumber] = useState(initialData.details?.whatsapp_number ?? "");
  const [linkedinUrl, setLinkedinUrl] = useState(initialData.details?.linkedin_url ?? "");
  const [twitterUrl, setTwitterUrl] = useState(initialData.details?.twitter_url ?? "");
  const [facebookUrl, setFacebookUrl] = useState(initialData.details?.facebook_url ?? "");
  const [instagramUrl, setInstagramUrl] = useState(initialData.details?.instagram_url ?? "");
  const [githubUrl, setGithubUrl] = useState(initialData.details?.github_url ?? "");
  const [websiteUrl, setWebsiteUrl] = useState(initialData.details?.website_url ?? "");
  const [education, setEducation] = useState(initialData.education);
  const [work, setWork] = useState(initialData.work);
  const [skills, setSkills] = useState(initialData.skills);

  const form = useForm<ProfileValues>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      fullName,
      fatherName,
      headline,
      bio,
      gradYear,
      department,
      company,
      role,
      location,
      primaryMobile,
      whatsappNumber,
      linkedinUrl,
      twitterUrl,
      facebookUrl,
      instagramUrl,
      githubUrl,
      websiteUrl,
    },
  });

  function toNumberOrNull(value: string): number | null {
    return value ? Number(value) : null;
  }

  async function onSubmit(values: ProfileValues) {
    setSaving(true);
    setError(null);
    setSuccess(false);
    trackEvent("profile_save_submit");

    try {
      const { error: pe } = await supabase.from("profiles").update({ full_name: values.fullName, avatar_url: avatarUrl || null }).eq("id", userId);
      if (pe) {
        console.error("Profile update error:", pe);
        throw pe;
      }

      const { error: de } = await supabase.from("alumni_details").upsert({
        id: userId,
        headline: values.headline || null,
        bio: values.bio || null,
        grad_year: toNumberOrNull(values.gradYear),
        department: values.department || null,
        current_company: values.company || null,
        current_title: values.role || null,
        location: values.location || null,
        father_name: values.fatherName || null,
        primary_mobile: values.primaryMobile || null,
        whatsapp_number: values.whatsappNumber || null,
        linkedin_url: values.linkedinUrl || null,
        twitter_url: values.twitterUrl || null,
        facebook_url: values.facebookUrl || null,
        instagram_url: values.instagramUrl || null,
        github_url: values.githubUrl || null,
        website_url: values.websiteUrl || null,
      });
      if (de) {
        console.error("Alumni details upsert error:", de);
        throw de;
      }

      const { error: delEdu } = await supabase.from("education").delete().eq("user_id", userId);
      if (delEdu) {
        console.error("Education delete error:", delEdu);
        throw delEdu;
      }
      if (education.length) {
        const { error: insEdu } = await supabase.from("education").insert(
          education.map((e) => ({
            user_id: userId,
            degree: e.degree || null,
            major: e.major || null,
            start_year: e.start_year ?? null,
            end_year: e.end_year ?? null,
          }))
        );
        if (insEdu) {
          console.error("Education insert error:", insEdu);
          throw insEdu;
        }
      }

      const { error: delWork } = await supabase.from("work_history").delete().eq("user_id", userId);
      if (delWork) {
        console.error("Work history delete error:", delWork);
        throw delWork;
      }
      if (work.length) {
        const { error: insWork } = await supabase.from("work_history").insert(
          work.map((w) => ({
            user_id: userId,
            company: w.company || null,
            role: w.role || null,
            start_date: w.start_date || null,
            end_date: w.end_date || null,
            description: w.description || null,
          }))
        );
        if (insWork) {
          console.error("Work history insert error:", insWork);
          throw insWork;
        }
      }

      const { error: delSkills } = await supabase.from("skills").delete().eq("user_id", userId);
      if (delSkills) {
        console.error("Skills delete error:", delSkills);
        throw delSkills;
      }
      if (skills.length) {
        const { error: insSkills } = await supabase.from("skills").insert(
          skills.map((s) => ({ user_id: userId, name: s.name || null }))
        );
        if (insSkills) {
          console.error("Skills insert error:", insSkills);
          throw insSkills;
        }
      }

      // Success - refresh the page data and show success message
      showToast.success("Profile updated successfully!");
      setSuccess(true);
      trackEvent("profile_save_success");
      router.refresh();
    } catch (err) {
      const message = (err && typeof err === "object" && "message" in err) ? String((err as { message?: unknown }).message) : "Failed to save";
      setError(message);
      showToast.error(message);
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <motion.form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <section className="space-y-3">
        <h2 className="font-semibold">Basic Info</h2>
        <div className="flex items-center gap-6">
          <AvatarUploader userId={userId} value={avatarUrl || null} onChange={(p) => setAvatarUrl(p)} />
          <div className="flex-1 grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input id="full_name" {...form.register("fullName")} />
              {form.formState.errors.fullName && <p className="text-sm text-red-600">{form.formState.errors.fullName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="father_name">Father's Name</Label>
              <Input id="father_name" {...form.register("fatherName")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="headline">Headline</Label>
              <Input id="headline" {...form.register("headline")} />
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea id="bio" rows={4} {...form.register("bio")} />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="grad">Graduation Year</Label>
            <Input id="grad" type="number" {...form.register("gradYear")} />
            {form.formState.errors.gradYear && <p className="text-sm text-red-600">{form.formState.errors.gradYear.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="dept">Department</Label>
            <Input id="dept" {...form.register("department")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" {...form.register("location")} />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input id="company" {...form.register("company")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Input id="role" {...form.register("role")} />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">Contact Details</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="primary_mobile">Primary Mobile Number</Label>
            <Input id="primary_mobile" type="tel" placeholder="+91 9876543210" {...form.register("primaryMobile")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="whatsapp_number">WhatsApp Number</Label>
            <Input id="whatsapp_number" type="tel" placeholder="+91 9876543210" {...form.register("whatsappNumber")} />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="linkedin_url">LinkedIn URL</Label>
            <Input id="linkedin_url" type="url" placeholder="https://linkedin.com/in/yourname" {...form.register("linkedinUrl")} />
            {form.formState.errors.linkedinUrl && <p className="text-sm text-red-600">{form.formState.errors.linkedinUrl.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="twitter_url">Twitter/X URL</Label>
            <Input id="twitter_url" type="url" placeholder="https://twitter.com/yourname" {...form.register("twitterUrl")} />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="facebook_url">Facebook URL</Label>
            <Input id="facebook_url" type="url" placeholder="https://facebook.com/yourname" {...form.register("facebookUrl")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="instagram_url">Instagram URL</Label>
            <Input id="instagram_url" type="url" placeholder="https://instagram.com/yourname" {...form.register("instagramUrl")} />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="github_url">GitHub URL</Label>
            <Input id="github_url" type="url" placeholder="https://github.com/yourname" {...form.register("githubUrl")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website_url">Website URL</Label>
            <Input id="website_url" type="url" placeholder="https://yourwebsite.com" {...form.register("websiteUrl")} />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">Education</h2>
        <div className="space-y-3">
          {education.map((e, idx) => (
            <div key={idx} className="grid gap-3 md:grid-cols-4">
              <Input placeholder="Degree" value={e.degree ?? ""} onChange={(ev) => {
                const arr = [...education]; arr[idx] = { ...arr[idx], degree: ev.target.value }; setEducation(arr);
              }} />
              <Input placeholder="Major" value={e.major ?? ""} onChange={(ev) => {
                const arr = [...education]; arr[idx] = { ...arr[idx], major: ev.target.value }; setEducation(arr);
              }} />
              <Input placeholder="Start" type="number" value={e.start_year ?? ""} onChange={(ev) => {
                const arr = [...education]; arr[idx] = { ...arr[idx], start_year: ev.target.value ? Number(ev.target.value) : null }; setEducation(arr);
              }} />
              <Input placeholder="End" type="number" value={e.end_year ?? ""} onChange={(ev) => {
                const arr = [...education]; arr[idx] = { ...arr[idx], end_year: ev.target.value ? Number(ev.target.value) : null }; setEducation(arr);
              }} />
            </div>
          ))}
          <Button type="button" variant="outline" onClick={() => setEducation([...education, { id: crypto.randomUUID(), degree: "", major: "", start_year: null, end_year: null }])}>Add education</Button>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">Work</h2>
        <div className="space-y-3">
          {work.map((w, idx) => (
            <div key={idx} className="grid gap-3 md:grid-cols-5">
              <Input placeholder="Company" value={w.company ?? ""} onChange={(ev) => { const arr = [...work]; arr[idx] = { ...arr[idx], company: ev.target.value }; setWork(arr); }} />
              <Input placeholder="Role" value={w.role ?? ""} onChange={(ev) => { const arr = [...work]; arr[idx] = { ...arr[idx], role: ev.target.value }; setWork(arr); }} />
              <Input placeholder="Start Date" value={w.start_date ?? ""} onChange={(ev) => { const arr = [...work]; arr[idx] = { ...arr[idx], start_date: ev.target.value }; setWork(arr); }} />
              <Input placeholder="End Date" value={w.end_date ?? ""} onChange={(ev) => { const arr = [...work]; arr[idx] = { ...arr[idx], end_date: ev.target.value }; setWork(arr); }} />
              <Input placeholder="Description" value={w.description ?? ""} onChange={(ev) => { const arr = [...work]; arr[idx] = { ...arr[idx], description: ev.target.value }; setWork(arr); }} />
            </div>
          ))}
          <Button type="button" variant="outline" onClick={() => setWork([...work, { id: crypto.randomUUID(), company: "", role: "", start_date: "", end_date: "", description: "" }])}>Add role</Button>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">Skills</h2>
        <div className="space-y-3">
          {skills.map((s, idx) => (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-6 gap-3">
              <Input className="md:col-span-5" placeholder="Skill" value={s.name ?? ""} onChange={(ev) => { const arr = [...skills]; arr[idx] = { ...arr[idx], name: ev.target.value }; setSkills(arr); }} />
              <Button type="button" variant="outline" onClick={() => setSkills(skills.filter((_, i) => i !== idx))}>Remove</Button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={() => setSkills([...skills, { id: crypto.randomUUID(), name: "" }])}>Add skill</Button>
        </div>
      </section>

      {error && <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-800">{error}</div>}
      {success && (
        <div className="rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-800">
          Profile saved successfully!{" "}
          <Link href="/alumni" className="underline font-semibold hover:text-green-900">
            View Alumni Directory →
          </Link>
        </div>
      )}
      <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
    </motion.form>
  );
}
