import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function getSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function requireUser() {
  const user = await getSession();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function getAdminStatus(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", userId)
    .single();
  return data?.is_admin ?? false;
}

export async function requireAdmin() {
  const user = await requireUser();
  const isAdmin = await getAdminStatus(user.id);
  if (!isAdmin) {
    redirect("/");
  }
  return { user, isAdmin };
}

export async function hasProfileSetup(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("staged_alumni_details")
    .select("user_id")
    .eq("user_id", userId)
    .single();
  return !!data;
}

export async function getApprovalStatus(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("admin_flags")
    .select("status")
    .eq("user_id", userId)
    .single();
  return data?.status ?? "pending";
}

export async function signOut() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

