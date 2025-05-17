import MainLayout from "@/components/layouts/MainLayout";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// Related Posts Component
function RelatedPosts({ currentBlogId }: { currentBlogId: string }) {
  const { data: allBlogsData } = useQuery({
    queryKey: ['/api/blog'],
    refetchOnWindowFocus: false,
  });

  const allPosts = allBlogsData?.blogPosts || [];

  // Filter out the current post and get up to 2 related posts
  const relatedPosts = allPosts
    .filter(post => post.id !== currentBlogId)
    .slice(0, 2);

  if (relatedPosts.length === 0) {
    return (
      <div className="text-center p-6 bg-gray-50 rounded-lg">
        <p className="text-gray-500">Nu există articole similare disponibile.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {relatedPosts.map((post) => (
        <Card key={post.id} className="overflow-hidden shadow-md hover:shadow-lg transition-shadow">
          <div className="aspect-video bg-gray-100 relative overflow-hidden">
            <img 
              src={post.imageUrl || "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"} 
              alt={post.title} 
              className="w-full h-full object-cover transition-transform hover:scale-105"
            />
          </div>
          <CardContent className="p-4">
            <h4 className="font-bold text-lg mb-2">{post.title}</h4>
            <p className="text-gray-600 text-sm mb-3">{post.excerpt}</p>
            <Link href={`/blog/${post.id}`}>
              <Button variant="outline" className="text-sm border-green-600 text-green-600 hover:bg-green-50">
                Citește Articolul
              </Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

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
            <h1 className="text-3xl font-bold text-red-700 mb-4">ID-ul articolului de blog este invalid</h1>
            <p className="text-lg text-red-600 mb-6">ID-ul articolului de blog furnizat nu este valid.</p>
            <Link href="/blog" state={{ from: 'blogDetail' }}>
              <Button className="bg-green-600 hover:bg-green-700">Vezi toate articolele de blog</Button>
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
            <h1 className="text-3xl font-bold text-red-700 mb-4">Articolul de blog nu a fost găsit</h1>
            <p className="text-lg text-red-600 mb-6">Articolul de blog pe care îl căutați nu a putut fi găsit sau a fost eliminat.</p>
            <Link href="/blog" state={{ from: 'blogDetail' }}>
              <Button className="bg-green-600 hover:bg-green-700">Vezi toate articolele de blog</Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Format the published date
  const publishDate = new Date(blogPost.publishedAt);
  const formattedDate = publishDate.toLocaleDateString('ro-RO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Function to render blog sections
  const renderBlogContent = () => {
    // If we have sections, render them
    if (blogPost.sections && blogPost.sections.length > 0) {
      return (
        <div className="space-y-6">
          {blogPost.sections.map((section, index) => {
            switch(section.type) {
              case "text":
                return (
                  <div 
                    key={index} 
                    className="text-gray-700 leading-relaxed" 
                    style={{ textAlign: section.alignment || 'left' }}
                    dangerouslySetInnerHTML={{ __html: section.content.replace(/\n/g, '<br>') }}
                  />
                );
              case "image":
                return (
                  <figure key={index} className="my-8">
                    <img 
                      src={section.imageUrl} 
                      alt={section.caption || ''} 
                      className="w-full h-auto rounded-lg shadow-md mb-2"
                      style={{ 
                        maxWidth: '100%', 
                        margin: section.alignment === 'center' ? '0 auto' : 
                                section.alignment === 'right' ? '0 0 0 auto' : '0' 
                      }} 
                    />
                    {section.caption && (
                      <figcaption className="text-sm text-gray-500 text-center italic">
                        {section.caption}
                      </figcaption>
                    )}
                  </figure>
                );
              case "quote":
                return (
                  <blockquote key={index} className="border-l-4 border-green-600 pl-4 py-2 italic my-8 text-gray-700">
                    <p>{section.content}</p>
                    {section.caption && (
                      <footer className="text-sm mt-2 text-gray-500 not-italic">
                        — {section.caption}
                      </footer>
                    )}
                  </blockquote>
                );
              case "heading":
                const HeadingTag = `h${section.level || 2}` as keyof JSX.IntrinsicElements;
                return (
                  <HeadingTag 
                    key={index} 
                    className={`font-bold text-gray-900 my-4 ${
                      section.level === 2 ? 'text-2xl' : 
                      section.level === 3 ? 'text-xl' : 
                      'text-lg'
                    }`}
                  >
                    {section.content}
                  </HeadingTag>
                );
              case "list":
                return (
                  <ul key={index} className="list-disc pl-6 space-y-2 my-6">
                    {section.items?.map((item, itemIndex) => (
                      <li key={itemIndex} className="text-gray-700">{item}</li>
                    ))}
                  </ul>
                );
              default:
                return null;
            }
          })}
        </div>
      );
    }

    // Fallback to regular content
    return (
      <div className="prose prose-green max-w-none">
        <p className="text-lg text-gray-600 mb-6 font-medium">
          {blogPost.excerpt}
        </p>
        <div dangerouslySetInnerHTML={{ __html: blogPost.content }} />
      </div>
    );
  };

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
              <div className="text-gray-600 mb-6 flex items-center">
                <span className="inline-flex items-center">
                  <i className="fas fa-calendar-alt mr-2"></i> {formattedDate}
                </span>
                {blogPost.tags && blogPost.tags.length > 0 && (
                  <div className="ml-6 flex flex-wrap gap-2">
                    {blogPost.tags.map((tag, index) => (
                      <span key={index} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
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
              {/* Excerpt as introduction */}
              <p className="text-lg text-gray-600 mb-8 font-medium italic border-l-4 border-green-600 pl-4 py-2">
                {blogPost.excerpt}
              </p>
            </header>

            {/* Blog Content */}
            <div className="mb-12">
              {renderBlogContent()}
            </div>

            {/* Author Section */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 mb-8">
              <div className="flex items-center">
                <div className="w-14 h-14 bg-green-600 rounded-full flex items-center justify-center text-white text-xl font-bold mr-4">
                  <i className="fas fa-user"></i>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Echipa Flori si Frunze</h3>
                  <p className="text-gray-600">Experți în grădinărit și amenajare peisagistică cu ani de experiență în crearea de spații exterioare frumoase.</p>
                </div>
              </div>
            </div>

            {/* Tags Section */}
            {blogPost.tags && blogPost.tags.length > 0 && (
              <div className="border-t border-b border-gray-200 py-4 mb-8">
                <div className="flex items-center">
                  <span className="text-gray-700 font-medium mr-3">Etichete:</span>
                  <div className="flex flex-wrap gap-2">
                    {blogPost.tags.map((tag, index) => (
                      <span key={index} className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Related Posts Section */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Articole similare</h3>

              {/* Fetch all blog posts to find related ones */}
              <RelatedPosts currentBlogId={blogId} />
            </div>

            {/* Call to Action */}
            <div className="bg-green-50 p-8 rounded-lg border border-green-100 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Aveți nevoie de ajutor cu grădina dvs.?</h3>
              <p className="text-gray-600 mb-4">
                Echipa noastră de experți este gata să vă ajute cu toate nevoile dvs. de grădinărit. Contactați-ne astăzi pentru a programa o consultație.
              </p>
              <div className="flex space-x-4">
                <Link href="/contact">
                  <Button className="bg-green-600 hover:bg-green-700">
                    Contactați-ne
                  </Button>
                </Link>
                <Link href="/services">
                  <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                    Vizualizați serviciile noastre
                  </Button>
                </Link>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <Link href="/blog" state={{ from: 'blogDetail' }}>
                <Button variant="outline" className="flex items-center space-x-2">
                  <i className="fas fa-arrow-left"></i>
                  <span>Înapoi la blog</span>
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