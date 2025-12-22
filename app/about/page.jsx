import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const AboutPage = () => {
  return (
    <>
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 lg:px-10 py-14 space-y-12 text-gray-800">
        {/* Hero */}
        <section className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-white via-emerald-50 to-white shadow-sm p-8 sm:p-12 space-y-6">
          <div className="space-y-3">
            <p className="text-sm font-semibold text-emerald-700 uppercase tracking-wide">
              About Terracotta
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              Crafted by artisans. Curated for modern homes.
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed max-w-3xl">
              We connect independent artisans with people who value thoughtful
              design and responsible craftsmanship. Every piece is sourced
              directly from makers, ensuring fair pay, traceable materials, and
              lasting quality.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                label: "Artisans supported",
                value: "400+",
                detail: "Across 7 regions",
              },
              {
                label: "Orders delivered",
                value: "120K",
                detail: "Packaged plastic-light",
              },
              {
                label: "Customer rating",
                value: "4.8/5",
                detail: "Consistently since 2021",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-[0_8px_30px_-20px_rgba(16,185,129,0.45)]"
              >
                <p className="text-sm text-emerald-700 font-semibold">
                  {item.label}
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {item.value}
                </p>
                <p className="text-sm text-gray-600 mt-1">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pillars */}
        <section className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Our mission",
              copy: "Preserve heritage techniques while helping artisans earn sustainably in the digital economy.",
            },
            {
              title: "What we curate",
              copy: "Handcrafted decor, textiles, ceramics, and accessories selected for quality, durability, and story.",
            },
            {
              title: "Why it matters",
              copy: "Every purchase supports fair wages, cultural preservation, and a lighter-footprint supply chain.",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="p-6 bg-white rounded-2xl border border-emerald-100 shadow-sm hover:-translate-y-1 transition-transform"
            >
              <h3 className="text-xl font-semibold text-gray-900">
                {card.title}
              </h3>
              <p className="mt-2 text-gray-600 leading-relaxed">{card.copy}</p>
            </div>
          ))}
        </section>

        {/* Process */}
        <section className="rounded-3xl border border-gray-100 bg-white shadow-sm p-8 sm:p-10 space-y-6">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-emerald-700 uppercase tracking-wide">
              How we work
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              From workshop to your home
            </h2>
            <p className="text-gray-600 max-w-3xl">
              A transparent, maker-first process so you know who crafted your
              piece and how it arrived at your door.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {[
              {
                step: "01",
                title: "Source",
                copy: "We partner with small workshops and cooperatives using verified materials.",
              },
              {
                step: "02",
                title: "Co-create",
                copy: "Design support to keep traditions intact while refining for modern use.",
              },
              {
                step: "03",
                title: "Inspect",
                copy: "Each batch is quality-checked for durability, finish, and safe packaging.",
              },
              {
                step: "04",
                title: "Deliver",
                copy: "Carbon-aware shipping with minimal plastics and clear tracking.",
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
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-3xl border border-emerald-100 bg-emerald-50 p-8 sm:p-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-sm">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-gray-900">
              Want to collaborate or curate with us?
            </h3>
            <p className="text-gray-700 max-w-2xl">
              We love partnering with interior designers, boutique retailers,
              and cultural institutions to bring handcrafted stories to new
              spaces.
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <a
              href="/contact"
              className="btn btn-primary px-6 py-3 shadow-emerald-500/30 hover:-translate-y-0.5"
            >
              Talk with us
            </a>
            <a
              href="mailto:shuvrod2017@gmail.com"
              className="btn btn-outline px-6 py-3 hover:-translate-y-0.5"
            >
              Email the team
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default AboutPage;
