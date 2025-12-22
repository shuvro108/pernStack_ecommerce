"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";

const KEY_DOWN = "ArrowDown";
const KEY_UP = "ArrowUp";
const KEY_ENTER = "Enter";
const KEY_ESC = "Escape";

const SearchBar = () => {
  const { products, router } = useAppContext();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 200);
    return () => clearTimeout(t);
  }, [query]);

  const suggestions = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return [];
    const base = products || [];
    const filtered = base.filter(
      (p) =>
        (p.name || "").toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q)
    );
    return filtered.slice(0, 8);
  }, [products, debouncedQuery]);

  const totalMatches = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return 0;
    const base = products || [];
    return base.filter(
      (p) =>
        (p.name || "").toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q)
    ).length;
  }, [products, debouncedQuery]);

  useEffect(() => {
    setOpen(!!debouncedQuery && suggestions.length > 0);
    setActiveIndex(-1);
  }, [debouncedQuery, suggestions.length]);

  const submitSearch = () => {
    const q = query.trim();
    if (!q) return;
    router.push(`/all-products?q=${encodeURIComponent(q)}`);
    setOpen(false);
    setActiveIndex(-1);
  };

  const onKeyDown = (e) => {
    if (!open && (e.key === KEY_DOWN || e.key === KEY_UP)) {
      setOpen(true);
    }
    if (e.key === KEY_ENTER) {
      if (open && activeIndex >= 0 && activeIndex < suggestions.length) {
        const p = suggestions[activeIndex];
        router.push(`/product/${p._id}`);
        setOpen(false);
        return;
      }
      submitSearch();
    } else if (e.key === KEY_ESC) {
      setOpen(false);
      setActiveIndex(-1);
    } else if (e.key === KEY_DOWN) {
      e.preventDefault();
      setActiveIndex((prev) => {
        const next = prev + 1;
        return next >= suggestions.length ? suggestions.length - 1 : next;
      });
    } else if (e.key === KEY_UP) {
      e.preventDefault();
      setActiveIndex((prev) => {
        const next = prev - 1;
        return next < 0 ? -1 : next;
      });
    }
  };

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const highlight = (text, q) => {
    const t = text || "";
    const queryLower = (q || "").toLowerCase();
    if (!queryLower) return t;
    const idx = t.toLowerCase().indexOf(queryLower);
    if (idx === -1) return t;
    const before = t.slice(0, idx);
    const match = t.slice(idx, idx + queryLower.length);
    const after = t.slice(idx + queryLower.length);
    return (
      <>
        {before}
        <mark className="bg-amber-200 text-inherit px-0.5 rounded">
          {match}
        </mark>
        {after}
      </>
    );
  };

  return (
    <div className="w-full mb-8">
      <div className="relative max-w-2xl mx-auto">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
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
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Search products by name or description..."
          className="w-full pl-12 pr-28 py-3 border-2 border-gray-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all text-gray-700 placeholder:text-gray-400"
          aria-label="Search products"
          aria-expanded={open}
          aria-controls="global-search-suggestions"
        />

        <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-2">
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
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
          <button
            onClick={submitSearch}
            className="btn btn-primary px-4 py-2"
            aria-label="Search"
          >
            Search
          </button>
        </div>

        {open && (
          <ul
            id="global-search-suggestions"
            role="listbox"
            className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
          >
            {suggestions.map((p, idx) => (
              <li
                key={p._id}
                role="option"
                aria-selected={activeIndex === idx}
                className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 ${
                  activeIndex === idx ? "bg-gray-50" : ""
                }`}
                onMouseEnter={() => setActiveIndex(idx)}
                onClick={() => router.push(`/product/${p._id}`)}
              >
                {p?.image?.[0] && (
                  <div className="flex-shrink-0">
                    <Image
                      src={p.image[0]}
                      alt={p.name}
                      width={48}
                      height={48}
                      className="w-12 h-12 object-cover rounded-md"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 line-clamp-1">
                    {highlight(p.name, debouncedQuery)}
                  </p>
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {highlight(p.description, debouncedQuery)}
                  </p>
                </div>
                <div className="text-sm font-bold text-gray-900 whitespace-nowrap">
                  ${p.offerPrice}
                </div>
              </li>
            ))}
            {totalMatches > suggestions.length && (
              <li
                className="px-4 py-3 text-sm text-emerald-700 font-semibold cursor-pointer hover:bg-gray-50"
                onClick={submitSearch}
              >
                View all {totalMatches} results
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
