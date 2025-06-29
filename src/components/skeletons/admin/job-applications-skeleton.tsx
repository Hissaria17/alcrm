import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function JobApplicationsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10" />
        <div>
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-48 mt-2" />
        </div>
      </div>

      {/* Table Card Skeleton */}
      <Card className="shadow-sm">
        <CardHeader className="border-b bg-gray-50/50">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-6 w-24" />
            </CardTitle>
            <div className="relative">
              <Skeleton className="h-10 w-[300px]" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                  <TableHead className="pl-6"><Skeleton className="h-4 w-40" /></TableHead>
                  <TableHead><Skeleton className="h-4 w-32" /></TableHead>
                  <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                  <TableHead className="text-center"><Skeleton className="h-4 w-24 mx-auto" /></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 10 }).map((_, i) => (
                  <TableRow key={i} className="hover:bg-gray-50/50">
                    <TableCell className="pl-6">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div>
                                <Skeleton className="h-4 w-28" />
                                <Skeleton className="h-3 w-36 mt-2" />
                            </div>
                        </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-32 rounded-full" /></TableCell>
                    <TableCell className="text-center">
                      <Skeleton className="h-8 w-20 mx-auto rounded-md" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="p-4 border-t">
              <div className="flex justify-center">
                  <div className="flex items-center gap-2">
                      <Skeleton className="h-9 w-20" />
                      <Skeleton className="h-9 w-9" />
                      <Skeleton className="h-9 w-9" />
                      <Skeleton className="h-9 w-9" />
                      <Skeleton className="h-9 w-9" />
                      <Skeleton className="h-9 w-9" />
                      <Skeleton className="h-9 w-20" />
                  </div>
              </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
