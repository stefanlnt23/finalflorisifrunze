import { useState, useEffect } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Blog() {
  const [searchQuery, setSearchQuery] = useState("");

  // Get blog posts
  const { data: blogData, isLoading } = useQuery({
    queryKey: ['/api/blog'],
    refetchOnWindowFocus: false,
  });

  // Filter blog posts based on search query
  const blogPosts = blogData?.blogPosts || [];
  const filteredPosts = searchQuery
    ? blogPosts.filter(post => 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : blogPosts;

return (
    <MainLayout>

      {/* Page Header */}
      <section className="bg-gradient-to-br from-green-50 to-green-100 py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Blogul Green Garden</h1>
            <p className="text-lg text-gray-700 mb-8">
              Află despre grădinărit, amenajare peisagistică și practici sustenabile pentru exterior.
            </p>
            <div className="relative max-w-xl mx-auto">
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <Input
                type="text"
                placeholder="Search articles..."
                className="pl-10 pr-4 py-3 rounded-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Blog Content */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">

            {/* Featured Post (first post) */}
            {!isLoading && filteredPosts.length > 0 && (
              <div className="mb-16">
                <Card className="overflow-hidden shadow-lg">
                  <div className="grid md:grid-cols-2">
                    <div className="aspect-video md:aspect-auto bg-gray-100 flex items-center justify-center">
                      {filteredPosts[0].imageUrl ? (
                        <img 
                          src={filteredPosts[0].imageUrl} 
                          alt={filteredPosts[0].title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-green-600 text-6xl">
                          <i className="fas fa-image"></i>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-8 flex flex-col justify-center">
                      <div className="text-green-600 text-sm font-semibold mb-2">
                        {new Date(filteredPosts[0].publishedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                      <h2 className="text-2xl font-bold mb-3">{filteredPosts[0].title}</h2>
                      <p className="text-gray-600 mb-4">{filteredPosts[0].excerpt}</p>
                      <div>
                        <Link href={`/blog/${filteredPosts[0].id}`}>
                        <Button 
                          variant="outline"
                          className="border-green-600 text-green-600 hover:bg-green-50"
                        >
                          Read Article
                        </Button>
                      </Link>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </div>
            )}

            {/* Blog Post Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array(6).fill(0).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <div className="aspect-video bg-gray-100 animate-pulse"></div>
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                        <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-100 rounded animate-pulse"></div>
                          <div className="h-4 bg-gray-100 rounded animate-pulse"></div>
                          <div className="h-4 bg-gray-100 rounded w-2/3 animate-pulse"></div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="px-6 py-4 bg-gray-50">
                      <div className="h-9 bg-gray-200 rounded w-28 animate-pulse"></div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : filteredPosts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {/* Skip the first post if it was displayed as featured */}
                  {filteredPosts.slice(1).map((post) => (
                    <Card key={post.id} className="overflow-hidden h-full flex flex-col">
                      <div className="aspect-video bg-gray-100 flex items-center justify-center">
                        {post.imageUrl ? (
                          <img 
                            src={post.imageUrl} 
                            alt={post.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-green-600 text-4xl">
                            <i className="fas fa-image"></i>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-6 flex-grow">
                        <div className="text-green-600 text-sm font-semibold mb-2">
                          {new Date(post.publishedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                        <h3 className="text-lg font-bold mb-2">{post.title}</h3>
                        <p className="text-gray-600 text-sm mb-4">{post.excerpt}</p>
                      </CardContent>
                      <CardFooter className="px-6 py-4 bg-gray-50">
                        <Link href={`/blog/${post.id}`}>
                          <Button 
                            variant="outline"
                            className="text-sm border-green-600 text-green-600 hover:bg-green-50"
                          >
                            Read More
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {blogPosts.length > 6 && (
                  <div className="flex justify-center mt-12">
                    <nav className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" className="w-9 h-9 p-0">
                        <i className="fas fa-chevron-left"></i>
                      </Button>
                      <Button variant="outline" size="sm" className="w-9 h-9 p-0 bg-green-50 text-green-600 border-green-600">
                        1
                      </Button>
                      <Button variant="outline" size="sm" className="w-9 h-9 p-0">
                        2
                      </Button>
                      <Button variant="outline" size="sm" className="w-9 h-9 p-0">
                        3
                      </Button>
                      <Button variant="outline" size="sm" className="w-9 h-9 p-0">
                        <i className="fas fa-chevron-right"></i>
                      </Button>
                    </nav>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                {searchQuery ? (
                  <div>
                    <i className="fas fa-search text-6xl mb-4 text-gray-300"></i>
                    <h3 className="text-xl font-semibold mb-2">No results found</h3>
                    <p className="text-gray-600 mb-6">
                      No blog posts matching "{searchQuery}" were found.
                    </p>
                    <Button onClick={() => setSearchQuery("")}>
                      Clear Search
                    </Button>
                  </div>
                ) : (
                  <div>
                    <i className="fas fa-file-alt text-6xl mb-4 text-gray-300"></i>
                    <h3 className="text-xl font-semibold mb-2">No blog posts yet</h3>
                    <p className="text-gray-600">
                      Check back soon for new content.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-green-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Dorești Sfaturi Expert pentru Grădinărit?</h2>
            <p className="text-lg text-gray-700 mb-8">
              Obține sfaturi personalizate pentru grădinărit și soluții de amenajare peisagistică pentru spațiul tău exterior. Echipa noastră de profesioniști cu experiență este gata să te ajute.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href="/contact">
                <Button className="bg-green-600 hover:bg-green-700 text-lg px-8">
                  Contactează-ne Astăzi
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50 text-lg px-8">
                  Explorează Serviciile
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-16 pb-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-300 rounded-md flex items-center justify-center">
                  <i className="fas fa-leaf text-white text-lg"></i>
                </div>
                <span className="text-xl font-bold text-white">
                  Green Garden
                </span>
              </div>
              <p className="text-gray-400 mb-6">
                Transforming outdoor spaces into beautiful, sustainable gardens since 2010.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <i className="fab fa-instagram"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <i className="fab fa-pinterest-p"></i>
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-gray-400 hover:text-white transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-6">Services</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Garden Maintenance
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Landscaping
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Planting & Pruning
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Irrigation Systems
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-6">Contact Us</h3>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-start">
                  <i className="fas fa-map-marker-alt mt-1 mr-3 text-green-400"></i>
                  <span>123 Garden Street, Greenville, 12345</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-phone-alt mt-1 mr-3 text-green-400"></i>
                  <span>(123) 456-7890</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-envelope mt-1 mr-3 text-green-400"></i>
                  <span>info@greengarden.com</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-clock mt-1 mr-3 text-green-400"></i>
                  <span>Mon-Fri: 8am - 6pm<br />Sat: 9am - 4pm</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; {new Date().getFullYear()} Green Garden Services. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </MainLayout>
  );
}