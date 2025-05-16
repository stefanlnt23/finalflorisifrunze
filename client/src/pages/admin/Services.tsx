import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
// Import Service but override id to support MongoDB string IDs
import { Service as SchemaService } from "@shared/schema";
type Service = Omit<SchemaService, 'id'> & { id: string | number };
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function AdminServices() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);

  // MongoDB uses string IDs - this type ensures compatibility
  type MongoID = string | number;

  // Fetch services
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/admin/services'],
    refetchOnWindowFocus: false,
  });

  const services = data?.services || [];

  // Delete service mutation
  const deleteServiceMutation = useMutation({
    mutationFn: async (serviceId: MongoID) => {
      return await apiRequest("DELETE", `/api/admin/services/${serviceId}`);
    },
    onSuccess: () => {
      toast({
        title: "Service Deleted",
        description: "The service has been successfully deleted",
      });
      // Invalidate services query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/admin/services'] });
      setDeleteDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete the service",
        variant: "destructive",
      });
    },
  });

  // Handle delete click
  const handleDeleteClick = (service: Service) => {
    setServiceToDelete(service);
    setDeleteDialogOpen(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = () => {
    if (serviceToDelete) {
      deleteServiceMutation.mutate(serviceToDelete.id);
    }
  };

  return (
    <AdminLayout 
      title="Services" 
      description="Manage your gardening services"
      action={
        <Link href="/admin/services/new">
          <Button className="bg-green-600 hover:bg-green-700">
            <i className="fas fa-plus mr-2"></i> Add Service
          </Button>
        </Link>
      }
    >
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <i className="fas fa-spinner fa-spin text-3xl text-gray-400 mb-4"></i>
              <p className="text-gray-500">Loading services...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <i className="fas fa-exclamation-circle text-3xl text-red-500 mb-4"></i>
              <p className="text-gray-500">Error loading services</p>
            </div>
          ) : services.length === 0 ? (
            <div className="p-8 text-center">
              <i className="fas fa-leaf text-5xl text-gray-300 mb-4"></i>
              <h3 className="text-lg font-medium text-gray-600 mb-2">No services found</h3>
              <p className="text-gray-500 mb-6">Get started by adding your first service</p>
              <Link href="/admin/services/new">
                <Button className="bg-green-600 hover:bg-green-700">
                  <i className="fas fa-plus mr-2"></i> Add Service
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Featured</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.map((service: Service) => (
                    <TableRow key={service.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          {service.imageUrl ? (
                            <div className="h-10 w-10 rounded-md overflow-hidden">
                              <img 
                                src={service.imageUrl} 
                                alt={service.name} 
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="h-10 w-10 bg-green-100 rounded-md flex items-center justify-center">
                              <i className="fas fa-spa text-green-600"></i>
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{service.name}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {service.description.length > 50 
                                ? `${service.description.substring(0, 50)}...` 
                                : service.description}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{service.price}</TableCell>
                      <TableCell>
                        {service.featured ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            Featured
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-500">
                            Not Featured
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setLocation(`/admin/services/${service.id}`)}
                          >
                            <i className="fas fa-edit text-blue-600"></i>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteClick(service)}
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
              This will permanently delete the service "{serviceToDelete?.name}". 
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
              disabled={deleteServiceMutation.isPending}
            >
              {deleteServiceMutation.isPending ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i> Deleting...
                </>
              ) : (
                "Delete Service"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}