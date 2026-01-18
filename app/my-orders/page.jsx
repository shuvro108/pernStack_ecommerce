"use client";

export const dynamic = "force-dynamic";

import React, { useEffect, useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { useAuth } from "@clerk/nextjs";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Loading from "@/components/Loading";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const MyOrders = () => {
  const { getToken } = useAuth();
  const router = useRouter();
  const { currency, user } = useAppContext();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [showProductList, setShowProductList] = useState(false);
  const [selectedOrderProducts, setSelectedOrderProducts] = useState([]);

  const fetchOrders = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/order/list", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setOrders(data.orders || []);
      } else {
        toast.error(
          "Failed to fetch orders: " + (data.message || "Unknown error"),
        );
        setOrders([]);
      }
    } catch (error) {
      toast.error("Error fetching orders: " + error.message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewClick = (order) => {
    if (!order.items || order.items.length === 0) {
      toast.error("No products in this order");
      return;
    }

    if (order.items.length === 1) {
      router.push(`/product/${order.items[0].productId}?review=1`);
      return;
    }

    setSelectedOrderProducts(order.items);
    setShowProductList(true);
  };

  const handleProductSelect = (productId) => {
    router.push(`/product/${productId}?review=1`);
    setShowProductList(false);
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
      const interval = setInterval(() => fetchOrders(), 30000);
      setRefreshInterval(interval);
      return () => clearInterval(interval);
    }
  }, [user, getToken]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Navbar />

      {/* Product Selection Modal */}
      {showProductList && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity"
          onClick={() => setShowProductList(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Select Product to Review
                </h2>
                <p className="text-sm text-gray-500 mt-2">
                  Choose which product you'd like to review
                </p>
              </div>
              <button
                onClick={() => setShowProductList(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-all duration-200 flex-shrink-0"
              >
                <svg
                  className="w-6 h-6"
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
            </div>

            <div className="space-y-3">
              {selectedOrderProducts.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleProductSelect(item.productId)}
                  className="w-full text-left p-4 rounded-2xl border-2 border-gray-100 hover:border-emerald-400 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-transparent transition-all duration-300 group active:scale-95"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center flex-shrink-0 group-hover:from-emerald-200 group-hover:to-emerald-100 transition-all duration-300 group-hover:shadow-md">
                      <svg
                        className="w-7 h-7 text-emerald-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 4v16a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2H7z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate group-hover:text-emerald-700 transition-colors">
                        {item.product?.name || `Product ${index + 1}`}
                      </p>
                      <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                        {item.product?.description?.substring(0, 80) ||
                          "No description"}
                        {item.product?.description?.length > 80 ? "..." : ""}
                      </p>
                      <div className="flex items-center mt-3 text-emerald-600 font-medium text-xs group-hover:text-emerald-700 transition-colors">
                        <span>Click to review</span>
                        <svg
                          className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16 space-y-8 flex-1 w-full">
        {/* Hero Section */}
        <section className="rounded-3xl border-2 border-emerald-200/50 bg-gradient-to-br from-white via-emerald-50/30 to-white shadow-lg p-8 md:p-12 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-8 bg-gradient-to-b from-emerald-600 to-emerald-400 rounded-full"></div>
              <p className="text-sm font-bold text-emerald-700 uppercase tracking-widest">
                Account Management
              </p>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              My Orders
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed max-w-2xl">
              Track your purchases, view delivery status, and share your
              experience with our products through reviews.
            </p>
          </div>
        </section>

        {/* Orders Section */}
        {loading ? (
          <Loading />
        ) : orders.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-gray-300 bg-white/60 backdrop-blur-sm p-12 md:p-16 text-center shadow-sm">
            <svg
              className="w-16 h-16 text-gray-300 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <p className="text-gray-700 mb-2 text-lg font-bold">
              No orders yet
            </p>
            <p className="text-gray-500 mb-6">
              Start shopping to see your orders here
            </p>
            <a
              href="/all-products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-600 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-300 font-semibold"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
              </svg>
              Start Shopping
            </a>
          </div>
        ) : (
          <section className="space-y-5">
            {/* Manual Refresh Button */}
            <div className="flex justify-end">
              <button
                onClick={async () => {
                  setLoading(true);
                  await fetchOrders();
                }}
                className="px-4 py-2 rounded-xl bg-white border-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition-all duration-300 flex items-center gap-2 text-sm font-semibold shadow-sm hover:shadow-md hover:border-emerald-300"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Refresh
              </button>
            </div>

            {/* Orders List */}
            {orders.map((order, index) => (
              <div
                key={index}
                className="rounded-2xl border-2 border-gray-200 bg-white shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-0">
                  {/* Product Info */}
                  <div className="p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-gray-200 bg-gradient-to-br from-white to-gray-50">
                    <p className="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-4">
                      📦 Products
                    </p>
                    <div className="flex gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <svg
                          className="w-7 h-7 text-emerald-600"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-lg">
                          {order.items.length}
                        </p>
                        <p className="text-xs text-gray-600">
                          item{order.items.length > 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div className="p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-gray-200">
                    <p className="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-4">
                      📍 Delivery
                    </p>
                    <div className="space-y-1 text-sm">
                      <p className="font-bold text-gray-900">
                        {order.address.fullName}
                      </p>
                      <p className="text-gray-600 text-xs">
                        {order.address.area}
                      </p>
                      <p className="text-gray-600 text-xs">
                        {order.address.city}, {order.address.state}
                      </p>
                      <p className="text-emerald-600 font-semibold text-xs mt-2">
                        {order.address.phoneNumber}
                      </p>
                    </div>
                  </div>

                  {/* Order Amount */}
                  <div className="p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-gray-200 bg-gradient-to-br from-white to-emerald-50/20">
                    <p className="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-4">
                      💰 Total
                    </p>
                    <div className="space-y-1">
                      <p className="text-3xl font-bold text-emerald-600">
                        {currency}
                        {order.displayAmount ?? order.amount}
                      </p>
                      {order.promoCode && order.discountAmount > 0 && (
                        <p className="text-xs text-emerald-600 font-semibold">
                          ✓ Promo: {order.promoCode}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">💳 COD</p>
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-gray-200">
                    <p className="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-4">
                      📋 Details
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date:</span>
                        <span className="font-semibold text-gray-900">
                          {new Date(Number(order.date)).toLocaleDateString(
                            "en-US",
                            { year: "numeric", month: "short", day: "numeric" },
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Status:</span>
                        <span
                          className={`inline-block px-3 py-1 rounded-full font-bold text-xs ${
                            order.status === "Order Placed"
                              ? "bg-blue-100 text-blue-700"
                              : order.status === "Processing"
                                ? "bg-yellow-100 text-yellow-700"
                                : order.status === "Shipped"
                                  ? "bg-purple-100 text-purple-700"
                                  : order.status === "Out for Delivery"
                                    ? "bg-orange-100 text-orange-700"
                                    : order.status === "Delivered"
                                      ? "bg-emerald-100 text-emerald-700"
                                      : order.status === "Cancelled"
                                        ? "bg-red-100 text-red-700"
                                        : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {order.status || "Unknown"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="p-6 lg:p-8 flex flex-col justify-center">
                    {order.status === "Delivered" ? (
                      <button
                        onClick={() => handleReviewClick(order)}
                        className="w-full px-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-600 transition-all duration-300 font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:shadow-emerald-300 active:scale-95"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        Review
                      </button>
                    ) : (
                      <div className="text-center">
                        <p className="text-xs text-gray-500 font-medium">
                          Available after delivery
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default MyOrders;
