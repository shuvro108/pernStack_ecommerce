"use client";

export const dynamic = "force-dynamic";

import React, { useEffect, useState } from "react";
import { assets, orderDummyData } from "@/assets/assets";
import { useAppContext } from "@/context/AppContext";
import { useAuth } from "@clerk/nextjs";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Loading from "@/components/Loading";
import axios from "axios";
import toast from "react-hot-toast";

const MyOrders = () => {
  const { getToken } = useAuth();

  const { currency, user } = useAppContext();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(null);

  const fetchOrders = async () => {
    try {
      const token = await getToken();

      const { data } = await axios.get("/api/order/list", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("[My Orders] Fetched orders:", data);

      if (data.success) {
        console.log("[My Orders] Setting orders:", data.orders);
        setOrders(data.orders || []);
      } else {
        console.error("[My Orders] API error:", data.message);
        toast.error(
          "Failed to fetch orders: " + (data.message || "Unknown error")
        );
        setOrders([]);
      }
    } catch (error) {
      console.error("[My Orders] Fetch error:", error);
      toast.error("Error fetching orders: " + error.message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Setup auto-refresh for real-time order updates
  useEffect(() => {
    if (user) {
      console.log("[My Orders] User logged in, fetching orders...");
      fetchOrders();

      // Auto-refresh orders every 30 seconds to catch admin updates
      const interval = setInterval(() => {
        console.log("[My Orders] Auto-refreshing orders...");
        fetchOrders();
      }, 30000); // 30 seconds

      setRefreshInterval(interval);

      return () => {
        if (interval) {
          clearInterval(interval);
        }
      };
    }
  }, [user, getToken]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 lg:px-10 py-14 space-y-8 text-gray-800 flex-1">
        {/* Hero Section */}
        <section className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-white via-emerald-50 to-white shadow-sm p-8 sm:p-12 space-y-6">
          <div className="space-y-3">
            <p className="text-sm font-semibold text-emerald-700 uppercase tracking-wide">
              Account
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              My Orders
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed max-w-3xl">
              Track and manage all your purchases. View order details, delivery
              status, and payment information in one place.
            </p>
          </div>
        </section>

        {/* Orders Section */}
        {loading ? (
          <Loading />
        ) : orders.length === 0 ? (
          <div className="rounded-3xl border border-gray-100 bg-white shadow-sm p-12 text-center">
            <p className="text-gray-600 mb-4">
              You haven't placed any orders yet.
            </p>
            <a href="/all-products" className="btn btn-primary px-6 py-3">
              Start Shopping
            </a>
          </div>
        ) : (
          <section className="space-y-4">
            {/* Manual Refresh Button */}
            <div className="flex justify-end mb-4">
              <button
                onClick={async () => {
                  setLoading(true);
                  await fetchOrders();
                }}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center gap-2 text-sm font-medium"
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
                Refresh Orders
              </button>
            </div>

            {/* Orders List */}
            {orders.map((order, index) => (
              <div
                key={index}
                className="rounded-2xl border border-emerald-100 bg-white shadow-sm p-6 sm:p-8 hover:shadow-md transition-shadow"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Product Info */}
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
                      Products
                    </p>
                    <div className="flex gap-4">
                      <div className="w-14 h-14 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-7 h-7 text-emerald-600"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z" />
                          <path
                            d="M9 9a2 2 0 104 0 2 2 0 00-4 0z"
                            opacity="0.5"
                          />
                          <path d="M2 19h20v2H2z" opacity="0.3" />
                        </svg>
                      </div>
                      <div className="space-y-1">
                        <p className="font-semibold text-gray-900 text-sm">
                          {order.items.length} item
                          {order.items.length > 1 ? "s" : ""}
                        </p>
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {order.items
                            .map((item) =>
                              item.product
                                ? item.product.name
                                : "Product (deleted)"
                            )
                            .join(", ")}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
                      Delivery Address
                    </p>
                    <div className="space-y-1 text-sm">
                      <p className="font-semibold text-gray-900">
                        {order.address.fullName}
                      </p>
                      <p className="text-gray-600">{order.address.area}</p>
                      <p className="text-gray-600">
                        {order.address.city}, {order.address.state}
                      </p>
                      <p className="text-gray-600">
                        {order.address.phoneNumber}
                      </p>
                    </div>
                  </div>

                  {/* Order Amount */}
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
                      Order Total
                    </p>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold text-emerald-600">
                        {currency}
                        {order.displayAmount ?? order.amount}
                      </p>
                      {order.promoCode && order.discountAmount > 0 && (
                        <p className="text-sm text-emerald-600">
                          Promo: {order.promoCode} (-{currency}
                          {order.discountAmount})
                        </p>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      Payment Method: <span className="font-semibold">COD</span>
                    </p>
                  </div>

                  {/* Order Details */}
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
                      Order Details
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date:</span>
                        <span className="font-semibold text-gray-900">
                          {new Date(Number(order.date)).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span
                          className={`inline-block px-3 py-1 rounded-full font-semibold text-xs ${
                            order.status === "Order Placed"
                              ? "bg-blue-50 text-blue-700"
                              : order.status === "Processing"
                              ? "bg-yellow-50 text-yellow-700"
                              : order.status === "Shipped"
                              ? "bg-purple-50 text-purple-700"
                              : order.status === "Out for Delivery"
                              ? "bg-orange-50 text-orange-700"
                              : order.status === "Delivered"
                              ? "bg-emerald-50 text-emerald-700"
                              : order.status === "Cancelled"
                              ? "bg-red-50 text-red-700"
                              : "bg-gray-50 text-gray-700"
                          }`}
                        >
                          {order.status || "Unknown"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment:</span>
                        <span
                          className={`font-semibold ${
                            order.status === "Delivered"
                              ? "text-emerald-700"
                              : order.status === "Cancelled"
                              ? "text-red-700"
                              : "text-yellow-700"
                          }`}
                        >
                          {order.status === "Delivered"
                            ? "Completed"
                            : order.status === "Cancelled"
                            ? "Cancelled"
                            : "Pending"}
                        </span>
                      </div>
                    </div>
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
