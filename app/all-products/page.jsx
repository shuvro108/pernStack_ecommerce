"use client";

export const dynamic = "force-dynamic";

import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAppContext } from "@/context/AppContext";
import { CATEGORIES } from "@/assets/productData";
import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Loading from "@/components/Loading";

const AllProducts = () => {
  const { products } = useAppContext();
  const params = useSearchParams();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Initialize search from URL param
  useEffect(() => {
    const q = params.get("q") || "";
    setSearchQuery(q);
  }, [params]);

  // Filter by category and search
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [products, selectedCategory, searchQuery]);

  const headingSuffix = searchQuery.trim()
    ? ` for "${searchQuery.trim()}"`
    : "";

  return (
    <>
      <Navbar />
      <div className="bg-gradient-to-b from-gray-50 to-white">
        <div className="px-6 md:px-16 lg:px-32 py-12 md:py-16">
          {/* Page Header */}
          <div className="mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
              All Products
              {headingSuffix && (
                <span className="text-emerald-800">{headingSuffix}</span>
              )}
            </h1>
            <p className="text-lg text-gray-600">
              Explore our complete collection of handcrafted items
            </p>
          </div>

          {/* Search Bar with Icon */}
          <div className="w-full mb-8">
            <div className="relative max-w-2xl">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
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
              </div>
              <input
                type="text"
                placeholder="Search products by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all text-gray-700 placeholder:text-gray-400"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    const sp = new URLSearchParams(params.toString());
                    sp.delete("q");
                    router.replace(
                      `/all-products${sp.toString() ? `?${sp.toString()}` : ""}`
                    );
                  }}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Category Filter */}
          <div className="w-full mb-10">
            <div className="flex items-center gap-3 mb-5">
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              <h2 className="text-xl font-semibold text-gray-900">
                Categories
              </h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  selectedCategory === "all"
                    ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30 scale-105"
                    : "bg-white text-gray-700 border-2 border-gray-200 hover:border-emerald-500 hover:bg-amber-50"
                }`}
              >
                All Products ({products.length})
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                    selectedCategory === cat.id
                      ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30 scale-105"
                      : "bg-white text-gray-700 border-2 border-gray-200 hover:border-emerald-500 hover:bg-amber-50"
                  }`}
                >
                  {cat.name} (
                  {products.filter((p) => p.category === cat.id).length})
                </button>
              ))}
            </div>
          </div>

          {/* Results Count */}
          {filteredProducts.length > 0 && (
            <div className="mb-6">
              <p className="text-gray-600 font-medium">
                Showing {filteredProducts.length}{" "}
                {filteredProducts.length === 1 ? "product" : "products"}
                {searchQuery && (
                  <span className="text-emerald-900"> for "{searchQuery}"</span>
                )}
              </p>
            </div>
          )}

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 md:gap-8 pb-8">
              {filteredProducts.map((product, index) => (
                <ProductCard key={index} product={product} />
              ))}
            </div>
          ) : (
            <div className="w-full py-20 text-center bg-white rounded-2xl border-2 border-dashed border-gray-200">
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-900 text-xl font-semibold mb-2">
                    No Products Found
                  </p>
                  <p className="text-gray-500 text-lg mb-6">
                    {searchQuery
                      ? `We couldn't find any products matching "${searchQuery}"`
                      : "No products available in this category"}
                  </p>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors duration-300"
                    >
                      Clear Search
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <AllProducts />
    </Suspense>
  );
}
