import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16 text-center">
      <h1 className="text-2xl font-bold">Admin page not found</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">This admin route doesn’t exist or you may not have access.</p>
      <div className="mt-6">
        <Link href="/admin" className="underline">Go to Admin Dashboard</Link>
      </div>
    </div>
  );
}


