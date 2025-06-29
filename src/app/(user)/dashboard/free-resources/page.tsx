"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { ExternalLink, Search, Loader2, Calendar, BookOpen } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { FreeResource, RawFreeResourceData } from "@/types/job";
import { Badge } from "@/components/ui/badge";
import { FreeResourcesSkeleton } from '@/components/skeletons/user/free-resources-skeleton';

const ITEMS_PER_PAGE = 9;

export default function FreeResourcesPage() {
  const [resources, setResources] = useState<FreeResource[]>([]);
  const [selectedResource, setSelectedResource] = useState<FreeResource | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [resourceTypes, setResourceTypes] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const loadResourceTypes = useCallback(async () => {
    try {
      const { data: typesData, error } = await supabase
        .from('free_resources')
        .select('resource_type')
        .not('resource_type', 'is', null);

      if (error) {
        return;
      }

      if (typesData) {
        // Get unique resource types and sort them
        const uniqueTypes = [...new Set(typesData.map(item => item.resource_type))].sort();
        setResourceTypes(uniqueTypes);
      }
    } catch (error) {
        console.error('Error loading resource types:', error);
    }
  }, []);

  const loadResources = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('free_resources')
        .select(`
          resource_id,
          title,
          description,
          resource_url,
          resource_type,
          created_at,
          created_by
        `, { count: 'exact' });

      // Apply filters
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }
      
      if (typeFilter !== "all") {
        query = query.eq('resource_type', typeFilter);
      }

      const { data: resourcesData, error, count } = await query
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

      if (error) {
        toast.error('Failed to load free resources');
        setResources([]);
        setTotalCount(0);
      } else if (resourcesData) {
        const transformedResources: FreeResource[] = resourcesData.map((resource: RawFreeResourceData) => ({
          resource_id: resource.resource_id,
          title: resource.title,
          description: resource.description,
          resource_url: resource.resource_url,
          resource_type: resource.resource_type,
          created_at: resource.created_at,
          created_by: resource.created_by,
        }));
        
        setResources(transformedResources);
        setTotalCount(count || 0);
      }
    } catch {
      toast.error('Failed to load free resources');
      setResources([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, typeFilter, currentPage]);

  useEffect(() => {
    loadResourceTypes();
  }, [loadResourceTypes]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, typeFilter]);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  const getTypeBadge = (type: string) => {
    const normalizedType = type?.toLowerCase();
    
    switch (normalizedType) {
      case "course":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Course</Badge>;
      case "ebook":
      case "e-book":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">E-Book</Badge>;
      case "video":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Video</Badge>;
      case "article":
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Article</Badge>;
      case "tool":
        return <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100">Tool</Badge>;
      case "template":
        return <Badge className="bg-pink-100 text-pink-800 hover:bg-pink-100">Template</Badge>;
      case "guide":
        return <Badge className="bg-teal-100 text-teal-800 hover:bg-teal-100">Guide</Badge>;
      case "tutorial":
        return <Badge className="bg-cyan-100 text-cyan-800 hover:bg-cyan-100">Tutorial</Badge>;
      case "workshop":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Workshop</Badge>;
      case "webinar":
        return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Webinar</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">{type?.charAt(0)?.toUpperCase() + type?.slice(1) || 'Unknown'}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleViewDetails = (resource: FreeResource) => {
    setSelectedResource(resource);
    setIsDetailOpen(true);
  };

  const handleOpenResource = (url: string) => {
    window.open(url, '_blank');
  };

  // Add this function to get a color class based on resource type
  const getCardColorClass = (type: string) => {
    const normalizedType = type?.toLowerCase();
    switch (normalizedType) {
      case "course":
        return "bg-gradient-to-br from-blue-100 to-blue-50 border-blue-200";
      case "ebook":
      case "e-book":
        return "bg-gradient-to-br from-green-100 to-green-50 border-green-200";
      case "video":
        return "bg-gradient-to-br from-purple-100 to-purple-50 border-purple-200";
      case "article":
        return "bg-gradient-to-br from-orange-100 to-orange-50 border-orange-200";
      case "tool":
        return "bg-gradient-to-br from-indigo-100 to-indigo-50 border-indigo-200";
      case "template":
        return "bg-gradient-to-br from-pink-100 to-pink-50 border-pink-200";
      case "guide":
        return "bg-gradient-to-br from-teal-100 to-teal-50 border-teal-200";
      case "tutorial":
        return "bg-gradient-to-br from-cyan-100 to-cyan-50 border-cyan-200";
      case "workshop":
        return "bg-gradient-to-br from-amber-100 to-amber-50 border-amber-200";
      case "webinar":
        return "bg-gradient-to-br from-emerald-100 to-emerald-50 border-emerald-200";
      default:
        return "bg-gradient-to-br from-gray-100 to-gray-50 border-gray-200";
    }
  };

  if (loading) {
    return <FreeResourcesSkeleton />;
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Free Resources</h1>
          <p className="text-gray-600">Discover valuable resources to boost your career</p>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {resourceTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Resources Grid */}
        <main>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading resources...</span>
            </div>
          ) : resources.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
              <p className="text-gray-500">No free resources available at the moment. Check back later!</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resources.map((resource) => (
                  <Card
                    key={resource.resource_id}
                    className={`hover:shadow-2xl hover:scale-[1.03] transition-transform duration-200 cursor-pointer flex flex-col h-full rounded-2xl border-2 shadow-lg ${getCardColorClass(resource.resource_type)}`}
                    onClick={() => handleViewDetails(resource)}
                  >
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                      <div className="font-semibold text-lg text-gray-900 truncate pr-2">{resource.title}</div>
                      {getTypeBadge(resource.resource_type)}
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-between">
                      <div className="text-gray-700 text-sm mb-4 line-clamp-3 min-h-[60px]">{resource.description.substring(0, 120)}...</div>
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(resource.created_at)}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="ml-auto"
                          onClick={e => { e.stopPropagation(); handleOpenResource(resource.resource_url); }}
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Open
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-500">
                    Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of {totalCount} resources
                  </div>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = i + 1;
                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              onClick={() => setCurrentPage(pageNum)}
                              isActive={currentPage === pageNum}
                              className="cursor-pointer"
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Resource Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedResource?.title}</DialogTitle>
          </DialogHeader>
          {selectedResource && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">Resource Type</span>
                  </div>
                  <div>{getTypeBadge(selectedResource.resource_type)}</div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(selectedResource)}
                    className="flex-1"
                  >
                    View Details
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenResource(selectedResource.resource_url)}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}