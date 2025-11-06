"use client";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="p-6">
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
        <p className="font-semibold">Admin area error</p>
        <p className="text-sm opacity-80">{error.message}</p>
        <button className="mt-3 inline-flex items-center rounded border px-3 py-1 text-sm" onClick={reset}>
          Try again
        </button>
      </div>
    </div>
  );
}


