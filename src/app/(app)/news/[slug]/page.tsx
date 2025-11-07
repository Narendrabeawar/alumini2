import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { requireUser, getApprovalStatus } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import Image from "next/image";

async function getNewsItem(slug: string) {
  const supabase = await createClient();
  
  const { data: news, error } = await supabase
    .from("news")
    .select(`
      *,
      author:profiles!news_author_id_fkey(id, full_name, avatar_url)
    `)
    .or(`id.eq.${slug},slug.eq.${slug}`)
    .eq("is_published", true)
    .single();

  if (error || !news) {
    return null;
  }

  return news;
}

export default async function NewsDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const user = await requireUser();
  
  const status = await getApprovalStatus(user.id);
  if (status !== "approved") {
    redirect("/profile/pending");
  }

  const news = await getNewsItem(params.slug);

  if (!news) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            Article Not Found
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">
            The article you're looking for doesn't exist or is not published.
          </p>
          <Button asChild>
            <Link href="/news">Back to News</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/news">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to News
          </Link>
        </Button>
      </div>

      {news.featured_image_url && (
        <div className="relative h-96 w-full rounded-lg overflow-hidden mb-8">
          <Image
            src={news.featured_image_url}
            alt={news.title}
            fill
            className="object-cover"
          />
        </div>
      )}

      <article>
        <div className="flex items-center gap-2 mb-4">
          {news.category && (
            <Badge variant="secondary">{news.category}</Badge>
          )}
          {news.published_at && (
            <div className="flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400">
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(news.published_at), "PPP")}</span>
            </div>
          )}
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
          {news.title}
        </h1>

        {news.excerpt && (
          <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed">
            {news.excerpt}
          </p>
        )}

        {news.author && (
          <div className="flex items-center gap-3 mb-8 pb-8 border-b border-zinc-200 dark:border-zinc-700">
            {news.author.avatar_url ? (
              <Image
                src={news.author.avatar_url}
                alt={news.author.full_name || "Author"}
                width={48}
                height={48}
                className="rounded-full"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center text-white font-bold">
                {(news.author.full_name || "A")[0].toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                {news.author.full_name || "Admin"}
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Author</p>
            </div>
          </div>
        )}

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <div className="whitespace-pre-line text-zinc-700 dark:text-zinc-300 leading-relaxed">
            {news.content}
          </div>
        </div>

        {news.tags && news.tags.length > 0 && (
          <div className="mt-8 pt-8 border-t border-zinc-200 dark:border-zinc-700">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">Tags:</h3>
            <div className="flex flex-wrap gap-2">
              {news.tags.map((tag: string) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
}

