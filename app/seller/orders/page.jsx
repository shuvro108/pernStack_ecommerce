"use client";

export const dynamic = "force-dynamic";

import React, { useEffect, useState } from "react";
import { assets, orderDummyData } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Loading from "@/components/Loading";
import { useAuth } from "@clerk/nextjs";
import toast from "react-hot-toast";
import axios from "axios";

const Orders = () => {
  const { getToken } = useAuth();
  const { currency, user } = useAppContext();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshInterval, setRefreshInterval] = useState(null);

  const statusOptions = [
    { value: "Order Placed", color: "bg-blue-100 text-blue-800", icon: "📦" },
    { value: "Processing", color: "bg-yellow-100 text-yellow-800", icon: "⚙️" },
    { value: "Shipped", color: "bg-purple-100 text-purple-800", icon: "🚚" },
    {
      value: "Out for Delivery",
      color: "bg-indigo-100 text-indigo-800",
      icon: "🛵",
    },
    { value: "Delivered", color: "bg-green-100 text-green-800", icon: "✅" },
    { value: "Cancelled", color: "bg-red-100 text-red-800", icon: "❌" },
  ];

  const fetchSellerOrders = async () => {
    // setOrders(orderDummyData);
    // setLoading(false);

    try {
      const token = await getToken();
      const res = await fetch("/api/order/seller-orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      if (res.ok && data?.success) {
        setOrders(data.orders);
        setLoading(false);
      } else {
        toast.error("Failed to fetch seller orders: " + data.message);
      }
    } catch (error) {
      toast.error("Error fetching seller orders: " + error.message);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSellerOrders();

      // Auto-refresh orders every 20 seconds for real-time updates
      const interval = setInterval(() => {
        console.log("[Seller Orders] Auto-refreshing orders...");
        fetchSellerOrders();
      }, 20000); // 20 seconds

      setRefreshInterval(interval);

      return () => {
        if (interval) {
          clearInterval(interval);
        }
      };
    }
  }, [user]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingStatus((prev) => ({ ...prev, [orderId]: true }));
    try {
      const { data } = await axios.put("/api/order/update-status", {
        orderId,
        status: newStatus,
      });

      if (data?.success) {
        // Update local state immediately for instant UI feedback
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        );
        toast.success("Order status updated successfully");

        // Also fetch fresh data from server to ensure consistency
        setTimeout(() => {
          fetchSellerOrders();
        }, 500);
      } else {
        toast.error(data?.message || "Failed to update status");
      }
    } catch (error) {
      console.error("[Seller Orders] Status update error:", error);
      toast.error("Error updating status: " + error.message);
    } finally {
      setUpdatingStatus((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const getStatusInfo = (status) => {
    return (
      statusOptions.find((opt) => opt.value === status) || statusOptions[0]
    );
  };

  const filteredOrders = orders.filter((order) => {
    const searchLower = searchQuery.toLowerCase();
    const orderId = String(order.id).slice(-8).toUpperCase();
    const customerName = order.address.fullName.toLowerCase();
    const phoneNumber = order.address.phoneNumber.toLowerCase();
    const address =
      `${order.address.area} ${order.address.city} ${order.address.state}`.toLowerCase();
    const productNames = order.items
      .map((item) => (item.product ? item.product.name.toLowerCase() : ""))
      .join(" ");

    return (
      orderId.includes(searchLower.toUpperCase()) ||
      customerName.includes(searchLower) ||
      phoneNumber.includes(searchLower) ||
      address.includes(searchLower) ||
      productNames.includes(searchLower)
    );
  });

  return (
    <div className="flex-1 min-h-screen flex flex-col justify-between bg-gray-50">
      {loading ? (
        <Loading />
      ) : (
        <div className="md:p-10 p-4">
          <div className="mb-8 flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                Order Management
              </h2>
              <p className="text-gray-600 mt-1">
                Track and manage all your customer orders
              </p>
            </div>
            <button
              onClick={async () => {
                setLoading(true);
                await fetchSellerOrders();
              }}
              className="px-4 py-2 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors flex items-center gap-2 text-sm font-medium"
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

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-2xl">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-400"
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
                placeholder="Search orders by ID, customer name, phone, address, or product..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:border-rose-400 focus:ring-2 focus:ring-rose-50 outline-none transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                >
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
            {searchQuery && (
              <p className="mt-2 text-sm text-gray-600">
                Found {filteredOrders.length} order
                {filteredOrders.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          <div className="space-y-4">
            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
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
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchQuery ? "No Orders Found" : "No Orders Yet"}
                </h3>
                <p className="text-gray-600">
                  {searchQuery
                    ? "Try adjusting your search terms"
                    : "When customers place orders, they'll appear here"}
                </p>
              </div>
            ) : (
              filteredOrders.map((order, index) => {
                const statusInfo = getStatusInfo(order.status);
                return (
                  <div
                    key={index}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition"
                  >
                    {/* Order Header */}
                    <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-emerald-700"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            Order #{String(order.id).slice(-8).toUpperCase()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(Number(order.date)).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold ${statusInfo.color}`}
                        >
                          <span>{statusInfo.icon}</span>
                          {order.status}
                        </span>
                        <span className="text-lg font-bold text-gray-900">
                          {currency}
                          {order.amount}
                        </span>
                      </div>
                    </div>

                    {/* Order Body */}
                    <div className="p-6">
                      <div className="grid md:grid-cols-3 gap-5">
                        {/* Products */}
                        <div className="md:col-span-2">
                          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
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
                                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                              />
                            </svg>
                            Items ({order.items.length})
                          </h3>
                          <div className="space-y-2">
                            {order.items.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                              >
                                <div className="w-12 h-12 bg-white rounded-md flex items-center justify-center flex-shrink-0">
                                  {item.product ? (
                                    <Image
                                      src={item.product.image[0]}
                                      alt={item.product.name}
                                      width={48}
                                      height={48}
                                      className="w-full h-full object-cover rounded"
                                    />
                                  ) : (
                                    <svg
                                      className="w-6 h-6 text-gray-400"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                      />
                                    </svg>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {item.product
                                      ? item.product.name
                                      : "Product (deleted)"}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Quantity: {item.quantity}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Customer Info */}
                        <div>
                          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
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
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            Delivery Address
                          </h3>
                          <div className="space-y-1 text-sm">
                            <p className="font-medium text-gray-900">
                              {order.address.fullName}
                            </p>
                            <p className="text-gray-600">
                              {order.address.area}
                            </p>
                            <p className="text-gray-600">
                              {order.address.city}, {order.address.state}
                            </p>
                            <p className="text-gray-600">
                              {order.address.zipCode}
                            </p>
                            <p className="text-gray-900 font-medium mt-2 flex items-center gap-2">
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
                                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                />
                              </svg>
                              {order.address.phoneNumber}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Status Update Section */}
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
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
                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            Payment: COD
                          </div>

                          <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-700">
                              Update Status:
                            </label>
                            <select
                              value={order.status}
                              onChange={(e) =>
                                handleStatusUpdate(order.id, e.target.value)
                              }
                              disabled={updatingStatus[order.id]}
                              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:border-rose-400 focus:ring-2 focus:ring-rose-50 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {statusOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.icon} {option.value}
                                </option>
                              ))}
                            </select>
                            {updatingStatus[order.id] && (
                              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
