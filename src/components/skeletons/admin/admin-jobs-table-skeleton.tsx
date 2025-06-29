import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function AdminJobsTableSkeleton() {
  return (
    <Card className="flex-1 flex flex-col min-h-0">
      <CardHeader className="flex-shrink-0 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-6 w-32" />
          </CardTitle>
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-64" /> {/* Search */}
            <Skeleton className="h-10 w-32" /> {/* Status Filter */}
            <Skeleton className="h-10 w-32" /> {/* Type Filter */}
            <Skeleton className="h-10 w-[142px]" /> {/* Add New Job Button */}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0 min-h-0 ml-3 mr-3">
        <div className="flex-1 overflow-auto border rounded-md mb-6">
          <Table className="w-full min-w-full table-fixed">
            <TableHeader className="sticky top-0 bg-white z-20 border-b shadow-sm">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-52"><Skeleton className="h-4 w-24" /></TableHead>
                <TableHead className="w-40"><Skeleton className="h-4 w-20" /></TableHead>
                <TableHead className="w-28"><Skeleton className="h-4 w-20" /></TableHead>
                <TableHead className="w-20"><Skeleton className="h-4 w-16" /></TableHead>
                <TableHead className="w-20"><Skeleton className="h-4 w-16" /></TableHead>
                <TableHead className="w-36"><Skeleton className="h-4 w-24" /></TableHead>
                <TableHead className="text-right w-28"><Skeleton className="h-4 w-20 ml-auto" /></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 10 }).map((_, i) => (
                <TableRow key={i} className="border-b">
                  <TableCell className="py-4">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-3 w-32 mt-2" />
                  </TableCell>
                  <TableCell className="py-4"><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell className="py-4"><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell className="py-4"><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                  <TableCell className="py-4"><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                  <TableCell className="py-4"><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center justify-end gap-1">
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex-shrink-0 px-6 pb-6">
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
  );
} 