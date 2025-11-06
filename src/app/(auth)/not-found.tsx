import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16 text-center">
      <h1 className="text-2xl font-bold">Authentication page not found</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">The auth page you requested was not found.</p>
      <div className="mt-6 space-x-4">
        <Link href="/login" className="underline">Login</Link>
        <Link href="/register" className="underline">Register</Link>
      </div>
    </div>
  );
}


