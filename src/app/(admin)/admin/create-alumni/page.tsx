"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { showToast } from "@/lib/toast";

export default function CreateAlumniPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    fatherName: "",
    headline: "",
    bio: "",
    gradYear: "",
    department: "",
    currentCompany: "",
    currentTitle: "",
    location: "",
    primaryMobile: "",
    whatsappNumber: "",
    linkedinUrl: "",
    twitterUrl: "",
    facebookUrl: "",
    instagramUrl: "",
    githubUrl: "",
    websiteUrl: "",
  });

  const [education, setEducation] = useState<Array<{ degree: string; institution: string; year: string }>>([]);
  const [workHistory, setWorkHistory] = useState<Array<{ company: string; role: string; startYear: string; endYear: string }>>([]);
  const [skills, setSkills] = useState<string[]>([]);

  const addEducation = () => {
    setEducation([...education, { degree: "", institution: "", year: "" }]);
  };

  const removeEducation = (index: number) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  const updateEducation = (index: number, field: string, value: string) => {
    const updated = [...education];
    updated[index] = { ...updated[index], [field]: value };
    setEducation(updated);
  };

  const addWorkHistory = () => {
    setWorkHistory([...workHistory, { company: "", role: "", startYear: "", endYear: "" }]);
  };

  const removeWorkHistory = (index: number) => {
    setWorkHistory(workHistory.filter((_, i) => i !== index));
  };

  const updateWorkHistory = (index: number, field: string, value: string) => {
    const updated = [...workHistory];
    updated[index] = { ...updated[index], [field]: value };
    setWorkHistory(updated);
  };

  const addSkill = () => {
    setSkills([...skills, ""]);
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const updateSkill = (index: number, value: string) => {
    const updated = [...skills];
    updated[index] = value;
    setSkills(updated);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/create-alumni", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          fullName: formData.fullName,
          fatherName: formData.fatherName,
          headline: formData.headline,
          bio: formData.bio,
          gradYear: formData.gradYear,
          department: formData.department,
          currentCompany: formData.currentCompany,
          currentTitle: formData.currentTitle,
          location: formData.location,
          primaryMobile: formData.primaryMobile,
          whatsappNumber: formData.whatsappNumber,
          linkedinUrl: formData.linkedinUrl,
          twitterUrl: formData.twitterUrl,
          facebookUrl: formData.facebookUrl,
          instagramUrl: formData.instagramUrl,
          githubUrl: formData.githubUrl,
          websiteUrl: formData.websiteUrl,
          education,
          workHistory,
          skills,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create alumni");
      }

      showToast.success("Alumni created successfully!");
      setSuccess(true);
      setTimeout(() => {
        router.push("/admin/invites");
      }, 2000);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to create alumni";
      setError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 rounded-lg p-8 text-center"
        >
          <h2 className="text-2xl font-semibold mb-2 text-green-800">Alumni Added Successfully!</h2>
          <p className="text-green-700 mb-4">
            The alumni has been added to the imported list. You can now send an invitation from the Invites page.
          </p>
          <p className="text-sm text-green-600">Redirecting to Invites page...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-700 to-green-600 bg-clip-text text-transparent">
          Create New Alumni
        </h1>
        <p className="text-zinc-600 mb-2">Add a new alumni member manually with complete profile details</p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
          <strong>Note:</strong> This will add the alumni to the imported list. After creating, go to the Invites page to send an invitation. The alumni can then complete their profile after accepting the invite.
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg border border-zinc-200 p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="alumni@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="John Doe"
              />
            </div>
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

          <div className="space-y-2">
            <Label htmlFor="headline">Headline</Label>
            <Input
              id="headline"
              value={formData.headline}
              onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
              placeholder="Software Engineer at Google"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Brief biography..."
              rows={3}
            />
          </div>
        </div>

        {/* Education & Career */}
        <div className="bg-white rounded-lg border border-zinc-200 p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-4">Education & Career</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Bangalore, India"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentCompany">Current Company</Label>
              <Input
                id="currentCompany"
                value={formData.currentCompany}
                onChange={(e) => setFormData({ ...formData, currentCompany: e.target.value })}
                placeholder="Google"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentTitle">Current Title</Label>
              <Input
                id="currentTitle"
                value={formData.currentTitle}
                onChange={(e) => setFormData({ ...formData, currentTitle: e.target.value })}
                placeholder="Software Engineer"
              />
            </div>
          </div>
        </div>

        {/* Contact Details */}
        <div className="bg-white rounded-lg border border-zinc-200 p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-4">Contact Details</h2>
          
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        {/* Education History */}
        <div className="bg-white rounded-lg border border-zinc-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Education History</h2>
            <Button type="button" onClick={addEducation} size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-1" />
              Add Education
            </Button>
          </div>

          {education.map((edu, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-zinc-200 rounded-lg">
              <Input
                placeholder="Degree"
                value={edu.degree}
                onChange={(e) => updateEducation(index, "degree", e.target.value)}
              />
              <Input
                placeholder="Institution"
                value={edu.institution}
                onChange={(e) => updateEducation(index, "institution", e.target.value)}
              />
              <Input
                placeholder="Year"
                type="number"
                value={edu.year}
                onChange={(e) => updateEducation(index, "year", e.target.value)}
              />
              <Button
                type="button"
                onClick={() => removeEducation(index)}
                variant="ghost"
                size="sm"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Work History */}
        <div className="bg-white rounded-lg border border-zinc-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Work History</h2>
            <Button type="button" onClick={addWorkHistory} size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-1" />
              Add Work Experience
            </Button>
          </div>

          {workHistory.map((work, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border border-zinc-200 rounded-lg">
              <Input
                placeholder="Company"
                value={work.company}
                onChange={(e) => updateWorkHistory(index, "company", e.target.value)}
              />
              <Input
                placeholder="Role"
                value={work.role}
                onChange={(e) => updateWorkHistory(index, "role", e.target.value)}
              />
              <Input
                placeholder="Start Year"
                type="number"
                value={work.startYear}
                onChange={(e) => updateWorkHistory(index, "startYear", e.target.value)}
              />
              <Input
                placeholder="End Year"
                type="number"
                value={work.endYear}
                onChange={(e) => updateWorkHistory(index, "endYear", e.target.value)}
              />
              <Button
                type="button"
                onClick={() => removeWorkHistory(index)}
                variant="ghost"
                size="sm"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Skills */}
        <div className="bg-white rounded-lg border border-zinc-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Skills</h2>
            <Button type="button" onClick={addSkill} size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-1" />
              Add Skill
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {skills.map((skill, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="Skill name"
                  value={skill}
                  onChange={(e) => updateSkill(index, e.target.value)}
                />
                <Button
                  type="button"
                  onClick={() => removeSkill(index)}
                  variant="ghost"
                  size="sm"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
            {error}
          </div>
        )}

        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600"
          >
            {loading ? "Creating..." : "Create Alumni"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

