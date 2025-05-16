
import { useState } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Trash2, MoveUp, MoveDown, Plus, Edit, X, Check } from "lucide-react";

interface FeatureCard {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  order: number;
}

export default function FeatureCards() {
  const queryClient = useQueryClient();
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newIcon, setNewIcon] = useState(""); // Adding this to prevent errors
  
  const [editMode, setEditMode] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editIcon, setEditIcon] = useState(""); // Adding this to prevent errors

  const { data: featureCardsData, isLoading } = useQuery({
    queryKey: ['/api/admin/feature-cards'],
    refetchOnWindowFocus: false,
  });

  const cards: FeatureCard[] = featureCardsData?.cards || [];

  const addCardMutation = useMutation({
    mutationFn: async (newCard: { title: string; description: string; imageUrl: string }) => {
      const response = await fetch('/api/admin/feature-cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCard),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add feature card');
      }
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/feature-cards'] });
      setNewTitle("");
      setNewDescription("");
      setNewImageUrl("");
      toast({
        title: "Success",
        description: "Feature card added successfully",
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

  const updateCardMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<FeatureCard> }) => {
      const response = await fetch(`/api/admin/feature-cards/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update feature card');
      }
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/feature-cards'] });
      setEditMode(null);
      toast({
        title: "Success",
        description: "Feature card updated successfully",
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

  const deleteCardMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/feature-cards/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete feature card');
      }
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/feature-cards'] });
      toast({
        title: "Success",
        description: "Feature card deleted successfully",
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

  const reorderCardMutation = useMutation({
    mutationFn: async ({ id, direction }: { id: string; direction: 'up' | 'down' }) => {
      const response = await fetch(`/api/admin/feature-cards/${id}/reorder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ direction }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to reorder feature card');
      }
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/feature-cards'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleAddCard = () => {
    if (!newTitle || !newDescription || !newImageUrl) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }

    addCardMutation.mutate({
      title: newTitle,
      description: newDescription,
      imageUrl: newImageUrl,
    });
  };

  const handleDeleteCard = (id: string) => {
    if (confirm("Are you sure you want to delete this feature card?")) {
      deleteCardMutation.mutate(id);
    }
  };

  const handleReorderCard = (id: string, direction: 'up' | 'down') => {
    reorderCardMutation.mutate({ id, direction });
  };

  const startEdit = (card: FeatureCard) => {
    console.log("Editing card:", card); // For debugging
    setEditMode(card.id);
    setEditTitle(card.title || '');
    setEditDescription(card.description || '');
    setEditImageUrl(card.imageUrl || '');
  };

  const cancelEdit = () => {
    setEditMode(null);
  };

  const saveEdit = (id: string) => {
    if (!editTitle || !editDescription || !editImageUrl) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }

    updateCardMutation.mutate({
      id,
      data: {
        title: editTitle,
        description: editDescription,
        imageUrl: editImageUrl,
      }
    });
  };

  // Icon selection removed as it's no longer needed

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Why Choose Us Feature Cards</h1>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Feature Cards Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <Input
                  placeholder="e.g., Expert Gardeners"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Textarea
                  placeholder="Brief description of the feature"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={2}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Image URL</label>
                <Input
                  placeholder="https://example.com/image.jpg"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Add a high-quality image URL. Recommended size: 800x600px or larger
                </p>
              </div>
              
              <Button 
                onClick={handleAddCard} 
                disabled={addCardMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Feature Card
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
                        <TableHead>Title</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="w-[80px]">Icon</TableHead>
                        <TableHead className="w-[100px]">Order</TableHead>
                        <TableHead className="text-right w-[150px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cards.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4">
                            No feature cards added yet. Add your first feature card above.
                          </TableCell>
                        </TableRow>
                      ) : (
                        cards.map((card, index) => (
                          <TableRow key={card.id}>
                            <TableCell>
                              <div className="h-16 w-16 rounded overflow-hidden bg-gray-100">
                                <img
                                  src={card.imageUrl}
                                  alt={card.title}
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = "https://placehold.co/100x100?text=Image";
                                  }}
                                />
                              </div>
                            </TableCell>
                            
                            {editMode === card.id ? (
                              <>
                                <TableCell>
                                  <Input 
                                    value={editTitle} 
                                    onChange={(e) => setEditTitle(e.target.value)} 
                                    className="w-full"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Textarea 
                                    value={editDescription} 
                                    onChange={(e) => setEditDescription(e.target.value)} 
                                    className="w-full"
                                    rows={2}
                                  />
                                </TableCell>
                                <TableCell>
                                  {/* Icon field removed */}
                                </TableCell>
                                <TableCell>
                                  <Input 
                                    value={editImageUrl} 
                                    onChange={(e) => setEditImageUrl(e.target.value)} 
                                    className="w-full"
                                    placeholder="Image URL"
                                  />
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end space-x-1">
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() => saveEdit(card.id)}
                                      className="text-green-600 border-green-600"
                                    >
                                      <Check className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={cancelEdit}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </>
                            ) : (
                              <>
                                <TableCell>{card.title}</TableCell>
                                <TableCell className="max-w-[200px] truncate">{card.description}</TableCell>
                                <TableCell>
                                  {/* Icon removed */}
                                </TableCell>
                                <TableCell>{card.order}</TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end space-x-1">
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() => handleReorderCard(card.id, 'up')}
                                      disabled={index === 0}
                                    >
                                      <MoveUp className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() => handleReorderCard(card.id, 'down')}
                                      disabled={index === cards.length - 1}
                                    >
                                      <MoveDown className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() => startEdit(card)}
                                      className="text-blue-600"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      size="icon"
                                      onClick={() => handleDeleteCard(card.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </>
                            )}
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
        
        <div className="mt-6 bg-gray-50 p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Preview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card) => (
              <div key={card.id} className="relative group overflow-hidden rounded-xl border-2 border-green-100 shadow-md hover:shadow-xl transition-all duration-300 h-60">
                <div className="absolute inset-0 bg-cover bg-center" 
                  style={{ backgroundImage: `url(${card.imageUrl})` }}>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-green-900 via-green-900/70 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
                <div className="absolute inset-0 flex flex-col items-center justify-end p-4 text-center">
                  {/* Icon removed */}
                  <h3 className="text-lg font-bold text-white mb-1 drop-shadow-md">{card.title}</h3>
                  <p className="text-green-50 text-xs mb-3 max-w-[85%] leading-snug drop-shadow-md">{card.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
