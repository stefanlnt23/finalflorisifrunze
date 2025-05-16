export default function Testimonial() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="mb-6">
            <i className="fas fa-quote-left text-4xl text-gray-300"></i>
          </div>
          <blockquote className="text-xl md:text-2xl text-gray-800 mb-8">
            "Remix has completely changed how we approach web development. Our applications are faster, more reliable, and our team is more productive than ever before."
          </blockquote>
          <div className="flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center mr-4">
              <i className="fas fa-user text-gray-600"></i>
            </div>
            <div className="text-left">
              <p className="font-bold text-gray-900">Jane Smith</p>
              <p className="text-gray-600">CTO, Example Company</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
