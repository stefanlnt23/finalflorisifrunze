import { Button } from "@/components/ui/button";

export default function ErrorHandling() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Built-in Error Handling</h2>
            <p className="text-lg text-gray-600 mb-6">
              Remix includes powerful error handling capabilities that help you create robust applications. Catch and display errors at any level of your application hierarchy.
            </p>
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-1 mr-3">
                  <i className="fas fa-check text-green-600 text-xs"></i>
                </div>
                <p className="text-gray-600">Route-level error boundaries</p>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-1 mr-3">
                  <i className="fas fa-check text-green-600 text-xs"></i>
                </div>
                <p className="text-gray-600">Automatic status code handling</p>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-1 mr-3">
                  <i className="fas fa-check text-green-600 text-xs"></i>
                </div>
                <p className="text-gray-600">Custom error pages that maintain your site's look and feel</p>
              </li>
            </ul>
          </div>
          <div className="lg:w-1/2">
            <div className="bg-red-50 border border-red-100 rounded-xl p-8">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center mr-4">
                  <i className="fas fa-exclamation-triangle text-red-500"></i>
                </div>
                <h3 className="text-xl font-bold text-red-700">Error Boundary Example</h3>
              </div>
              <div className="bg-white p-6 rounded-lg border border-red-200 mb-4">
                <p className="text-red-600 font-mono text-sm mb-2">Error: Failed to fetch data</p>
                <p className="text-gray-600 text-sm">The server encountered an error while trying to process your request. Don't worry, we've been notified and are working on a fix.</p>
              </div>
              <div className="flex justify-end">
                <Button className="bg-red-600 hover:bg-red-700 text-white">
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
