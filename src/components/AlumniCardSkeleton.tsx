import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function AlumniCardSkeleton() {
  return (
    <Card className="p-6">
      <div className="flex items-start gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
    </Card>
  );
}

