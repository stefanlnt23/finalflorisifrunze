import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { PortfolioItem, Service } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { Eye, Search, Filter, ArrowUpDown, Copy } from "lucide-react";

export default function AdminPortfolio() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<PortfolioItem | null>(null);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [filterStatus, setFilterStatus] = useState<"All" | "Published" | "Draft">("All");
  const [filterFeatured, setFilterFeatured] = useState<"All" | "Featured" | "Regular">("All");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "title" | "views">("newest");

  // Fetch portfolio items
  const { data: portfolioData, isLoading, error } = useQuery({
    queryKey: ['/api/admin/portfolio'],
    refetchOnWindowFocus: false,
  });

  // Fetch services for display
  const { data: servicesData } = useQuery({
    queryKey: ['/api/services'],
    refetchOnWindowFocus: false,
  });

  const allPortfolioItems = portfolioData?.portfolioItems || [];
  const services = servicesData?.services || [];
  
  // Filter and sort portfolio items
  const filteredPortfolioItems = allPortfolioItems
    .filter((item: PortfolioItem) => {
      // Filter by search query
      const matchesSearch = 
        searchQuery === "" || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.location && item.location.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Filter by status
      const matchesStatus = 
        filterStatus === "All" || 
        item.status === filterStatus;
      
      // Filter by featured
      const matchesFeatured = 
        filterFeatured === "All" || 
        (filterFeatured === "Featured" && item.featured) || 
        (filterFeatured === "Regular" && !item.featured);
      
      return matchesSearch && matchesStatus && matchesFeatured;
    })
    .sort((a: PortfolioItem, b: PortfolioItem) => {
      // Sort by selected criteria
      switch (sortBy) {
        case "newest":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "oldest":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "title":
          return a.title.localeCompare(b.title);
        case "views":
          return (b.viewCount || 0) - (a.viewCount || 0);
        default:
          return 0;
      }
    });

  // Helper to get service name
  const getServiceName = (serviceId: number | null): string => {
    if (!serviceId) return "No Service";
    const service = services.find((s: Service) => s.id === serviceId);
    return service ? service.name : "Unknown Service";
  };
  
  // Reset selected items when filtered items change
  useEffect(() => {
    setSelectedItems([]);
  }, [searchQuery, filterStatus, filterFeatured, sortBy]);

  // Delete portfolio item mutation
  const deletePortfolioItemMutation = useMutation({
    mutationFn: async (itemId: number) => {
      return await apiRequest("DELETE", `/api/admin/portfolio/${itemId}`);
    },
    onSuccess: () => {
      toast({
        title: "Portfolio Item Deleted",
        description: "The portfolio item has been successfully deleted",
      });
      // Invalidate portfolio query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/admin/portfolio'] });
      setDeleteDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete the portfolio item",
        variant: "destructive",
      });
    },
  });
  
  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (itemIds: number[]) => {
      // Create a promise for each delete operation
      const deletePromises = itemIds.map(id => 
        apiRequest("DELETE", `/api/admin/portfolio/${id}`)
      );
      // Wait for all delete operations to complete
      return Promise.all(deletePromises);
    },
    onSuccess: () => {
      toast({
        title: "Portfolio Items Deleted",
        description: `${selectedItems.length} items have been successfully deleted`,
      });
      // Invalidate portfolio query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/admin/portfolio'] });
      setBulkDeleteDialogOpen(false);
      setSelectedItems([]);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete the selected items",
        variant: "destructive",
      });
    },
  });
  
  // Bulk update status mutation
  const bulkUpdateStatusMutation = useMutation({
    mutationFn: async ({ itemIds, status }: { itemIds: number[], status: string }) => {
      // Create a promise for each update operation
      const updatePromises = itemIds.map(id => 
        apiRequest("PUT", `/api/admin/portfolio/${id}`, { status })
      );
      // Wait for all update operations to complete
      return Promise.all(updatePromises);
    },
    onSuccess: () => {
      toast({
        title: "Portfolio Items Updated",
        description: `Status updated for ${selectedItems.length} items`,
      });
      // Invalidate portfolio query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/admin/portfolio'] });
      setSelectedItems([]);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update the selected items",
        variant: "destructive",
      });
    },
  });
  
  // Duplicate portfolio item mutation
  const duplicateItemMutation = useMutation({
    mutationFn: async (itemId: number) => {
      // First get the item to duplicate
      const response = await apiRequest("GET", `/api/admin/portfolio/${itemId}`);
      const data = await response.json();
      const item = data.portfolioItem;
      
      // Create a new item with the same data but a different title
      const newItem = {
        ...item,
        title: `${item.title} (Copy)`,
        id: undefined // Remove ID so a new one is generated
      };
      
      return await apiRequest("POST", "/api/admin/portfolio", newItem);
    },
    onSuccess: () => {
      toast({
        title: "Portfolio Item Duplicated",
        description: "A copy of the portfolio item has been created",
      });
      // Invalidate portfolio query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/admin/portfolio'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to duplicate the portfolio item",
        variant: "destructive",
      });
    },
  });

  // Handle delete click
  const handleDeleteClick = (item: PortfolioItem) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = () => {
    if (itemToDelete) {
      deletePortfolioItemMutation.mutate(itemToDelete.id);
    }
  };
  
  // Handle bulk delete click
  const handleBulkDeleteClick = () => {
    if (selectedItems.length > 0) {
      setBulkDeleteDialogOpen(true);
    }
  };
  
  // Handle confirm bulk delete
  const handleConfirmBulkDelete = () => {
    if (selectedItems.length > 0) {
      bulkDeleteMutation.mutate(selectedItems);
    }
  };
  
  // Handle bulk publish
  const handleBulkPublish = () => {
    if (selectedItems.length > 0) {
      bulkUpdateStatusMutation.mutate({ 
        itemIds: selectedItems, 
        status: "Published" 
      });
    }
  };
  
  // Handle bulk unpublish
  const handleBulkUnpublish = () => {
    if (selectedItems.length > 0) {
      bulkUpdateStatusMutation.mutate({ 
        itemIds: selectedItems, 
        status: "Draft" 
      });
    }
  };
  
  // Handle duplicate item
  const handleDuplicateItem = (itemId: number) => {
    duplicateItemMutation.mutate(itemId);
  };
  
  // Handle item selection
  const handleSelectItem = (itemId: number, isSelected: boolean) => {
    if (isSelected) {
      setSelectedItems([...selectedItems, itemId]);
    } else {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    }
  };
  
  // Handle select all
  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedItems(filteredPortfolioItems.map((item: PortfolioItem) => item.id as number));
    } else {
      setSelectedItems([]);
    }
  };

  return (
    <AdminLayout 
      title="Portfolio" 
      description="Manage your project portfolio"
      action={
        <Link href="/admin/portfolio/new">
          <Button className="bg-green-600 hover:bg-green-700">
            <i className="fas fa-plus mr-2"></i> Add Project
          </Button>
        </Link>
      }
    >
      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="flex flex-1 items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search projects..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                <SelectTrigger className="w-[130px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="Published">Published</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterFeatured} onValueChange={(value: any) => setFilterFeatured(value)}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Featured" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Projects</SelectItem>
                  <SelectItem value="Featured">Featured</SelectItem>
                  <SelectItem value="Regular">Regular</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-[130px]">
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="title">Title A-Z</SelectItem>
                  <SelectItem value="views">Most Views</SelectItem>
                </SelectContent>
              </Select>
              
              <Tabs value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
                <TabsList className="grid w-[100px] grid-cols-2">
                  <TabsTrigger value="list">
                    <i className="fas fa-list"></i>
                  </TabsTrigger>
                  <TabsTrigger value="grid">
                    <i className="fas fa-th-large"></i>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
          
          {/* Bulk Actions */}
          {selectedItems.length > 0 && (
            <div className="mt-4 flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 p-2">
              <div className="text-sm">
                <span className="font-medium">{selectedItems.length}</span> items selected
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleBulkPublish}
                  disabled={bulkUpdateStatusMutation.isPending}
                >
                  <i className="fas fa-check-circle text-green-600 mr-1"></i> Publish
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleBulkUnpublish}
                  disabled={bulkUpdateStatusMutation.isPending}
                >
                  <i className="fas fa-eye-slash text-gray-600 mr-1"></i> Unpublish
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleBulkDeleteClick}
                  disabled={bulkDeleteMutation.isPending}
                >
                  <i className="fas fa-trash text-red-600 mr-1"></i> Delete
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <i className="fas fa-spinner fa-spin text-3xl text-gray-400 mb-4"></i>
              <p className="text-gray-500">Loading portfolio items...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <i className="fas fa-exclamation-circle text-3xl text-red-500 mb-4"></i>
              <p className="text-gray-500">Error loading portfolio items</p>
            </div>
          ) : filteredPortfolioItems.length === 0 ? (
            <div className="p-8 text-center">
              <i className="fas fa-images text-5xl text-gray-300 mb-4"></i>
              <h3 className="text-lg font-medium text-gray-600 mb-2">No portfolio items found</h3>
              <p className="text-gray-500 mb-6">
                {searchQuery || filterStatus !== "All" || filterFeatured !== "All" 
                  ? "Try adjusting your filters" 
                  : "Get started by adding your first project"}
              </p>
              {searchQuery || filterStatus !== "All" || filterFeatured !== "All" ? (
                <Button 
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setFilterStatus("All");
                    setFilterFeatured("All");
                  }}
                >
                  <i className="fas fa-times mr-2"></i> Clear Filters
                </Button>
              ) : (
                <Link href="/admin/portfolio/new">
                  <Button className="bg-green-600 hover:bg-green-700">
                    <i className="fas fa-plus mr-2"></i> Add Project
                  </Button>
                </Link>
              )}
            </div>
          ) : viewMode === "list" ? (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[30px]">
                      <Checkbox 
                        checked={selectedItems.length === filteredPortfolioItems.length && filteredPortfolioItems.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Service Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPortfolioItems.map((item: PortfolioItem) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Checkbox 
                          checked={selectedItems.includes(item.id as number)}
                          onCheckedChange={(checked) => handleSelectItem(item.id as number, !!checked)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          {item.imageUrl ? (
                            <div className="h-10 w-10 rounded-md overflow-hidden">
                              <img 
                                src={item.imageUrl} 
                                alt={item.title} 
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="h-10 w-10 bg-green-100 rounded-md flex items-center justify-center">
                              <i className="fas fa-image text-green-600"></i>
                            </div>
                          )}
                          <div>
                            <div className="font-medium flex items-center">
                              {item.title}
                              {item.featured && (
                                <Badge className="ml-2 bg-yellow-100 text-yellow-800 border-yellow-300">
                                  Featured
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {item.description.length > 50 
                                ? `${item.description.substring(0, 50)}...` 
                                : item.description}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getServiceName(item.serviceId)}</TableCell>
                      <TableCell>
                        {item.status === "Published" ? (
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                            Published
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">
                            Draft
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {item.date ? 
                          format(new Date(item.date), "MMM d, yyyy") : 
                          "No date"
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Eye className="mr-1 h-4 w-4 text-gray-500" />
                          {item.viewCount || 0}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDuplicateItem(item.id as number)}
                            disabled={duplicateItemMutation.isPending}
                          >
                            <Copy className="h-4 w-4 text-gray-600" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setLocation(`/admin/portfolio/${item.id}`)}
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
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
              {filteredPortfolioItems.map((item: PortfolioItem) => (
                <Card key={item.id} className="overflow-hidden">
                  <div className="relative">
                    <div className="absolute top-2 right-2 z-10">
                      <Checkbox 
                        className="h-5 w-5 bg-white rounded-md"
                        checked={selectedItems.includes(item.id as number)}
                        onCheckedChange={(checked) => handleSelectItem(item.id as number, !!checked)}
                      />
                    </div>
                    {item.imageUrl ? (
                      <div className="h-40 w-full">
                        <img 
                          src={item.imageUrl} 
                          alt={item.title} 
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-40 w-full bg-green-100 flex items-center justify-center">
                        <i className="fas fa-image text-3xl text-green-600"></i>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {item.status === "Published" ? (
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                            Published
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">
                            Draft
                          </Badge>
                        )}
                        {item.featured && (
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                            Featured
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Eye className="mr-1 h-4 w-4" />
                        {item.viewCount || 0}
                      </div>
                    </div>
                    <h3 className="font-medium text-lg mb-1 truncate">{item.title}</h3>
                    <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                      {item.description}
                    </p>
                    <div className="text-xs text-gray-500 mb-4">
                      {getServiceName(item.serviceId)} • 
                      {item.date ? 
                        format(new Date(item.date), "MMM d, yyyy") : 
                        "No date"
                      }
                    </div>
                    <div className="flex justify-between">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDuplicateItem(item.id as number)}
                        disabled={duplicateItemMutation.isPending}
                      >
                        <Copy className="h-4 w-4 text-gray-600" />
                      </Button>
                      <div className="space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setLocation(`/admin/portfolio/${item.id}`)}
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
                    </div>
                  </CardContent>
                </Card>
              ))}
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
              This will permanently delete the portfolio item "{itemToDelete?.title}". 
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
              disabled={deletePortfolioItemMutation.isPending}
            >
              {deletePortfolioItemMutation.isPending ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i> Deleting...
                </>
              ) : (
                "Delete Project"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Bulk Delete Confirmation Dialog */}
      <Dialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This will permanently delete {selectedItems.length} portfolio items. 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBulkDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmBulkDelete}
              disabled={bulkDeleteMutation.isPending}
            >
              {bulkDeleteMutation.isPending ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i> Deleting...
                </>
              ) : (
                `Delete ${selectedItems.length} Items`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
