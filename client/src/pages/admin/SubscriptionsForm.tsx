import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { apiRequest } from '@/lib/queryClient';
import { Separator } from '@/components/ui/separator';
import { PlusCircle, MinusCircle } from 'lucide-react';

export default function SubscriptionsForm() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const isEditMode = id !== 'new';

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    color: '#4CAF50',
    isPopular: false,
    displayOrder: 1,
    imageUrl: '',
    features: [{ name: '', value: '' }]
  });

  // Fetch subscriptions list first to verify the ID exists
  const { data: subscriptionsData } = useQuery({
    queryKey: ['admin-subscriptions'],
    queryFn: async () => {
      try {
        const response = await apiRequest('/api/admin/subscriptions');
        return Array.isArray(response) ? response : 
               (response?.subscriptions || []);
      } catch (err) {
        console.error('Error fetching subscriptions list:', err);
        return [];
      }
    },
    enabled: isEditMode // Only fetch if we're in edit mode
  });

  // Fetch subscription data for editing
  const { data, isLoading, error } = useQuery({
    queryKey: ['subscription', id],
    queryFn: async () => {
      if (isEditMode && id !== 'new') {
        try {
          console.log(`Fetching subscription with ID: ${id}`);
          
          // Check if subscription ID exists in the list
          const subscriptions = subscriptionsData || [];
          console.log(`Checking ID ${id} against ${subscriptions.length} subscriptions`);
          
          // First try to find it in the list to avoid making an unnecessary API call
          const foundInList = subscriptions.find(s => s.id === id);
          if (foundInList) {
            console.log('Found subscription in list:', foundInList);
            return foundInList;
          }
          
          // If not in list or list is empty, try direct API call
          const response = await apiRequest(`/api/admin/subscriptions/${id}`);
          console.log('API response:', response);
          
          // Check various response formats
          if (response && response.subscription) {
            return response.subscription;
          } else if (response && typeof response === 'object' && response.id) {
            return response;
          } else if (Array.isArray(response) && response.length > 0) {
            return response[0];
          }
          
          throw new Error('Subscription not found');
        } catch (error) {
          console.error('Error fetching subscription:', error);
          throw error;
        }
      }
      return null;
    },
    enabled: isEditMode && id !== 'new',
    retry: false // Don't retry on failure
  });

  // Save subscription data
  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (isEditMode) {
        return await apiRequest(`/api/admin/subscriptions/${id}`, {
          method: 'PUT',
          data
        });
      } else {
        return await apiRequest('/api/admin/subscriptions', {
          method: 'POST',
          data
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-subscriptions'] });
      setLocation('/admin/subscriptions');
    }
  });

  // Populate form with existing data when editing
  useEffect(() => {
    if (data && isEditMode) {
      console.log('Populating form data with:', data);

      // Ensure features is an array of objects with name/value properties
      let features = data.features || [];

      // Make sure features is an array
      if (!Array.isArray(features)) {
        console.log('Features is not an array, converting:', features);
        features = Object.keys(features || {}).map(key => ({
          name: key,
          value: features[key]
        }));
      }

      if (features.length > 0) {
        // Convert any string or other format to the expected structure
        features = features.map((feature: any) => {
          if (typeof feature === 'string') {
            return { name: feature, value: '' };
          } else if (feature && typeof feature === 'object') {
            if (feature.name && 'value' in feature) {
              return feature;
            } else {
              const key = Object.keys(feature)[0] || '';
              return { name: key, value: feature[key] || '' };
            }
          }
          return { name: '', value: '' };
        });
      }

      console.log('Processed features:', features);

      setFormData({
        name: data.name || '',
        description: data.description || '',
        price: data.price || '',
        color: data.color || '#4CAF50',
        isPopular: Boolean(data.isPopular),
        displayOrder: typeof data.displayOrder === 'number' ? data.displayOrder : 1,
        imageUrl: data.imageUrl || '',
        features: features.length > 0 ? features : [{ name: '', value: '' }]
      });
    }
  }, [data, isEditMode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFeatureChange = (index: number, field: string, value: string) => {
    const updatedFeatures = [...formData.features];
    updatedFeatures[index] = { ...updatedFeatures[index], [field]: value };
    setFormData(prev => ({ ...prev, features: updatedFeatures }));
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, { name: '', value: '' }]
    }));
  };

  const removeFeature = (index: number) => {
    const updatedFeatures = [...formData.features];
    updatedFeatures.splice(index, 1);
    setFormData(prev => ({ ...prev, features: updatedFeatures }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Filter out empty features
    const filteredFeatures = formData.features.filter(
      feature => feature.name.trim() !== '' || feature.value.trim() !== ''
    );

    saveMutation.mutate({
      ...formData,
      features: filteredFeatures
    });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">
          {isEditMode ? 'Edit Subscription' : 'Add New Subscription'}
        </h1>
        <div>Loading...</div>
      </div>
    );
  }

  if (error && isEditMode && id !== 'new') {
    return (
      <div className="p-6">
        <div className="flex justify-between mb-6">
          <h1 className="text-2xl font-bold">
            Error Loading Subscription
          </h1>
          <Button variant="outline" onClick={() => setLocation('/admin/subscriptions')}>
            Back to List
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Failed to load subscription data. The subscription may no longer exist.</p>
            <div className="mt-4">
              <Button 
                variant="outline" 
                onClick={() => setLocation('/admin/subscriptions/new')}
              >
                Create New Subscription
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">
          {isEditMode ? 'Edit Subscription' : 'Add New Subscription'}
        </h1>
        <Button variant="outline" onClick={() => setLocation('/admin/subscriptions')}>
          Back to List
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isEditMode ? 'Edit Subscription' : 'New Subscription'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. 199 RON / lună"
                  />
                </div>

                <div>
                  <Label htmlFor="color">Color</Label>
                  <div className="flex gap-3">
                    <Input
                      id="color"
                      name="color"
                      type="color"
                      value={formData.color}
                      onChange={handleInputChange}
                      className="w-16 h-10"
                    />
                    <Input
                      name="color"
                      value={formData.color}
                      onChange={handleInputChange}
                      placeholder="#RRGGBB"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input
                    id="imageUrl"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Input
                    id="isPopular"
                    name="isPopular"
                    type="checkbox"
                    checked={formData.isPopular}
                    onChange={handleInputChange}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="isPopular">Mark as Popular</Label>
                </div>

                <div>
                  <Label htmlFor="displayOrder">Display Order</Label>
                  <Input
                    id="displayOrder"
                    name="displayOrder"
                    type="number"
                    value={formData.displayOrder}
                    onChange={handleInputChange}
                    min="1"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                  />
                </div>

                <div className="space-y-4 mt-6">
                  <div className="flex justify-between items-center">
                    <Label>Features</Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={addFeature}
                      className="flex items-center gap-1"
                    >
                      <PlusCircle className="h-4 w-4" /> Add Feature
                    </Button>
                  </div>

                  <Separator />

                  {formData.features.map((feature, index) => (
                    <div key={index} className="grid grid-cols-8 gap-2 items-center">
                      <div className="col-span-3">
                        <Input
                          placeholder="Feature name"
                          value={feature.name}
                          onChange={(e) => handleFeatureChange(index, 'name', e.target.value)}
                        />
                      </div>
                      <div className="col-span-4">
                        <Input
                          placeholder="Feature value"
                          value={feature.value}
                          onChange={(e) => handleFeatureChange(index, 'value', e.target.value)}
                        />
                      </div>
                      <div className="col-span-1 flex justify-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFeature(index)}
                          disabled={formData.features.length <= 1}
                        >
                          <MinusCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setLocation('/admin/subscriptions')}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={saveMutation.isPending}
              >
                {saveMutation.isPending
                  ? 'Saving...'
                  : isEditMode
                  ? 'Update Subscription'
                  : 'Create Subscription'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}