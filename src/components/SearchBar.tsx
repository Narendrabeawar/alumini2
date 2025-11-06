"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { Input } from "@/components/ui/input";

export default function SearchBar() {
  const router = useRouter();
  const params = useSearchParams();

  const onChange = useDebouncedCallback((value: string) => {
    const p = new URLSearchParams(params.toString());
    if (value) p.set("q", value); else p.delete("q");
    p.set("page", "1");
    router.replace(`/alumni?${p.toString()}`);
  }, 300);

  return (
    <Input
      defaultValue={params.get("q") ?? ""}
      placeholder="Search by name, company, department..."
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
