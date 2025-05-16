import MainLayout from "@/components/layouts/MainLayout";
import { Card, CardContent } from "@/components/ui/card";

export default function Docs() {
  return (
    <MainLayout>
      <div className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-6 text-center">
              Documentation
            </h1>
            <p className="text-xl text-gray-600 text-center mb-12">
              Learn how to build amazing web applications with Remix.
            </p>
            
            <Card>
              <CardContent className="p-6">
                <div className="prose prose-blue max-w-none">
                  <h2>Getting Started with Remix</h2>
                  <p>
                    Welcome to the Remix documentation! This page will give you an introduction to the core concepts of Remix.
                  </p>
                  
                  <h3>Installation</h3>
                  <pre className="bg-gray-800 text-white p-4 rounded-md overflow-auto">
                    <code>npx create-remix@latest</code>
                  </pre>
                  
                  <h3>Core Concepts</h3>
                  <ul>
                    <li>Server-side rendering</li>
                    <li>Nested routing</li>
                    <li>Error boundaries</li>
                    <li>Data loading</li>
                    <li>Form submissions</li>
                  </ul>
                  
                  <p>
                    Remix is designed to leverage web standards and use the full capabilities of modern browsers
                    along with the power of server rendering.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
