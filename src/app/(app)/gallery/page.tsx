import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { requireUser, getApprovalStatus } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Image as ImageIcon, Calendar } from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";

async function getGalleryItems() {
  const supabase = await createClient();
  
  const { data: items, error } = await supabase
    .from("gallery_items")
    .select(`
      *,
      event:events(id, title)
    `)
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching gallery items:", error);
    return [];
  }

  return items || [];
}

async function getCategories() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("gallery_items")
    .select("category")
    .eq("is_published", true)
    .not("category", "is", null);

  if (error) {
    return [];
  }

  const categories = [...new Set((data || []).map((item: any) => item.category).filter(Boolean))];
  return categories;
}

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser();
  
  const status = await getApprovalStatus(user.id);
  if (status !== "approved") {
    redirect("/profile/pending");
  }

  const params = await searchParams;
  const category = (params.category as string) || null;

  const allItems = await getGalleryItems();
  const categories = await getCategories();

  const items = category
    ? allItems.filter((item: any) => item.category === category)
    : allItems;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-green-600 bg-clip-text text-transparent mb-2">
          Gallery
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Browse photos and memories from alumni events and gatherings
        </p>
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          <a
            href="/gallery"
            className={`px-4 py-2 rounded-lg border transition-colors ${
              !category
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800"
            }`}
          >
            All
          </a>
          {categories.map((cat: string) => (
            <a
              key={cat}
              href={`/gallery?category=${encodeURIComponent(cat)}`}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                category === cat
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800"
              }`}
            >
              {cat}
            </a>
          ))}
        </div>
      )}

      {items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((item: any) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
              <div className="relative aspect-square w-full">
                <Image
                  src={item.image_url}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                {item.category && (
                  <div className="absolute top-2 left-2">
                    <Badge variant="secondary" className="bg-white/90 dark:bg-zinc-900/90">
                      {item.category}
                    </Badge>
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1 line-clamp-1">
                  {item.title}
                </h3>
                {item.description && (
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 mb-2">
                    {item.description}
                  </p>
                )}
                {item.event && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
                    📅 {item.event.title}
                  </p>
                )}
                <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <Calendar className="w-3 h-3" />
                  <span>{format(new Date(item.created_at), "MMM d, yyyy")}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-zinc-200">
          <CardContent className="p-12 text-center">
            <ImageIcon className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              No gallery items available
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400">
              {category ? "No items in this category" : "Gallery is empty"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

