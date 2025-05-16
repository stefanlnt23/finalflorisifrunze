import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { BlogPost, User } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function AdminBlogPosts() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null);

  // Fetch blog posts
  const { data: blogData, isLoading, error } = useQuery({
    queryKey: ['/api/blog'],
    refetchOnWindowFocus: false,
  });

  // Fetch users for author names
  const { data: usersData } = useQuery({
    queryKey: ['/api/users'],
    refetchOnWindowFocus: false,
  });

  const blogPosts = blogData?.blogPosts || [];
  const users = usersData?.users || [];

  // Helper to get author name
  const getAuthorName = (authorId: number): string => {
    const author = users.find((u: User) => u.id === authorId);
    return author ? author.name : "Unknown Author";
  };

  // Delete blog post mutation
  const deleteBlogPostMutation = useMutation({
    mutationFn: async (postId: string | number) => {
      console.log(`Deleting blog post with ID: ${postId}`);
      return await apiRequest("DELETE", `/api/admin/blog/${postId}`);
    },
    onSuccess: () => {
      toast({
        title: "Blog Post Deleted",
        description: "The blog post has been successfully deleted",
      });
      // Invalidate blog queries to refresh the lists
      queryClient.invalidateQueries({ queryKey: ['/api/blog'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/blog'] });
      setDeleteDialogOpen(false);
    },
    onError: (error: any) => {
      console.error("Error deleting blog post:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete the blog post",
        variant: "destructive",
      });
    },
  });

  // Handle delete click
  const handleDeleteClick = (post: BlogPost) => {
    setPostToDelete(post);
    setDeleteDialogOpen(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = () => {
    if (postToDelete) {
      deleteBlogPostMutation.mutate(postToDelete.id);
    }
  };

  // Truncate text helper
  const truncateText = (text: string, maxLength: number): string => {
    return text.length > maxLength 
      ? `${text.substring(0, maxLength)}...` 
      : text;
  };

  return (
    <AdminLayout 
      title="Blog Posts" 
      description="Manage your blog content"
      action={
        <Link href="/admin/blog/new">
          <Button className="bg-green-600 hover:bg-green-700">
            <i className="fas fa-plus mr-2"></i> Add Post
          </Button>
        </Link>
      }
    >
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <i className="fas fa-spinner fa-spin text-3xl text-gray-400 mb-4"></i>
              <p className="text-gray-500">Loading blog posts...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <i className="fas fa-exclamation-circle text-3xl text-red-500 mb-4"></i>
              <p className="text-gray-500">Error loading blog posts</p>
            </div>
          ) : blogPosts.length === 0 ? (
            <div className="p-8 text-center">
              <i className="fas fa-newspaper text-5xl text-gray-300 mb-4"></i>
              <h3 className="text-lg font-medium text-gray-600 mb-2">No blog posts found</h3>
              <p className="text-gray-500 mb-6">Get started by adding your first blog post</p>
              <Link href="/admin/blog/new">
                <Button className="bg-green-600 hover:bg-green-700">
                  <i className="fas fa-plus mr-2"></i> Add Post
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Post</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Published Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blogPosts.map((post: BlogPost) => (
                    <TableRow key={post.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          {post.imageUrl ? (
                            <div className="h-12 w-12 rounded-md overflow-hidden">
                              <img 
                                src={post.imageUrl} 
                                alt={post.title} 
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="h-12 w-12 bg-blue-100 rounded-md flex items-center justify-center">
                              <i className="fas fa-newspaper text-blue-600"></i>
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{post.title}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {truncateText(post.excerpt, 60)}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getAuthorName(post.authorId)}</TableCell>
                      <TableCell>{format(new Date(post.publishedAt), "MMM d, yyyy")}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setLocation(`/admin/blog/${post.id}`)}
                          >
                            <i className="fas fa-edit text-blue-600"></i>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteClick(post)}
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
              This will permanently delete the blog post "{postToDelete?.title}". 
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
              disabled={deleteBlogPostMutation.isPending}
            >
              {deleteBlogPostMutation.isPending ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i> Deleting...
                </>
              ) : (
                "Delete Post"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}