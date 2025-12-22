"use client";
import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

const NewsLetter = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const subscribe = async () => {
    const trimmed = (email || "").trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      toast.error("Please enter a valid email");
      return;
    }
    try {
      setLoading(true);
      const { data } = await axios.post("/api/newsletter/subscribe", {
        email: trimmed,
      });
      if (data?.success) {
        toast.success(data.message || "Subscribed successfully");
        setEmail("");
      } else {
        toast.error(data?.message || "Subscription failed");
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err.message || "Subscription failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full my-16 md:my-20">
      <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-8 sm:p-12 lg:p-16 border border-slate-200 shadow-sm">
        <div className="max-w-3xl mx-auto text-center space-y-5">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600 rounded-xl shadow-sm">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>

          {/* Heading */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Stay Informed with Our Newsletter
            </h2>
            <p className="text-lg text-gray-600">
              Receive curated product updates, industry insights, and exclusive
              offers delivered to your inbox.
            </p>
          </div>

          {/* Email Form */}
          <div className="flex flex-col sm:flex-row items-center gap-3 max-w-xl mx-auto pt-4">
            <input
              className="w-full px-6 py-3 border-2 border-gray-200 rounded-lg outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-50 transition-all text-gray-700 placeholder:text-gray-400"
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") subscribe();
              }}
            />
            <button
              disabled={loading}
              onClick={subscribe}
              className="btn btn-primary w-full sm:w-auto px-6 py-3 shadow-emerald-600/30 hover:shadow-emerald-600/40 disabled:opacity-60 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap"
            >
              {loading ? "Subscribing..." : "Subscribe Now"}
            </button>
          </div>

          {/* Privacy Note */}
          <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NewsLetter;
