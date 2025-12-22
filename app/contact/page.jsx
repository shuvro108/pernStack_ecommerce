"use client";
import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const ContactPage = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("idle");
  const [feedback, setFeedback] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    setFeedback("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to send message");
      }

      setStatus("success");
      setFeedback("Thanks! Your message was sent successfully.");
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      setStatus("error");
      setFeedback(err.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <>
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 lg:px-10 py-14 space-y-10 text-gray-800">
        {/* Hero */}
        <section className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-white via-emerald-50 to-white shadow-sm p-8 sm:p-12 space-y-5">
          <p className="text-sm font-semibold text-emerald-700 uppercase tracking-wide">
            Contact
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
            We are here to help
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed max-w-3xl">
            Questions about an order, collaboration, or custom sourcing? Reach
            out and we will respond within one business day.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="mailto:shuvrod2017@gmail.com"
              className="btn btn-primary px-6 py-3 shadow-emerald-500/30 hover:-translate-y-0.5"
            >
              Email support
            </a>
            <a
              href="tel:+8801682006646"
              className="btn btn-outline px-6 py-3 hover:-translate-y-0.5"
            >
              Call us
            </a>
          </div>
        </section>

        {/* Contact options */}
        <section className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Email",
              detail: "shuvrod2017@gmail.com",
              action: "mailto:shuvrod2017@gmail.com",
              actionLabel: "Write an email",
            },
            {
              title: "Phone",
              detail: "+8801682006646",
              action: "tel:+8801682006646",
              actionLabel: "Call now",
            },
            {
              title: "Hours",
              detail: "Mon-Fri, 9:00-18:00 (UTC)",
              action: "/about",
              actionLabel: "Meet the team",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="p-6 bg-white rounded-2xl border border-emerald-100 shadow-sm space-y-3 hover:-translate-y-1 transition-transform"
            >
              <h3 className="text-xl font-semibold text-gray-900">
                {item.title}
              </h3>
              <p className="text-gray-600">{item.detail}</p>
              <a
                href={item.action}
                className="text-emerald-700 font-semibold hover:text-emerald-800"
              >
                {item.actionLabel}
              </a>
            </div>
          ))}
        </section>

        {/* Quick form */}
        <section className="grid gap-8 md:grid-cols-2 items-start">
          <div className="rounded-3xl border border-gray-100 bg-white shadow-sm p-8 space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Send us a note</h2>
            <p className="text-gray-600">We respond within one business day.</p>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Your full name"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Message
                </label>
                <textarea
                  name="message"
                  rows={4}
                  placeholder="Tell us how we can help"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition"
                  value={form.message}
                  onChange={(e) =>
                    setForm({ ...form, message: e.target.value })
                  }
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full btn btn-primary py-3 shadow-emerald-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={status === "loading"}
              >
                {status === "loading" ? "Sending..." : "Send message"}
              </button>
              {feedback && (
                <p
                  className={`text-sm ${
                    status === "success" ? "text-emerald-700" : "text-rose-600"
                  }`}
                >
                  {feedback}
                </p>
              )}
              <p className="text-xs text-gray-500">
                We keep your details private and never share them.
              </p>
            </form>
          </div>

          <div className="rounded-3xl border border-emerald-100 bg-emerald-50 shadow-sm p-8 space-y-4">
            <h3 className="text-xl font-semibold text-gray-900">
              Need a faster response?
            </h3>
            <p className="text-gray-700">
              Chat with us during business hours and we will route you to the
              right person.
            </p>
            <div className="space-y-3 text-sm text-gray-700">
              <p>
                <span className="font-semibold text-gray-900">
                  Wholesale and B2B:{" "}
                </span>
                shuvrod2017@gmail.com
              </p>
              <p>
                <span className="font-semibold text-gray-900">
                  Returns and exchanges:{" "}
                </span>
                Include your order number for priority handling.
              </p>
              <p>
                <span className="font-semibold text-gray-900">Press: </span>
                shuvrod2017@gmail.com
              </p>
            </div>
            <div className="h-48 w-full rounded-2xl bg-white border border-emerald-100 flex items-center justify-center text-gray-500 text-sm">
              Map placeholder (studio and warehouse)
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default ContactPage;
