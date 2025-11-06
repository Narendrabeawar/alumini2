import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16 text-center">
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">The page you are looking for doesn’t exist or was moved.</p>
      <div className="mt-6">
        <Link href="/" className="underline">Go back home</Link>
      </div>
    </div>
  );
}


