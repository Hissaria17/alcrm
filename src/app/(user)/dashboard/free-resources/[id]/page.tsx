'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, FileText, Calendar,  ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { FreeResource } from '@/types/job';

export default function PDFViewerPage() {
  const params = useParams();
  const router = useRouter();
  const [resource, setResource] = useState<FreeResource | null>(null);
  const [loading, setLoading] = useState(true);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  const resourceId = params.id as string;

  useEffect(() => {
    loadResource();
  }, [resourceId]);

  const loadResource = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('free_resources')
        .select(`
          resource_id,
          title,
          description,
          resource_url,
          resource_type,
          created_at,
          created_by,
          updated_at,
          is_deleted,
          resource_link
        `)
        .eq('resource_id', resourceId)
        .eq('is_deleted', false)
        .single();

      if (error) {
        toast.error('Resource not found');
        router.push('/dashboard/free-resources');
        return;
      }

      if (data) {
        setResource(data);
      }
    } catch (error) {
      toast.error('Failed to load resource');
      router.push('/dashboard/free-resources');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [resourceId, router]);

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleReset = () => {
    setScale(1);
    setRotation(0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getTypeBadge = (type: string) => {
    const normalizedType = type?.toLowerCase();
    
    switch (normalizedType) {
      case "pdf":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">PDF</Badge>;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading PDF...</p>
        </div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Resource Not Found</h2>
          <p className="text-gray-600 mb-4">The resource you are looking for does not exist or has been removed.</p>
          <Button onClick={() => router.push('/dashboard/free-resources')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Resources
          </Button>
        </div>
      </div>
    );
  }

  // Use resource_link if available, otherwise fall back to resource_url
  const pdfUrl = resource.resource_link || resource.resource_url;
  const pdfViewerUrl = `${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0&download=0&print=0`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/dashboard/free-resources')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Resources
              </Button>
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-red-500" />
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">{resource.title}</h1>
                  <p className="text-sm text-gray-500">PDF Viewer</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                disabled={scale <= 0.5}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                disabled={scale >= 3}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRotate}
              >
                <RotateCw className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
              >
                Reset
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* PDF Viewer */}
          <div className="lg:col-span-3">
            <Card className="h-[calc(100vh-200px)]">
              <CardContent className="p-0 h-full">
                <iframe
                  src={pdfViewerUrl}
                  className="w-full h-full border-0 rounded-lg"
                  style={{
                    transform: `scale(${scale}) rotate(${rotation}deg)`,
                    transformOrigin: 'center center',
                    transition: 'transform 0.2s ease-in-out'
                  }}
                  title={resource.title}
                  onContextMenu={(e) => e.preventDefault()}
                  onDragStart={(e) => e.preventDefault()}
                />
              </CardContent>
            </Card>
          </div>

          {/* Resource Info Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Resource Information</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Title</h4>
                  <p className="text-gray-600">{resource.title}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-600 text-sm">{resource.description || 'No description available'}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Type</h4>
                  <div>{getTypeBadge(resource.resource_type)}</div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Created</h4>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    {formatDate(resource.created_at)}
                  </div>
                </div>

                {resource.updated_at && resource.updated_at !== resource.created_at && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Last Updated</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      {formatDate(resource.updated_at)}
                    </div>
                  </div>
                )}

              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 