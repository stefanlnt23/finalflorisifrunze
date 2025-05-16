import MainLayout from "@/components/layouts/MainLayout";
import FeaturesSection from "@/components/sections/FeaturesSection";
import CallToAction from "@/components/sections/CallToAction";

export default function Features() {
  return (
    <MainLayout>
      <div className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              Remix Features
            </h1>
            <p className="text-xl text-gray-600">
              Explore the powerful features that make Remix the perfect choice for modern web development.
            </p>
          </div>
        </div>
      </div>
      <FeaturesSection />
      <CallToAction />
    </MainLayout>
  );
}
