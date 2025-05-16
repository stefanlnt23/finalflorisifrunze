import { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { Appointment } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

// Helper function to format address
const formatAddress = (appointment: Appointment) => {
  const parts = [];
  if (appointment.houseNumber) parts.push(appointment.houseNumber);
  if (appointment.streetName) parts.push(appointment.streetName);
  if (appointment.city) parts.push(appointment.city);
  if (appointment.postalCode) parts.push(appointment.postalCode);
  return parts.join(", ");
};

// Helper function to get status badge color
const getStatusColor = (status: string) => {
  switch (status) {
    case "Scheduled":
      return "bg-blue-100 text-blue-800";
    case "Completed":
      return "bg-green-100 text-green-800";
    case "Cancelled":
      return "bg-red-100 text-red-800";
    case "Rescheduled":
      return "bg-amber-100 text-amber-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Helper function to get priority badge color
const getPriorityColor = (priority: string) => {
  return priority === "Urgent" 
    ? "bg-red-100 text-red-800" 
    : "bg-gray-100 text-gray-800";
};

export default function AdminAppointments() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Appointment | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const itemsPerPage = 10;

  // Fetch appointments
  const { data, isLoading, error } = useQuery<{ appointments: Appointment[] }>({
    queryKey: ['/api/admin/appointments'],
    refetchOnWindowFocus: false,
  });

  const appointments = data?.appointments ?? [];

  // Filter and sort appointments
  const filteredAppointments = useMemo(() => {
    return appointments
      .filter(appointment => {
        // Status filter
        if (statusFilter !== "all" && appointment.status !== statusFilter) {
          return false;
        }
        
        // Search term filter
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          return (
            appointment.name.toLowerCase().includes(searchLower) ||
            formatAddress(appointment).toLowerCase().includes(searchLower) ||
            format(new Date(appointment.date), "PPP").toLowerCase().includes(searchLower)
          );
        }
        
        return true;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [appointments, searchTerm, statusFilter]);

  // Calendar view filtered appointments
  const calendarAppointments = useMemo(() => {
    if (!selectedDate) return [];
    
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      return (
        appointmentDate.getDate() === selectedDate.getDate() &&
        appointmentDate.getMonth() === selectedDate.getMonth() &&
        appointmentDate.getFullYear() === selectedDate.getFullYear()
      );
    });
  }, [appointments, selectedDate]);

  // Pagination
  const paginatedAppointments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAppointments.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAppointments, currentPage]);

  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);

  // Delete appointment mutation
  const deleteAppointmentMutation = useMutation({
    mutationFn: async (itemId: string | number) => {
      return await apiRequest("DELETE", `/api/admin/appointments/${itemId}`);
    },
    onSuccess: () => {
      toast({
        title: "Appointment Deleted",
        description: "The appointment has been successfully deleted",
      });
      // Invalidate appointments query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/admin/appointments'] });
      setDeleteDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete the appointment",
        variant: "destructive",
      });
    },
  });

  // Handle delete click
  const handleDeleteClick = (item: Appointment) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = () => {
    if (itemToDelete) {
      deleteAppointmentMutation.mutate(itemToDelete.id);
    }
  };

  // Handle status update
  const handleStatusUpdate = async (id: string | number, status: string) => {
    try {
      const response = await apiRequest("PUT", `/api/admin/appointments/${id}`, { status });
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Status Updated",
          description: `Appointment status changed to ${status}`,
        });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/appointments'] });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to update status",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update appointment status",
        variant: "destructive",
      });
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    // Create CSV content
    const headers = [
      "ID", "Customer Name", "Email", "Phone", 
      "Address", "Date/Time", "Service", "Status", 
      "Priority", "Notes"
    ];
    
    const csvRows = [headers.join(",")];
    
    filteredAppointments.forEach(appointment => {
      const row = [
        appointment.id,
        `"${appointment.name}"`,
        `"${appointment.email}"`,
        `"${appointment.phone}"`,
        `"${formatAddress(appointment)}"`,
        `"${format(new Date(appointment.date), "PPP p")}"`,
        `"${appointment.serviceId}"`, // Ideally would show service name
        `"${appointment.status}"`,
        `"${appointment.priority}"`,
        `"${appointment.notes?.replace(/"/g, '""') || ""}"`
      ];
      csvRows.push(row.join(","));
    });
    
    const csvContent = csvRows.join("\n");
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `appointments_${format(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminLayout 
      title="Appointments" 
      description="Manage gardening service appointments"
      action={
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={exportToCSV}
          >
            <i className="fas fa-file-export mr-2"></i> Export CSV
          </Button>
          <Link href="/admin/appointments/new">
            <Button className="bg-green-600 hover:bg-green-700">
              <i className="fas fa-plus mr-2"></i> New Appointment
            </Button>
          </Link>
        </div>
      }
    >
      <div className="mb-6">
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "list" | "calendar")}>
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="list">
                <i className="fas fa-list mr-2"></i> List View
              </TabsTrigger>
              <TabsTrigger value="calendar">
                <i className="fas fa-calendar-alt mr-2"></i> Calendar View
              </TabsTrigger>
            </TabsList>
            
            <div className="flex space-x-2">
              <Input
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                  <SelectItem value="Rescheduled">Rescheduled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <TabsContent value="list">
            <Card>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-8 text-center">
                    <i className="fas fa-spinner fa-spin text-3xl text-gray-400 mb-4"></i>
                    <p className="text-gray-500">Loading appointments...</p>
                  </div>
                ) : error ? (
                  <div className="p-8 text-center">
                    <i className="fas fa-exclamation-circle text-3xl text-red-500 mb-4"></i>
                    <p className="text-gray-500">Error loading appointments</p>
                  </div>
                ) : filteredAppointments.length === 0 ? (
                  <div className="p-8 text-center">
                    <i className="fas fa-calendar-times text-5xl text-gray-300 mb-4"></i>
                    <h3 className="text-lg font-medium text-gray-600 mb-2">No appointments found</h3>
                    <p className="text-gray-500 mb-6">
                      {searchTerm || statusFilter !== "all" 
                        ? "Try adjusting your search or filters" 
                        : "Get started by adding your first appointment"}
                    </p>
                    {!searchTerm && statusFilter === "all" && (
                      <Link href="/admin/appointments/new">
                        <Button className="bg-green-600 hover:bg-green-700">
                          <i className="fas fa-plus mr-2"></i> Add Appointment
                        </Button>
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Customer</TableHead>
                          <TableHead>Date/Time</TableHead>
                          <TableHead>Address</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Priority</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedAppointments.map((item: Appointment) => (
                          <TableRow key={item.id} className={item.priority === "Urgent" ? "bg-red-50" : ""}>
                            <TableCell>
                              <div className="font-medium">{item.name}</div>
                              <div className="text-sm text-gray-500">{item.phone}</div>
                            </TableCell>
                            <TableCell>
                              {format(new Date(item.date), "PPP")}
                              <div className="text-sm text-gray-500">
                                {format(new Date(item.date), "p")}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="max-w-xs truncate">
                                {formatAddress(item)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(item.status)}>
                                {item.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={getPriorityColor(item.priority)}>
                                {item.priority}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <Select 
                                  value={item.status} 
                                  onValueChange={(value) => handleStatusUpdate(item.id, value)}
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue placeholder="Change status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                                    <SelectItem value="Completed">Completed</SelectItem>
                                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                                    <SelectItem value="Rescheduled">Rescheduled</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setLocation(`/admin/appointments/${item.id}`)}
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
                    
                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="py-4 flex justify-center">
                        <Pagination>
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious 
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                              />
                            </PaginationItem>
                            
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                              <PaginationItem key={page}>
                                <PaginationLink
                                  isActive={currentPage === page}
                                  onClick={() => setCurrentPage(page)}
                                  className="cursor-pointer"
                                >
                                  {page}
                                </PaginationLink>
                              </PaginationItem>
                            ))}
                            
                            <PaginationItem>
                              <PaginationNext 
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="calendar">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-1">
                <CardContent className="p-4">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border"
                  />
                </CardContent>
              </Card>
              
              <Card className="md:col-span-2">
                <CardContent className="p-4">
                  <h3 className="text-lg font-medium mb-4">
                    Appointments for {selectedDate ? format(selectedDate, "PPPP") : "Selected Date"}
                  </h3>
                  
                  {calendarAppointments.length === 0 ? (
                    <div className="text-center py-8">
                      <i className="fas fa-calendar-day text-3xl text-gray-300 mb-2"></i>
                      <p className="text-gray-500">No appointments scheduled for this date</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {calendarAppointments
                        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                        .map(appointment => (
                          <div 
                            key={appointment.id} 
                            className={`p-4 rounded-lg border ${
                              appointment.priority === "Urgent" 
                                ? "border-red-200 bg-red-50" 
                                : "border-gray-200"
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium">{appointment.name}</div>
                                <div className="text-sm text-gray-500">{format(new Date(appointment.date), "p")}</div>
                                <div className="text-sm mt-1">{formatAddress(appointment)}</div>
                              </div>
                              <div className="flex flex-col items-end">
                                <Badge className={getStatusColor(appointment.status)}>
                                  {appointment.status}
                                </Badge>
                                {appointment.priority === "Urgent" && (
                                  <Badge className="bg-red-100 text-red-800 mt-1">
                                    Urgent
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            {appointment.notes && (
                              <div className="mt-2 text-sm text-gray-600 border-t pt-2">
                                <span className="font-medium">Notes:</span> {appointment.notes}
                              </div>
                            )}
                            
                            <div className="mt-3 flex justify-end space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setLocation(`/admin/appointments/${appointment.id}`)}
                              >
                                <i className="fas fa-edit mr-1"></i> Edit
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This will permanently delete the appointment for "{itemToDelete?.name}" scheduled on {itemToDelete?.date ? format(new Date(itemToDelete.date), "PPP 'at' p") : ""}. 
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
              disabled={deleteAppointmentMutation.isPending}
            >
              {deleteAppointmentMutation.isPending ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i> Deleting...
                </>
              ) : (
                "Delete Appointment"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
