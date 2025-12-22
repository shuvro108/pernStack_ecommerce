"use client";
import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "react-hot-toast";

const PromoAdminPage = () => {
  const [form, setForm] = useState({
    code: "",
    discount: "10",
    users: "",
  });
  const [status, setStatus] = useState("idle");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");

    try {
      const payload = {
        code: form.code.trim().toUpperCase(),
        discount: Number(form.discount),
        users: form.users
          .split(",")
          .map((u) => u.trim())
          .filter(Boolean),
      };

      const res = await fetch("/api/admin/promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Failed to save promo");
      }

      setStatus("idle");
      toast.success(data.message || "Promo code created successfully!");
      setForm({ code: "", discount: "10", users: "" });
    } catch (err) {
      setStatus("idle");
      toast.error(err.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 lg:px-10 py-14 space-y-12 text-gray-800 flex-1">
        {/* Hero Section */}
        <section className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-white via-emerald-50 to-white shadow-sm p-8 sm:p-12 space-y-6">
          <div className="space-y-3">
            <p className="text-sm font-semibold text-emerald-700 uppercase tracking-wide">
              Seller Dashboard
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              Create and manage promo codes
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed max-w-3xl">
              Generate discount codes for your customers. Set a code, discount
              percentage, and optionally restrict access to specific users for
              targeted promotions.
            </p>
          </div>
        </section>

        {/* Features Grid */}
        <section className="grid gap-6 md:grid-cols-3">
          {[
            {
              step: "01",
              title: "Custom Discounts",
              copy: "Set discount rates from 1-90% to attract customers and boost sales.",
            },
            {
              step: "02",
              title: "Target Specific Users",
              copy: "Restrict codes to selected emails for exclusive campaigns or VIP customers.",
            },
            {
              step: "03",
              title: "Instant Activation",
              copy: "Codes go live immediately and are ready for customers to use right away.",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="p-5 rounded-2xl border border-emerald-100 bg-emerald-50/60 shadow-sm"
            >
              <p className="text-xs font-semibold text-emerald-700">
                Step {item.step}
              </p>
              <h3 className="text-lg font-semibold text-gray-900 mt-1">
                {item.title}
              </h3>
              <p className="text-sm text-gray-700 mt-2 leading-relaxed">
                {item.copy}
              </p>
            </div>
          ))}
        </section>

        {/* Form Section */}
        <section className="rounded-3xl border border-gray-100 bg-white shadow-sm p-8 sm:p-10 space-y-8">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-emerald-700 uppercase tracking-wide">
              Create New Code
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Promo code details
            </h2>
            <p className="text-gray-600 max-w-3xl">
              Fill in the details below to create a new promo code. All codes
              are case-insensitive and automatically converted to uppercase for
              consistency.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Promo Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  placeholder="e.g., SAVE10, HOLIDAY20"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition text-gray-900 placeholder-gray-400"
                  required
                />
                <p className="text-xs text-gray-500 mt-2">
                  Letters and numbers only (max 20 characters)
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Discount Amount <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={form.discount}
                    onChange={(e) =>
                      setForm({ ...form, discount: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition text-gray-900"
                    required
                  />
                  <span className="absolute right-4 top-3 text-gray-500 font-semibold">
                    %
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Enter a value between 1-90%
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Allowed Users <span className="text-gray-400">(Optional)</span>
              </label>
              <textarea
                value={form.users}
                onChange={(e) => setForm({ ...form, users: e.target.value })}
                placeholder="john@example.com, sarah@example.com, mike@example.com"
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition text-gray-900 placeholder-gray-400"
              />
              <p className="text-xs text-gray-500 mt-2">
                Enter comma-separated email addresses. Leave blank to allow all
                customers to use this code.
              </p>
            </div>

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2 shadow-emerald-500/30 hover:-translate-y-0.5"
            >
              {status === "loading" ? (
                <>
                  <span className="inline-block animate-spin">⏳</span>
                  Creating promo code...
                </>
              ) : (
                "Create Promo Code"
              )}
            </button>
          </form>
        </section>

        {/* Tips Section */}
        <section className="rounded-3xl border border-emerald-100 bg-emerald-50 p-8 sm:p-10 space-y-6 shadow-sm">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-gray-900">
              Tips for effective promo codes
            </h3>
            <p className="text-gray-600">
              Maximize conversions and customer engagement with these proven
              strategies.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                title: "Keep it simple",
                detail:
                  "Use short, memorable codes like SAVE10 or WELCOME20 for better recall and faster checkout.",
              },
              {
                title: "Target strategically",
                detail:
                  "Restrict codes to specific users for exclusive VIP offers, seasonal campaigns, or loyalty rewards.",
              },
              {
                title: "Balance discounts",
                detail:
                  "Higher discounts drive more sales, but monitor your profit margins and break-even points.",
              },
              {
                title: "Case flexibility",
                detail:
                  "All codes work case-insensitively—SAVE10, save10, and Save10 are treated identically.",
              },
            ].map((tip, idx) => (
              <div key={idx} className="space-y-1">
                <h4 className="font-semibold text-gray-900">{tip.title}</h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {tip.detail}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PromoAdminPage;
