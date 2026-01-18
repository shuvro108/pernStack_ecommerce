"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import { CATEGORIES } from "@/assets/productData";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { useParams, useSearchParams } from "next/navigation";
import Loading from "@/components/Loading";
import { useAppContext } from "@/context/AppContext";
import React from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useUser } from "@clerk/nextjs";

const Product = () => {
  const { id } = useParams();
  const { user: clerkUser } = useUser();
  const searchParams = useSearchParams();
  const openReview = searchParams?.get("review") === "1";

  const { products, router, addToCart, fetchProductData } = useAppContext();

  const [mainImage, setMainImage] = useState(null);
  const [productData, setProductData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Local loader to derive selected product from global products list
  const loadProduct = () => {
    const product = products.find((product) => product._id === id);
    if (product) {
      console.log("Loaded product:", product._id, product.name);
      setProductData(product);
    } else {
      console.log("Product not found in global list for id:", id);
    }
  };

  const fetchReviews = async () => {
    try {
      const { data } = await axios.get(`/api/review/list?productId=${id}`);
      if (data?.success) {
        setReviews(data.reviews);
        setAverageRating(data.averageRating);
        setTotalReviews(data.totalReviews);

        // Check if current user has already reviewed
        if (clerkUser) {
          const userReview = data.reviews.find(
            (r) => r.userId === clerkUser.id,
          );
          setHasReviewed(!!userReview);
        }
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const checkPurchase = async () => {
    if (!clerkUser) return;
    try {
      const { data } = await axios.get(
        `/api/review/check-purchase?productId=${id}`,
      );
      if (data?.success) {
        setHasPurchased(data.hasPurchased);
      }
    } catch (error) {
      console.error("Error checking purchase:", error);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!clerkUser) {
      toast.error("Please sign in to review");
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await axios.post("/api/review/add", {
        productId: id,
        rating,
        comment,
      });

      if (data?.success) {
        toast.success("Review submitted successfully!");
        setShowReviewForm(false);
        setComment("");
        setRating(5);
        await fetchReviews();
        await fetchProductData();
        await checkPurchase();
      } else {
        toast.error(data?.message || "Failed to submit review");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error submitting review");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    loadProduct();
    fetchReviews();
  }, [id, products.length]);

  useEffect(() => {
    if (clerkUser && id) {
      checkPurchase();
    }
  }, [clerkUser, id]);

  // Auto-open review form if coming from My Orders with review flag
  useEffect(() => {
    if (clerkUser && hasPurchased && !hasReviewed && openReview) {
      setShowReviewForm(true);
      // Optionally scroll to the reviews section
      try {
        const el = document.getElementById("reviews-section");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      } catch {}
    } else if (clerkUser && hasReviewed && openReview) {
      // User already reviewed, just scroll to see their review
      toast("You've already reviewed this product", { icon: "ℹ️" });
      try {
        const el = document.getElementById("reviews-section");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      } catch {}
    }
  }, [clerkUser, hasPurchased, hasReviewed, openReview]);

  return productData ? (
    <>
      <Navbar />
      <div className="px-6 md:px-16 lg:px-32 pt-14 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div className="px-5 lg:px-16 xl:px-20">
            <div className="rounded-lg overflow-hidden bg-gray-500/10 mb-4 max-w-sm mx-auto">
              <Image
                src={mainImage || productData.image[0]}
                alt="alt"
                className="w-full h-auto object-contain mix-blend-multiply"
                width={300}
                height={300}
              />
            </div>

            <div className="grid grid-cols-4 gap-3 max-w-sm mx-auto">
              {productData.image.map((image, index) => (
                <div
                  key={index}
                  onClick={() => setMainImage(image)}
                  className="cursor-pointer rounded-lg overflow-hidden bg-gray-500/10"
                >
                  <Image
                    src={image}
                    alt="alt"
                    className="w-full h-auto object-contain mix-blend-multiply"
                    width={75}
                    height={75}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col">
            <h1 className="text-3xl font-medium text-gray-800/90 mb-4">
              {productData.name}
            </h1>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, index) => (
                  <Image
                    key={index}
                    className="h-4 w-4"
                    src={
                      index < Math.round(averageRating)
                        ? assets.star_icon
                        : assets.star_dull_icon
                    }
                    alt="star"
                  />
                ))}
              </div>
              <p>
                ({averageRating}) · {totalReviews} review
                {totalReviews !== 1 ? "s" : ""}
              </p>
            </div>
            <p className="text-gray-600 mt-3">{productData.description}</p>
            <p className="text-3xl font-medium mt-6">
              ৳{productData.offerPrice}
              <span className="text-base font-normal text-gray-800/60 line-through ml-2">
                ৳{productData.price}
              </span>
            </p>
            <hr className="bg-gray-600 my-6" />
            <div className="overflow-x-auto">
              <table className="table-auto border-collapse w-full max-w-72">
                <tbody>
                  <tr>
                    <td className="text-gray-600 font-medium">Category</td>
                    <td className="text-gray-800/50">
                      {CATEGORIES.find((cat) => cat.id === productData.category)
                        ?.name || productData.category}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex items-center mt-10 gap-4">
              <button
                onClick={async () => {
                  if (!clerkUser) {
                    toast.error("Please sign in to add items");
                    return;
                  }
                  console.log(
                    "Adding to cart - productData._id:",
                    productData?._id,
                  );
                  const success = await addToCart(productData._id, 1);
                  if (success) {
                    toast.success("Added to cart");
                  }
                }}
                className="w-full py-3 bg-gray-100 text-gray-800/80 hover:bg-gray-200 transition"
              >
                Add to Cart
              </button>
              <button
                onClick={async () => {
                  if (!clerkUser) {
                    toast.error("Please sign in to buy");
                    return;
                  }
                  console.log("Buying - productData._id:", productData?._id);
                  const success = await addToCart(productData._id, 1);
                  if (success) {
                    router.push("/cart");
                  } else {
                    toast.error("Failed to add to cart");
                  }
                }}
                className="w-full py-3 bg-emerald-500 text-white hover:bg-emerald-600 transition"
              >
                Buy now
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div id="reviews-section" className="max-w-4xl mx-auto mt-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Customer Reviews
            </h2>
            {clerkUser && hasPurchased && !hasReviewed && !showReviewForm && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition"
              >
                Write a Review
              </button>
            )}
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <form
              onSubmit={handleSubmitReview}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Share Your Experience
              </h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none"
                    >
                      <Image
                        className="h-8 w-8 cursor-pointer"
                        src={
                          star <= rating
                            ? assets.star_icon
                            : assets.star_dull_icon
                        }
                        alt="star"
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-gray-600">
                    ({rating} star{rating !== 1 ? "s" : ""})
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Review
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                  rows={4}
                  placeholder="Share your thoughts about this product..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-rose-400 focus:ring-2 focus:ring-rose-50 outline-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Submitting..." : "Submit Review"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowReviewForm(false);
                    setComment("");
                    setRating(5);
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Review List */}
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <p className="text-gray-600">
                  No reviews yet. Be the first to review!
                </p>
              </div>
            ) : (
              reviews.map((review, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">
                          {review.userName}
                        </h4>
                        {review.verifiedPurchase && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                            ✓ Verified Purchase
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Image
                              key={i}
                              className="h-4 w-4"
                              src={
                                i < review.rating
                                  ? assets.star_icon
                                  : assets.star_dull_icon
                              }
                              alt="star"
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString(
                            "en-US",
                            { year: "numeric", month: "long", day: "numeric" },
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex flex-col items-center mt-16">
          <div className="flex flex-col items-center mb-4 mt-16">
            <p className="text-3xl font-medium">
              Featured{" "}
              <span className="font-medium text-emerald-900">Products</span>
            </p>
            <div className="w-28 h-0.5 bg-emerald-600 mt-2"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 mt-6 pb-14 w-full">
            {products.slice(0, 5).map((product, index) => (
              <ProductCard key={index} product={product} />
            ))}
          </div>
          <button
            onClick={() => router.push("/all-products")}
            className="px-6 py-2 mb-16 border rounded text-gray-500/70 hover:bg-slate-50/90 transition"
          >
            See more
          </button>
        </div>
      </div>
      <Footer />
    </>
  ) : (
    <Loading />
  );
};

export default Product;
