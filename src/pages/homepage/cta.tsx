export default function CTA() {
  return (
    <section
      id="cta"
      className="py-20 bg-gradient-to-br from-orange-500 to-red-600"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-6 animate__animated animate__fadeInUp">
            Ready to Transform Your Search Experience?
          </h2>
          <p className="text-xl text-white/90 mb-8 animate__animated animate__fadeInUp animate__delay-1s">
            Get started today with 5 free credits! Unlock premium insights and
            elevate your data analysis.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate__animated animate__fadeInUp animate__delay-2s">
            <button className="bg-white text-orange-600 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1 duration-200 w-full sm:w-auto">
              Get Started Free
            </button>
            <button className="bg-orange-600 text-white px-8 py-4 rounded-full font-semibold hover:bg-orange-700 transition-colors border-2 border-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 duration-200 w-full sm:w-auto">
              Purchase Credits
            </button>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-white">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 animate__animated animate__fadeInUp">
              <div className="text-3xl font-bold mb-2">5</div>
              <div className="text-white/90">Free Credits</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 animate__animated animate__fadeInUp animate__delay-1s">
              <div className="text-3xl font-bold mb-2">Instant</div>
              <div className="text-white/90">Access</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 animate__animated animate__fadeInUp animate__delay-2s">
              <div className="text-3xl font-bold mb-2">24/7</div>
              <div className="text-white/90">Support</div>
            </div>
          </div>

          <div className="mt-12 text-white/90 text-sm animate__animated animate__fadeInUp animate__delay-3s">
            <p>
              No credit card required for free credits. Start searching now!
            </p>
          </div>
        </div>
      </div>

      {/* <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
        <svg
          className="relative block w-full h-16"
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
            fill="#ffffff"
          ></path>
        </svg>
      </div> */}
    </section>
  );
}
