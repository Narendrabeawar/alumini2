"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import AvatarUploader from "@/components/AvatarUploader";

interface ProfileSetupFormProps {
  userId: string;
}

export default function ProfileSetupForm({ userId }: ProfileSetupFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  const [formData, setFormData] = useState({
    fullName: "",
    fatherName: "",
    avatarUrl: "",
    headline: "",
    bio: "",
    gradYear: "",
    department: "",
    currentCompany: "",
    currentRole: "",
    location: "",
    enrollmentNumber: "",
    rollNumber: "",
    registrationNumber: "",
    certificateNumber: "",
    primaryMobile: "",
    whatsappNumber: "",
    linkedinUrl: "",
    twitterUrl: "",
    facebookUrl: "",
    instagramUrl: "",
    githubUrl: "",
    websiteUrl: "",
  });
  const [nameError, setNameError] = useState<string | null>(null);

  // Load data from imported_alumni if user has claimed an invite
  useEffect(() => {
    async function loadImportedData() {
      try {
        // Check if user has a redeemed invite
        const { data: invite } = await supabase
          .from("invites")
          .select("imported_alumni_id")
          .eq("redeemed_by", userId)
          .eq("status", "redeemed")
          .maybeSingle();

        if (invite?.imported_alumni_id) {
          // Fetch imported alumni data
          const { data: imported } = await supabase
            .from("imported_alumni")
            .select("*")
            .eq("id", invite.imported_alumni_id)
            .maybeSingle();

          if (imported) {
            // Prefill form with imported data
            setFormData({
              fullName: imported.full_name || "",
              fatherName: imported.father_name || "",
              avatarUrl: imported.avatar_url || "",
              headline: imported.headline || "",
              bio: imported.bio || "",
              gradYear: imported.grad_year?.toString() || "",
              department: imported.department || "",
              currentCompany: imported.company || "",
              currentRole: imported.role || "",
              location: imported.location || "",
              enrollmentNumber: "",
              rollNumber: "",
              registrationNumber: "",
              certificateNumber: "",
              primaryMobile: imported.primary_mobile || "",
              whatsappNumber: imported.whatsapp_number || "",
              linkedinUrl: imported.linkedin_url || "",
              twitterUrl: imported.twitter_url || "",
              facebookUrl: imported.facebook_url || "",
              instagramUrl: imported.instagram_url || "",
              githubUrl: imported.github_url || "",
              websiteUrl: imported.website_url || "",
            });

            // Also update profile name and avatar if available
            const profileUpdate: any = {};
            if (imported.full_name) {
              profileUpdate.full_name = imported.full_name;
            }
            if (imported.avatar_url) {
              profileUpdate.avatar_url = imported.avatar_url;
            }
            if (Object.keys(profileUpdate).length > 0) {
              await supabase
                .from("profiles")
                .update(profileUpdate)
                .eq("id", userId);
            }
          }
        }
      } catch (error) {
        console.error("Error loading imported data:", error);
      } finally {
        setLoadingData(false);
      }
    }

    loadImportedData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-zinc-600">Loading your profile data...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate full name - mandatory check
      const trimmedName = formData.fullName?.trim() || "";
      if (!trimmedName || trimmedName.length < 2) {
        setNameError("Full Name is required and must be at least 2 characters");
        setError("Full Name is required and must be at least 2 characters");
        setLoading(false);
        return;
      }
      setNameError(null);

      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({ 
          id: userId,
          full_name: formData.fullName.trim(), 
          avatar_url: formData.avatarUrl || null 
        });

      if (profileError) {
        console.error("Profile error:", profileError);
        throw profileError;
      }

      const { error: detailsError } = await supabase
        .from("staged_alumni_details")
        .upsert({
          user_id: userId,
          headline: formData.headline || null,
          bio: formData.bio || null,
          grad_year: formData.gradYear ? parseInt(formData.gradYear) : null,
          department: formData.department || null,
          current_company: formData.currentCompany || null,
          current_title: formData.currentRole || null,
          location: formData.location || null,
          enrollment_number: formData.enrollmentNumber || null,
          roll_number: formData.rollNumber || null,
          registration_number: formData.registrationNumber || null,
          certificate_number: formData.certificateNumber || null,
          father_name: formData.fatherName || null,
          primary_mobile: formData.primaryMobile || null,
          whatsapp_number: formData.whatsappNumber || null,
          linkedin_url: formData.linkedinUrl || null,
          twitter_url: formData.twitterUrl || null,
          facebook_url: formData.facebookUrl || null,
          instagram_url: formData.instagramUrl || null,
          github_url: formData.githubUrl || null,
          website_url: formData.websiteUrl || null,
        });

      if (detailsError) throw detailsError;

      // Ensure admin_flags status is set to pending
      // Use RPC function to allow status update (bypasses RLS)
      // This handles both new users and resubmission from rejected status
      const { error: flagsError } = await supabase.rpc("resubmit_profile");

      if (flagsError) {
        console.error("Error updating admin_flags via RPC:", flagsError);
        // Don't throw, just log - the form data is saved
        // The handle_new_user trigger should have created admin_flags entry
      }

      // Redirect to pending page - status will be "pending" now
      // Use window.location for full page refresh to ensure status update is reflected
      window.location.href = "/profile/pending";
    } catch (err: any) {
      setError(err.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-6"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name *</Label>
        <Input
          id="fullName"
          value={formData.fullName}
          onChange={(e) => {
            setFormData({ ...formData, fullName: e.target.value });
            setNameError(null);
          }}
          required
          placeholder="John Doe"
          className={nameError ? "border-red-500" : ""}
        />
        {nameError && (
          <p className="text-sm text-red-600">{nameError}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="fatherName">Father's Name</Label>
        <Input
          id="fatherName"
          value={formData.fatherName}
          onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
          placeholder="Father's Full Name"
        />
      </div>

      <AvatarUploader userId={userId} value={formData.avatarUrl || null} onChange={(p) => setFormData({ ...formData, avatarUrl: p })} />

      <div className="space-y-2">
        <Label htmlFor="headline">Headline</Label>
        <Input
          id="headline"
          value={formData.headline}
          onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
          placeholder="Software Engineer at Tech Corp"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          placeholder="Tell us about yourself..."
          rows={4}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="gradYear">Graduation Year</Label>
          <Input
            id="gradYear"
            type="number"
            value={formData.gradYear}
            onChange={(e) => setFormData({ ...formData, gradYear: e.target.value })}
            placeholder="2020"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Input
            id="department"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            placeholder="Computer Science"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="currentCompany">Current Company</Label>
        <Input
          id="currentCompany"
          value={formData.currentCompany}
          onChange={(e) => setFormData({ ...formData, currentCompany: e.target.value })}
          placeholder="Tech Corp"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="currentRole">Current Role</Label>
        <Input
          id="currentRole"
          value={formData.currentRole}
          onChange={(e) => setFormData({ ...formData, currentRole: e.target.value })}
          placeholder="Software Engineer"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          placeholder="New York, NY"
        />
      </div>

      {/* Contact Details */}
      <div className="border-t pt-6 mt-6">
        <h3 className="text-lg font-semibold mb-4">Contact Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="primaryMobile">Primary Mobile Number</Label>
            <Input
              id="primaryMobile"
              type="tel"
              value={formData.primaryMobile}
              onChange={(e) => setFormData({ ...formData, primaryMobile: e.target.value })}
              placeholder="+91 9876543210"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
            <Input
              id="whatsappNumber"
              type="tel"
              value={formData.whatsappNumber}
              onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
              placeholder="+91 9876543210"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
            <Input
              id="linkedinUrl"
              type="url"
              value={formData.linkedinUrl}
              onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
              placeholder="https://linkedin.com/in/yourname"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="twitterUrl">Twitter/X URL</Label>
            <Input
              id="twitterUrl"
              type="url"
              value={formData.twitterUrl}
              onChange={(e) => setFormData({ ...formData, twitterUrl: e.target.value })}
              placeholder="https://twitter.com/yourname"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="facebookUrl">Facebook URL</Label>
            <Input
              id="facebookUrl"
              type="url"
              value={formData.facebookUrl}
              onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
              placeholder="https://facebook.com/yourname"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="instagramUrl">Instagram URL</Label>
            <Input
              id="instagramUrl"
              type="url"
              value={formData.instagramUrl}
              onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
              placeholder="https://instagram.com/yourname"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="githubUrl">GitHub URL</Label>
            <Input
              id="githubUrl"
              type="url"
              value={formData.githubUrl}
              onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
              placeholder="https://github.com/yourname"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="websiteUrl">Website URL</Label>
            <Input
              id="websiteUrl"
              type="url"
              value={formData.websiteUrl}
              onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
              placeholder="https://yourwebsite.com"
            />
          </div>
        </div>
      </div>

      {/* Unique Identification Fields */}
      <div className="border-t pt-6 mt-6">
        <h3 className="text-lg font-semibold mb-4">Unique Identification</h3>
        <p className="text-sm text-zinc-600 mb-4">These fields help us verify your identity. Please provide at least one unique identifier.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="enrollmentNumber">Enrollment Number</Label>
            <Input
              id="enrollmentNumber"
              value={formData.enrollmentNumber}
              onChange={(e) => setFormData({ ...formData, enrollmentNumber: e.target.value })}
              placeholder="EN2020001"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rollNumber">Roll Number</Label>
            <Input
              id="rollNumber"
              value={formData.rollNumber}
              onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
              placeholder="ROLL2020001"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="registrationNumber">Registration Number</Label>
            <Input
              id="registrationNumber"
              value={formData.registrationNumber}
              onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
              placeholder="REG2020001"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="certificateNumber">Certificate Number</Label>
            <Input
              id="certificateNumber"
              value={formData.certificateNumber}
              onChange={(e) => setFormData({ ...formData, certificateNumber: e.target.value })}
              placeholder="CERT2020001"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Saving..." : "Save Profile"}
      </Button>
    </motion.form>
  );
}

