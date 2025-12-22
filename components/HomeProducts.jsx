import React from "react";
import ProductCard from "./ProductCard";
import { useAppContext } from "@/context/AppContext";

const HomeProducts = () => {
  const { products, router } = useAppContext();

  return (
    <div className="flex flex-col items-center py-16 md:py-20">
      {/* Section Header */}
      <div className="w-full mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Popular Products
        </h2>
        <p className="text-gray-600">
          Discover our most loved handcrafted items
        </p>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 md:gap-8 w-full mb-12">
        {products.map((product, index) => (
          <ProductCard key={index} product={product} />
        ))}
      </div>

      {/* View More Button */}
      <button
        onClick={() => {
          router.push("/all-products");
        }}
        className="btn btn-outline px-8 py-3 hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
      >
        <span>View All Products</span>
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
    </div>
  );
};

export default HomeProducts;
