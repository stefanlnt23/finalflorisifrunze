import MainLayout from "@/components/layouts/MainLayout";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function BlogDetail() {
  const { id } = useParams();
  const blogId = id;

  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/blog', blogId],
    queryFn: async () => {
      const response = await fetch(`/api/blog/${blogId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch blog post');
      }
      return response.json();
    },
    enabled: !!blogId,
    refetchOnWindowFocus: false
  });

  const blogPost = data?.blogPost;

  if (!blogId) {
    return (
      <MainLayout>
        <div className="py-16 bg-red-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl font-bold text-red-700 mb-4">Invalid Blog Post ID</h1>
            <p className="text-lg text-red-600 mb-6">The blog post ID provided is not valid.</p>
            <Link href="/blog">
              <Button className="bg-green-600 hover:bg-green-700">View All Blog Posts</Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="animate-pulse">
                <div className="h-10 bg-gray-200 rounded w-3/4 mb-6"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
                <div className="h-64 bg-gray-200 rounded mb-6"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !blogPost) {
    return (
      <MainLayout>
        <div className="py-16 bg-red-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl font-bold text-red-700 mb-4">Blog Post Not Found</h1>
            <p className="text-lg text-red-600 mb-6">The blog post you're looking for could not be found or may have been removed.</p>
            <Link href="/blog">
              <Button className="bg-green-600 hover:bg-green-700">View All Blog Posts</Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Format the published date
  const publishDate = new Date(blogPost.publishedAt);
  const formattedDate = publishDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <MainLayout>
      <article className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Blog Header */}
            <header className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {blogPost.title}
              </h1>
              <div className="text-gray-600 mb-6">
                <span>
                  <i className="fas fa-calendar-alt mr-2"></i> {formattedDate}
                </span>
              </div>
              {blogPost.imageUrl && (
                <div className="rounded-lg overflow-hidden shadow-lg mb-8">
                  <img 
                    src={blogPost.imageUrl} 
                    alt={blogPost.title} 
                    className="w-full h-auto"
                  />
                </div>
              )}
            </header>

            {/* Blog Content */}
            <div className="prose prose-green max-w-none mb-12">
              <p className="text-lg text-gray-600 mb-6 font-medium">
                {blogPost.excerpt}
              </p>
              <div dangerouslySetInnerHTML={{ __html: blogPost.content }} />
            </div>

            {/* Tags and Categories */}
            <div className="border-t border-b border-gray-200 py-4 mb-8">
              <div className="flex flex-wrap gap-2">
                <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                  Gardening Tips
                </span>
                <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                  Lawn Care
                </span>
                <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                  Plants
                </span>
              </div>
            </div>

            {/* Call to Action */}
            <div className="bg-green-50 p-8 rounded-lg border border-green-100 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Need help with your garden?</h3>
              <p className="text-gray-600 mb-4">
                Our expert team is ready to assist you with all your gardening needs. Contact us today to schedule a consultation.
              </p>
              <div className="flex space-x-4">
                <Link href="/contact">
                  <Button className="bg-green-600 hover:bg-green-700">
                    Contact Us
                  </Button>
                </Link>
                <Link href="/services">
                  <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                    View Our Services
                  </Button>
                </Link>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <Link href="/blog">
                <Button variant="outline" className="flex items-center space-x-2">
                  <i className="fas fa-arrow-left"></i>
                  <span>Back to Blog</span>
                </Button>
              </Link>
              <div className="flex space-x-4">
                <Button variant="ghost" className="text-gray-600 hover:text-green-600">
                  <i className="fab fa-facebook text-lg"></i>
                </Button>
                <Button variant="ghost" className="text-gray-600 hover:text-green-600">
                  <i className="fab fa-twitter text-lg"></i>
                </Button>
                <Button variant="ghost" className="text-gray-600 hover:text-green-600">
                  <i className="fab fa-pinterest text-lg"></i>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </article>
    </MainLayout>
  );
}
