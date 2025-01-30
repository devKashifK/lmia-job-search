export default function SeeItAction() {
  return (
    <section id="demo" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 animate__animated animate__fadeInUp">
            See It In Action
          </h2>
          <p className="text-xl text-gray-600 animate__animated animate__fadeInUp animate__delay-1s">
            Watch how our platform transforms your search experience
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="bg-gray-100 rounded-xl p-4 shadow-lg animate__animated animate__fadeInLeft">
            <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg flex items-center justify-center">
              <div className="text-center p-8">
                <svg
                  className="w-20 h-20 mx-auto text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    strokeWidth="2"
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    strokeWidth="2"
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="mt-4 text-gray-600">Interactive Demo Video</p>
              </div>
            </div>
          </div>

          <div className="space-y-8 animate__animated animate__fadeInRight">
            <div className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-orange-500">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-orange-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Dynamic Search
                  </h3>
                  <p className="mt-2 text-gray-600">
                    Watch real-time search results as you type with instant
                    filtering
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-orange-500">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-orange-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      strokeWidth="2"
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Interactive Charts
                  </h3>
                  <p className="mt-2 text-gray-600">
                    Visualize data trends with real-time statistical analysis
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-orange-500">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-orange-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      strokeWidth="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Premium Access
                  </h3>
                  <p className="mt-2 text-gray-600">
                    See how easily you can unlock premium content with credits
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <button className="bg-orange-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-orange-700 transition-colors animate__animated animate__fadeInUp">
            Try It Now
          </button>
        </div>
      </div>
    </section>
  );
}
