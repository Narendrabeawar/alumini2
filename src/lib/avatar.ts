/**
 * Utility functions for handling avatar URLs
 */

/**
 * Get public URL for an avatar from storage path
 * If the path is already a full URL, return it as-is
 * Otherwise, convert storage path to public URL
 */
export async function getAvatarPublicUrl(
  supabase: any,
  avatarPath: string | null | undefined
): Promise<string | null> {
  if (!avatarPath) return null;
  
  // If already a full URL, return as-is
  if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
    return avatarPath;
  }
  
  // Get public URL from Supabase storage
  try {
    const { data } = await supabase.storage.from('avatars').getPublicUrl(avatarPath);
    return data?.publicUrl || null;
  } catch (error) {
    console.error('Error getting avatar public URL:', error);
    return null;
  }
}

/**
 * Get public URL synchronously (for client-side use where supabase is available)
 */
export function getAvatarPublicUrlSync(
  supabase: any,
  avatarPath: string | null | undefined
): string | null {
  if (!avatarPath) return null;
  
  // If already a full URL, return as-is
  if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
    return avatarPath;
  }
  
  // Get public URL from Supabase storage
  try {
    const { data } = supabase.storage.from('avatars').getPublicUrl(avatarPath);
    return data?.publicUrl || null;
  } catch (error) {
    console.error('Error getting avatar public URL:', error);
    return null;
  }
}

