
import { useState } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Trash2, MoveUp, MoveDown, Plus, Save } from "lucide-react";

interface CarouselImage {
  id: string;
  imageUrl: string;
  alt: string;
  order: number;
}

export default function FrontPage() {
  const queryClient = useQueryClient();
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newImageAlt, setNewImageAlt] = useState("");

  const { data: carouselImages, isLoading } = useQuery({
    queryKey: ['/api/admin/carousel-images'],
    refetchOnWindowFocus: false,
  });

  const images: CarouselImage[] = carouselImages?.images || [];

  const addImageMutation = useMutation({
    mutationFn: async (newImage: { imageUrl: string; alt: string }) => {
      const response = await fetch('/api/admin/carousel-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newImage),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add image');
      }
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/carousel-images'] });
      setNewImageUrl("");
      setNewImageAlt("");
      toast({
        title: "Success",
        description: "Image added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const deleteImageMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/carousel-images/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete image');
      }
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/carousel-images'] });
      toast({
        title: "Success",
        description: "Image deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const reorderImageMutation = useMutation({
    mutationFn: async ({ id, direction }: { id: string; direction: 'up' | 'down' }) => {
      const response = await fetch(`/api/admin/carousel-images/${id}/reorder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ direction }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to reorder image');
      }
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/carousel-images'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleAddImage = () => {
    if (!newImageUrl) {
      toast({
        title: "Error",
        description: "Image URL is required",
        variant: "destructive",
      });
      return;
    }

    addImageMutation.mutate({
      imageUrl: newImageUrl,
      alt: newImageAlt || "Garden showcase",
    });
  };

  const handleDeleteImage = (id: string) => {
    if (confirm("Are you sure you want to delete this image?")) {
      deleteImageMutation.mutate(id);
    }
  };

  const handleReorderImage = (id: string, direction: 'up' | 'down') => {
    reorderImageMutation.mutate({ id, direction });
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Front Page Management</h1>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Home Page Carousel Images</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="col-span-2">
                  <Input
                    placeholder="Image URL"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                  />
                </div>
                <div>
                  <Input
                    placeholder="Alt Text (optional)"
                    value={newImageAlt}
                    onChange={(e) => setNewImageAlt(e.target.value)}
                  />
                </div>
              </div>
              
              <Button 
                onClick={handleAddImage} 
                disabled={addImageMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Image
              </Button>
              
              {isLoading ? (
                <div className="py-8 text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent"></div>
                </div>
              ) : (
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">Preview</TableHead>
                        <TableHead>Image URL</TableHead>
                        <TableHead>Alt Text</TableHead>
                        <TableHead className="w-[100px]">Order</TableHead>
                        <TableHead className="text-right w-[150px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {images.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-4">
                            No images added yet. Add your first image above.
                          </TableCell>
                        </TableRow>
                      ) : (
                        images.map((image, index) => (
                          <TableRow key={image.id}>
                            <TableCell>
                              <div className="h-16 w-16 rounded overflow-hidden bg-gray-100">
                                <img
                                  src={image.imageUrl}
                                  alt={image.alt}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate">
                              {image.imageUrl}
                            </TableCell>
                            <TableCell>{image.alt}</TableCell>
                            <TableCell>{image.order}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-1">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleReorderImage(image.id, 'up')}
                                  disabled={index === 0}
                                >
                                  <MoveUp className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleReorderImage(image.id, 'down')}
                                  disabled={index === images.length - 1}
                                >
                                  <MoveDown className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  onClick={() => handleDeleteImage(image.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
