import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Hero() {
  return (
    <section className="pt-16 pb-24 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2 lg:pr-12 mb-12 lg:mb-0">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 mb-6">
              Build better websites with{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                Remix
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-8">
              Remix is a full stack web framework that lets you focus on the
              user interface and work back through web standards to deliver a
              fast, slick, and resilient user experience.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/docs">
                <Button className="px-6 py-3 h-auto bg-primary hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all">
                  Get Started
                </Button>
              </Link>
              <Link href="/docs">
                <Button variant="outline" className="px-6 py-3 h-auto bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 shadow-sm hover:shadow transition-all">
                  Read the Docs
                </Button>
              </Link>
            </div>
          </div>
          <div className="lg:w-1/2">
            {/* Code Editor Illustration */}
            <div className="relative rounded-xl overflow-hidden shadow-2xl">
              <div className="bg-gray-900 text-white px-4 py-2 flex items-center space-x-1 text-xs">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                <span className="ml-2">app/routes/index.jsx</span>
              </div>
              <div className="bg-gray-800 p-6 overflow-auto">
                <pre className="text-sm sm:text-base text-gray-100 font-mono">
                  <span className="text-purple-400">import</span> {"{json}"} <span className="text-purple-400">from</span>{" "}
                  <span className="text-green-400">"@remix-run/node"</span>;
<span className="text-purple-400">import</span> {"{useLoaderData}"} <span className="text-purple-400">from</span>{" "}
<span className="text-green-400">"@remix-run/react"</span>;

<span className="text-purple-400">export async function</span>{" "}
<span className="text-yellow-400">loader</span>() {"{"} 
  <span className="text-purple-400">return</span> json({"{"}
    message: <span className="text-green-400">"Hello from Remix!"</span>
  {"}"});
{"}"}

<span className="text-purple-400">export default function</span>{" "}
<span className="text-yellow-400">Index</span>() {"{"}
  <span className="text-purple-400">const</span> data = useLoaderData();
  
  <span className="text-purple-400">return</span> (
    <span className="text-blue-400">&lt;div&gt;</span>
      <span className="text-blue-400">&lt;h1&gt;</span>{"{"}data.message{"}"}<span className="text-blue-400">&lt;/h1&gt;</span>
    <span className="text-blue-400">&lt;/div&gt;</span>
  );
{"}"}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
