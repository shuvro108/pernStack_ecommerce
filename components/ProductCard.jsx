import React from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";

const ProductCard = ({ product }) => {
  const { currency, router } = useAppContext();

  // Handle missing product data
  if (!product || !product._id) {
    return null;
  }

  // Get image with fallback
  const imageUrl =
    product?.image?.[0] ||
    product?.image ||
    assets?.placeholder_image ||
    "/placeholder.png";

  return (
    <div
      onClick={() => {
        router.push("/product/" + product._id);
        scrollTo(0, 0);
      }}
      className="group flex flex-col w-full cursor-pointer card overflow-hidden"
    >
      {/* Image Container */}
      <div className="relative bg-gray-50 w-full aspect-square overflow-hidden">
        <Image
          src={imageUrl}
          alt={product.name}
          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
          width={400}
          height={400}
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2.5 rounded-full shadow-md hover:bg-white hover:scale-110 transition-all duration-300"
        >
          <Image className="h-4 w-4" src={assets.heart_icon} alt="heart_icon" />
        </button>
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-2 flex-1 flex flex-col">
        <h3 className="font-semibold text-gray-900 text-base line-clamp-2 leading-snug">
          {product.name}
        </h3>

        <p className="text-sm text-gray-500 line-clamp-2 max-sm:hidden flex-1">
          {product.description}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, index) => (
              <Image
                key={index}
                className="h-3.5 w-3.5"
                src={
                  index < Math.round(product.ratingAverage || 0)
                    ? assets.star_icon
                    : assets.star_dull_icon
                }
                alt="star_icon"
              />
            ))}
          </div>
          <span className="text-sm text-gray-600 font-medium">
            {product.ratingAverage?.toFixed
              ? product.ratingAverage.toFixed(1)
              : product.ratingAverage || 0}
          </span>
        </div>

        {/* Price and CTA */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-gray-900">
              {currency}
              {product.offerPrice}
            </span>
          </div>
          <button className="max-sm:hidden btn btn-primary text-sm px-4 py-2">
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
