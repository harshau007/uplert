import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function MonitorsListSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-4 w-4 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-3 w-[150px] mt-2" />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-3 w-[80px] mt-2" />
                </div>
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
