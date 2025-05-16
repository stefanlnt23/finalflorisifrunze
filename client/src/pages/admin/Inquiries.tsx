import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Inquiry, Service } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Loader2, Trash2 } from "lucide-react";

// Status badge colors
const getStatusColor = (status: string) => {
  switch (status) {
    case "new":
      return "bg-blue-500";
    case "in-progress":
      return "bg-yellow-500";
    case "resolved":
      return "bg-green-500";
    case "archived":
      return "bg-gray-500";
    default:
      return "bg-gray-500";
  }
};

export default function AdminInquiries() {
  const { toast } = useToast();
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch inquiries
  const { data, isLoading: isLoadingInquiries } = useQuery<{ inquiries: Inquiry[] }>({
    queryKey: ['/api/admin/inquiries'],
    refetchOnWindowFocus: false,
  });

  const inquiries = data?.inquiries || [];

  // Fetch services for reference
  const { data: servicesData } = useQuery<{ services: Service[] }>({
    queryKey: ['/api/services'],
    refetchOnWindowFocus: false,
  });

  const services = servicesData?.services || [];

  // Get service name by ID
  const getServiceName = (serviceId: number | string | null | undefined) => {
    if (!serviceId) return "N/A";
    const service = services.find((s: Service) => s.id === serviceId);
    return service ? service.name : `Service #${serviceId}`;
  };

  // Update inquiry status
  const updateInquiryMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string | number, status: string }) => {
      const response = await apiRequest("PUT", `/api/admin/inquiries/${id}`, { status });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Status updated",
        description: "The inquiry status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/inquiries'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update inquiry status: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete inquiry
  const deleteInquiryMutation = useMutation({
    mutationFn: async (id: string | number) => {
      await apiRequest("DELETE", `/api/admin/inquiries/${id}`);
    },
    onSuccess: () => {
      setIsDeleteDialogOpen(false);
      setSelectedInquiry(null);
      
      toast({
        title: "Inquiry deleted",
        description: "The inquiry has been deleted successfully.",
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/admin/inquiries'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete inquiry: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handle status change
  const handleStatusChange = (status: string) => {
    if (!selectedInquiry) return;
    
    updateInquiryMutation.mutate({
      id: selectedInquiry.id,
      status
    });
  };

  // Handle delete
  const handleDelete = () => {
    if (!selectedInquiry) return;
    deleteInquiryMutation.mutate(selectedInquiry.id);
  };

  // View inquiry details
  const viewInquiryDetails = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setIsDetailsOpen(true);
  };

  // Format date
  const formatDate = (dateString: string | Date) => {
    try {
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
      return format(date, 'MMM d, yyyy h:mm a');
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <AdminLayout title="Customer Inquiries">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Customer Inquiries</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingInquiries ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            </div>
          ) : inquiries.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No inquiries found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inquiries.map((inquiry: Inquiry) => (
                  <TableRow key={inquiry.id}>
                    <TableCell>{formatDate(inquiry.createdAt)}</TableCell>
                    <TableCell>{inquiry.name}</TableCell>
                    <TableCell>{inquiry.email}</TableCell>
                    <TableCell>{getServiceName(inquiry.serviceId)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(inquiry.status || 'new')}>
                        {inquiry.status || 'new'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => viewInquiryDetails(inquiry)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Inquiry Details Dialog */}
      {selectedInquiry && (
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Inquiry Details</DialogTitle>
              <DialogDescription>
                Review and manage customer inquiry
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <div>
                  <h4 className="font-medium text-sm text-gray-500">Customer Name</h4>
                  <p>{selectedInquiry.name}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-500">Email</h4>
                  <p>{selectedInquiry.email}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-500">Phone</h4>
                  <p>{selectedInquiry.phone || "Not provided"}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-500">Date Submitted</h4>
                  <p>{formatDate(selectedInquiry.createdAt)}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div>
                  <h4 className="font-medium text-sm text-gray-500">Service Interested In</h4>
                  <p>{getServiceName(selectedInquiry.serviceId)}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-500">Status</h4>
                  <div className="mt-1">
                    <Select 
                      defaultValue={selectedInquiry.status || "new"} 
                      onValueChange={handleStatusChange}
                      disabled={updateInquiryMutation.isPending}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-2">
              <h4 className="font-medium text-sm text-gray-500 mb-2">Message</h4>
              <div className="bg-gray-50 p-4 rounded-md whitespace-pre-wrap">
                {selectedInquiry.message}
              </div>
            </div>
            
            <DialogFooter className="flex items-center justify-between sm:justify-between mt-6">
              <Button
                variant="destructive"
                onClick={() => setIsDeleteDialogOpen(true)}
                className="flex items-center gap-1"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
              <Button onClick={() => setIsDetailsOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {selectedInquiry && (
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this inquiry? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteInquiryMutation.isPending}
              >
                {deleteInquiryMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </AdminLayout>
  );
}