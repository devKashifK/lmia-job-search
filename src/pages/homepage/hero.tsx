import CustomLink from "@/app/CustomLink";

export default function Hero() {
  return (
    <section
      id="hero"
      className="bg-gradient-to-br from-orange-500 to-red-600 min-h-[70vh] pt-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between py-16">
          {/* Text Content */}
          <div className="md:w-1/2 text-white mb-10 md:mb-0">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Empowering Your Search Experience
            </h1>
            <p className="text-xl md:text-2xl mb-8">
              Advanced search, dynamic insights, and seamless monetization—all
              in one platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <CustomLink
                href="/search"
                className="bg-white text-orange-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
              >
                Get Started
              </CustomLink>
              <button className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-orange-600 transition-colors">
                Watch Demo
              </button>
            </div>
          </div>

          {/* Video/Animation Placeholder */}
          <div className="md:w-1/2">
            <div className="bg-white p-4 rounded-lg shadow-xl">
              <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg flex items-center justify-center">
                <div className="text-center p-8">
                  <svg
                    className="w-16 h-16 mx-auto text-orange-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <p className="mt-4 text-gray-600">Interactive Search Demo</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12">
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 text-white text-center">
            <h3 className="text-3xl font-bold mb-2">10K+</h3>
            <p>Active Users</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 text-white text-center">
            <h3 className="text-3xl font-bold mb-2">1M+</h3>
            <p>Searches Performed</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 text-white text-center">
            <h3 className="text-3xl font-bold mb-2">99%</h3>
            <p>Customer Satisfaction</p>
          </div>
        </div>
      </div>
    </section>
  );
}
