import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Testimonial } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";

export default function AdminTestimonials() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Testimonial | null>(null);

  // Fetch testimonials
  const { data, isLoading, error } = useQuery<{ testimonials: Testimonial[] }>({
    queryKey: ['/api/admin/testimonials'],
    refetchOnWindowFocus: false,
  });

  const testimonials = data?.testimonials ?? [];

  // Delete testimonial mutation
  const deleteTestimonialMutation = useMutation({
    mutationFn: async (itemId: string | number) => {
      return await apiRequest("DELETE", `/api/admin/testimonials/${itemId}`);
    },
    onSuccess: () => {
      toast({
        title: "Testimonial Deleted",
        description: "The testimonial has been successfully deleted",
      });
      // Invalidate testimonials query to refresh the list
      // Invalidate both admin and public testimonials queries
      queryClient.invalidateQueries({ queryKey: ['/api/admin/testimonials'] });
      queryClient.invalidateQueries({ queryKey: ['/api/testimonials'] });
      setDeleteDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete the testimonial",
        variant: "destructive",
      });
    },
  });

  // Handle delete click
  const handleDeleteClick = (item: Testimonial) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = () => {
    if (itemToDelete) {
      deleteTestimonialMutation.mutate(itemToDelete.id);
    }
  };

  return (
    <AdminLayout 
      title="Testimonials" 
      description="Manage customer testimonials"
      action={
        <Link href="/admin/testimonials/new">
          <Button className="bg-green-600 hover:bg-green-700">
            <i className="fas fa-plus mr-2"></i> Add Testimonial
          </Button>
        </Link>
      }
    >
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <i className="fas fa-spinner fa-spin text-3xl text-gray-400 mb-4"></i>
              <p className="text-gray-500">Loading testimonials...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <i className="fas fa-exclamation-circle text-3xl text-red-500 mb-4"></i>
              <p className="text-gray-500">Error loading testimonials</p>
            </div>
          ) : testimonials.length === 0 ? (
            <div className="p-8 text-center">
              <i className="fas fa-comment-dots text-5xl text-gray-300 mb-4"></i>
              <h3 className="text-lg font-medium text-gray-600 mb-2">No testimonials found</h3>
              <p className="text-gray-500 mb-6">Get started by adding your first customer testimonial</p>
              <Link href="/admin/testimonials/new">
                <Button className="bg-green-600 hover:bg-green-700">
                  <i className="fas fa-plus mr-2"></i> Add Testimonial
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Display Order</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {testimonials.map((item: Testimonial) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {item.content.length > 50 
                                ? `${item.content.substring(0, 50)}...` 
                                : item.content}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <i 
                              key={i}
                              className={`fas fa-star ${i < (item.rating ?? 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                            ></i>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{item.displayOrder || 0}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setLocation(`/admin/testimonials/${item.id}`)}
                          >
                            <i className="fas fa-edit text-blue-600"></i>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteClick(item)}
                          >
                            <i className="fas fa-trash text-red-600"></i>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This will permanently delete the testimonial from "{itemToDelete?.name}". 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteTestimonialMutation.isPending}
            >
              {deleteTestimonialMutation.isPending ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i> Deleting...
                </>
              ) : (
                "Delete Testimonial"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
