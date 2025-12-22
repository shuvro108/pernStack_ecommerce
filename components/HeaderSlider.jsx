import React from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";

const HeaderSlider = () => {
  const { router } = useAppContext();

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-6 py-8">
      <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20 bg-gradient-to-br from-white to-emerald-50 rounded-2xl p-8 sm:p-12 lg:p-16 shadow-sm border border-emerald-100">
        {/* Content Section */}
        <div className="flex-1 space-y-5 lg:space-y-5 text-center lg:text-left max-w-2xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-900 text-sm font-semibold px-4 py-2 rounded-full">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span>Authentic Handcrafted Products</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
            Handcrafted Excellence for Your Home
          </h1>

          {/* Description */}
          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
            Discover unique artisan handicrafts that bring authentic
            craftsmanship and traditional elegance to your space.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
            <button
              onClick={() => router.push("/all-products")}
              className="btn btn-primary w-full sm:w-auto px-6 py-3 shadow-emerald-600/20 hover:shadow-emerald-600/30 hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Shop Collection</span>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </button>

            <button
              onClick={() => router.push("/about")}
              className="btn btn-outline w-full sm:w-auto px-6 py-3 hover:-translate-y-0.5 active:translate-y-0"
            >
              Learn More
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="flex items-center gap-5 pt-6 text-sm text-gray-600 justify-center lg:justify-start flex-wrap">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-medium">Free Shipping</span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-medium">100% Authentic</span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-medium">Secure Payment</span>
            </div>
          </div>
        </div>

        {/* Image Section */}
        <div className="flex-1 relative w-full lg:w-auto hover-image-zoom">
          <div className="relative">
            {/* Subtle Background Decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-100/50 to-transparent rounded-2xl -z-10 scale-110"></div>

            <Image
              className="w-full max-w-md lg:max-w-xl xl:max-w-2xl h-auto object-contain mx-auto drop-shadow-2xl"
              src={assets.hero_model_img}
              alt="Handcrafted Artisan Handicrafts"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderSlider;
