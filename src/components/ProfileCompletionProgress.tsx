"use client";

import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Circle } from "lucide-react";

interface ProfileCompletionProgressProps {
  profile: {
    fullName: boolean;
    avatar: boolean;
    headline: boolean;
    bio: boolean;
    gradYear: boolean;
    department: boolean;
    company: boolean;
    location: boolean;
    education: boolean;
    workHistory: boolean;
    skills: boolean;
    contactDetails: boolean;
  };
}

export function ProfileCompletionProgress({ profile }: ProfileCompletionProgressProps) {
  const fields = [
    { key: "fullName", label: "Full Name" },
    { key: "avatar", label: "Profile Picture" },
    { key: "headline", label: "Headline" },
    { key: "bio", label: "Bio" },
    { key: "gradYear", label: "Graduation Year" },
    { key: "department", label: "Department" },
    { key: "company", label: "Current Company" },
    { key: "location", label: "Location" },
    { key: "education", label: "Education" },
    { key: "workHistory", label: "Work History" },
    { key: "skills", label: "Skills" },
    { key: "contactDetails", label: "Contact Details" },
  ];

  const completedCount = fields.filter((field) => profile[field.key as keyof typeof profile]).length;
  const totalFields = fields.length;
  const percentage = Math.round((completedCount / totalFields) * 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Profile Completion</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-600">{completedCount} of {totalFields} fields completed</span>
            <span className="font-semibold text-blue-600">{percentage}%</span>
          </div>
          <Progress value={percentage} className="h-2" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          {fields.map((field) => {
            const isCompleted = profile[field.key as keyof typeof profile];
            return (
              <div key={field.key} className="flex items-center gap-2">
                {isCompleted ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <Circle className="h-4 w-4 text-zinc-400" />
                )}
                <span className={isCompleted ? "text-zinc-900" : "text-zinc-500"}>
                  {field.label}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

