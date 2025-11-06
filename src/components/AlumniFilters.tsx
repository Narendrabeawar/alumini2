"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AlumniFiltersProps {
  stats: {
    uniqueYears: number[];
    uniqueDepartments: string[];
  };
  currentFilters: {
    year?: string | null;
    dept?: string | null;
    company?: string | null;
  };
}

export default function AlumniFilters({ stats, currentFilters }: AlumniFiltersProps) {
  const router = useRouter();
  const params = useSearchParams();

  const updateFilter = (key: string, value: string | null) => {
    const p = new URLSearchParams(params.toString());
    if (value) {
      p.set(key, value);
    } else {
      p.delete(key);
    }
    p.set("page", "1");
    router.replace(`/alumni?${p.toString()}`);
  };

  return (
    <div className="flex gap-2">
      <Select
        value={currentFilters.year || ""}
        onValueChange={(value) => updateFilter("year", value || null)}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Graduation Year" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Years</SelectItem>
          {stats.uniqueYears.map((year) => (
            <SelectItem key={year} value={String(year)}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={currentFilters.dept || ""}
        onValueChange={(value) => updateFilter("dept", value || null)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Department" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Departments</SelectItem>
          {stats.uniqueDepartments.map((dept) => (
            <SelectItem key={dept} value={dept}>
              {dept}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

