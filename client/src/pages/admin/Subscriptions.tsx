import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { apiRequest } from '@/lib/queryClient';

export default function Subscriptions() {
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [, setLocation] = useLocation();

  // Fetch subscriptions
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-subscriptions'],
    queryFn: async () => {
      console.log('Fetching subscriptions from admin API endpoint...');
      const data = await apiRequest('/api/admin/subscriptions');
      return data;
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest(`/api/admin/subscriptions/${id}`, {
        method: 'DELETE',
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-subscriptions'] });
      setDeleteDialogOpen(false);
    },
  });

  const handleDelete = async () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
    }
  };

  const openDeleteDialog = (id: string) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Subscriptions</h1>
        <div className="flex justify-between mb-6">
          <div>Loading subscriptions...</div>
        </div>
      </div>
    );
  }

  if (error) {
    console.log('Error fetching subscriptions:', error);
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Subscriptions</h1>
        <div className="mb-6">
          <div className="text-red-500">Error loading subscriptions. Please try again later.</div>
          <div className="mt-2">
            <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-subscriptions'] })}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Check if data has the subscriptions property or if it's an array directly
  const subscriptions = Array.isArray(data) ? data : 
                       (data && data.subscriptions ? data.subscriptions : []);

  return (
    <div className="p-6">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Subscriptions</h1>
        <Button onClick={() => setLocation("/admin/subscriptions/new")}>
          Add New
        </Button>
      </div>

      {subscriptions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No subscriptions found.</p>
          <Button className="mt-4" onClick={() => setLocation("/admin/subscriptions/new")}>
            Create your first subscription
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subscriptions.map((subscription) => (
            <Card key={subscription.id} className="overflow-hidden">
              <CardHeader className="pb-3" style={{ backgroundColor: subscription.color || '#f3f4f6' }}>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-white">{subscription.name}</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-white hover:text-gray-200"
                    onClick={() => openDeleteDialog(subscription.id)}
                  >
                    <Trash className="h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-gray-500 text-sm mb-3">{subscription.description || 'No description'}</p>
                <p className="font-bold text-lg mb-3">{subscription.price}</p>

                <div className="flex flex-col gap-2 mt-4">
                  {subscription.features && subscription.features.length > 0 ? (
                    <div className="text-sm text-gray-600">
                      <p className="font-semibold mb-1">Features:</p>
                      <ul className="list-disc list-inside">
                        {subscription.features.map((feature, index) => (
                          <li key={index}>
                            {typeof feature === 'string' ? feature : 
                             (feature.name && feature.value ? `${feature.name}: ${feature.value}` : 
                             Object.keys(feature)[0])}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No features listed</p>
                  )}
                </div>

                <div className="mt-4">
                  <Button className="w-full" variant="outline" onClick={() => setLocation(`/admin/subscriptions/${subscription.id}`)}>
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this subscription? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}