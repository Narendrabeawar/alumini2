import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { requireUser, getApprovalStatus } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Newspaper, Calendar, User, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import Image from "next/image";

async function getNews() {
  const supabase = await createClient();
  
  const { data: news, error } = await supabase
    .from("news")
    .select(`
      *,
      author:profiles!news_author_id_fkey(id, full_name)
    `)
    .eq("is_published", true)
    .not("published_at", "is", null)
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Error fetching news:", error);
    return [];
  }

  return news || [];
}

async function getCategories() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("news")
    .select("category")
    .eq("is_published", true)
    .not("category", "is", null);

  if (error) {
    return [];
  }

  const categories = [...new Set((data || []).map((item: any) => item.category).filter(Boolean))];
  return categories;
}

export default async function NewsPage({
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

  const allNews = await getNews();
  const categories = await getCategories();

  const news = category
    ? allNews.filter((item: any) => item.category === category)
    : allNews;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-green-600 bg-clip-text text-transparent mb-2">
          News & Updates
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Stay updated with the latest news and announcements from the alumni community
        </p>
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          <a
            href="/news"
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
              href={`/news?category=${encodeURIComponent(cat)}`}
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

      {news.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((item: any) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {item.featured_image_url && (
                <div className="relative h-48 w-full">
                  <Image
                    src={item.featured_image_url}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  {item.category && (
                    <Badge variant="secondary">{item.category}</Badge>
                  )}
                  {item.published_at && (
                    <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                      <Calendar className="w-3 h-3" />
                      <span>{format(new Date(item.published_at), "MMM d, yyyy")}</span>
                    </div>
                  )}
                </div>

                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2 line-clamp-2">
                  {item.title}
                </h3>

                {item.excerpt && (
                  <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-4 line-clamp-3">
                    {item.excerpt}
                  </p>
                )}

                {item.author && (
                  <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                    <User className="w-4 h-4" />
                    <span>{item.author.full_name || "Admin"}</span>
                  </div>
                )}

                <Button asChild variant="outline" className="w-full">
                  <Link href={`/news/${item.slug || item.id}`}>
                    Read More
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-zinc-200">
          <CardContent className="p-12 text-center">
            <Newspaper className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              No news available
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400">
              {category ? "No news in this category" : "Check back later for updates"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

