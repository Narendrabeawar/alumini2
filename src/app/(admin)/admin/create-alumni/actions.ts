"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createAlumni(formData: FormData) {
  const supabase = await createClient();

  // Get form data
  const email = formData.get("email") as string;
  const fullName = formData.get("fullName") as string;
  const headline = formData.get("headline") as string;
  const bio = formData.get("bio") as string;
  const gradYear = formData.get("gradYear") as string;
  const department = formData.get("department") as string;
  const currentCompany = formData.get("currentCompany") as string;
  const currentTitle = formData.get("currentTitle") as string;
  const location = formData.get("location") as string;

  // Check if admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    return { error: "Unauthorized" };
  }

  try {
    // Create auth user (this requires service role, so we'll use a different approach)
    // Instead, we'll create a user account that can be activated later
    // Or use Supabase Admin API if available
    
    // For now, let's create a placeholder user that can be activated
    // Note: This requires Supabase Admin API access
    
    // Alternative: Create user via signup with a temporary password
    // Then immediately approve them
    
    // Actually, better approach: Use Supabase Admin functions
    // But since we don't have direct access, we'll need to:
    // 1. Create user via API route with service role
    // 2. Or use a different approach
    
    return { error: "User creation requires admin API. Please use invite system or create user manually in Supabase." };
  } catch (error: any) {
    return { error: error.message || "Failed to create alumni" };
  }
}

