import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function CallToAction() {
  return (
    <section className="py-16 bg-gradient-to-r from-primary to-secondary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to get started with Remix?</h2>
          <p className="text-xl text-white opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of developers already building faster, more resilient web applications.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/docs">
              <Button className="px-6 py-3 h-auto bg-white text-primary hover:bg-gray-100 shadow-md hover:shadow-lg transition-all">
                Get Started Now
              </Button>
            </Link>
            <Link href="/docs">
              <Button variant="outline" className="px-6 py-3 h-auto bg-transparent text-white border border-white hover:bg-white/10 transition-all">
                Read the Documentation
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
