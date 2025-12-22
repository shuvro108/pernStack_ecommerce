import React, { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { assets } from "@/assets/assets";
import { useAppContext } from "@/context/AppContext";

const FeaturedProduct = () => {
  const { products } = useAppContext();

  const featured = useMemo(() => {
    if (!Array.isArray(products) || products.length === 0) return [];
    // Pick latest 3 products by date; fallback to first 3
    const sorted = [...products].sort(
      (a, b) => (b?.date || 0) - (a?.date || 0)
    );
    return sorted.slice(0, 3);
  }, [products]);

  if (!featured.length) return null;

  return (
    <div className="mt-14">
      <div className="flex flex-col items-center">
        <p className="text-3xl font-medium">Featured Products</p>
        <div className="w-28 h-0.5 bg-emerald-600 mt-2"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-14 mt-12 md:px-14 px-4">
        {featured.map((p) => (
          <div key={p._id} className="relative group">
            <Image
              src={Array.isArray(p.image) ? p.image[0] : p.image}
              alt={p.name}
              width={800}
              height={500}
              className="group-hover:brightness-75 transition duration-300 w-full h-auto object-cover"
            />
            <div className="group-hover:-translate-y-4 transition duration-300 absolute bottom-8 left-8 text-white space-y-2">
              <p className="font-medium text-xl lg:text-2xl">{p.name}</p>
              <p className="text-sm lg:text-base leading-5 max-w-60 line-clamp-2">
                {p.description}
              </p>
              <Link
                href={`/product/${p._id}`}
                className="inline-flex items-center gap-1.5 bg-emerald-600 px-4 py-2 rounded"
              >
                Buy now{" "}
                <Image
                  className="h-3 w-3"
                  src={assets.redirect_icon}
                  alt="Redirect Icon"
                />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedProduct;
