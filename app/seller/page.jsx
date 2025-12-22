"use client";

export const dynamic = "force-dynamic";

import React, { useState } from "react";
import { assets } from "@/assets/assets";
import { CATEGORIES } from "@/assets/productData";
import Image from "next/image";
import axios from "axios";
import toast from "react-hot-toast";
import { useAppContext } from "@/context/AppContext";
import imageCompression from "browser-image-compression";

const AddProduct = () => {
  const { fetchProductData } = useAppContext();
  const [files, setFiles] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]?.id || "pottery");
  const [price, setPrice] = useState("");
  const [offerPrice, setOfferPrice] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    formData.append("name", name);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("price", price);
    formData.append("offerPrice", offerPrice);
    // Compress images client-side to speed up uploads
    const compressionOpts = {
      maxSizeMB: 0.6,
      maxWidthOrHeight: 1200,
      useWebWorker: true,
    };

    for (const file of files) {
      if (!file) continue;
      try {
        const compressed = await imageCompression(file, compressionOpts);
        formData.append("images", compressed);
      } catch (err) {
        // Fallback to original if compression fails
        formData.append("images", file);
      }
    }

    try {
      const { data } = await axios.post("/api/product/add", formData, {
        withCredentials: true,
      });

      if (data?.success) {
        toast.success(data.message);
        setName("");
        setDescription("");
        setCategory(CATEGORIES[0]?.id || "pottery");
        setPrice("");
        setOfferPrice("");
        setFiles([]);
        // Refresh products list so new product shows up immediately
        await fetchProductData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Error adding product: " + error.message);
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-gray-50">
      <div className="md:p-8 p-6 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-3xl font-bold text-gray-900 mb-2 tracking-tight">
            Add New Product
          </h1>
          <p className="text-gray-600 text-base">
            Fill in the details to add a new product to your inventory
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 space-y-6"
        >
          <div className="pb-6 border-b border-gray-200">
            <div className="mb-4">
              <label className="text-sm font-semibold text-gray-900 block">
                Product Images
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Upload up to 4 images (800x800px recommended)
              </p>
            </div>
            <div className="grid grid-cols-4 gap-2.5">
              {[...Array(4)].map((_, index) => (
                <label
                  key={index}
                  htmlFor={`image${index}`}
                  className="group cursor-pointer"
                >
                  <input
                    onChange={(e) => {
                      const updatedFiles = [...files];
                      updatedFiles[index] = e.target.files[0];
                      setFiles(updatedFiles);
                    }}
                    type="file"
                    id={`image${index}`}
                    hidden
                    accept="image/*"
                  />
                  <div className="relative w-full h-24 border border-gray-300 rounded-lg overflow-hidden hover:border-emerald-400 transition-colors duration-150 bg-gray-50 group-hover:bg-emerald-50">
                    <Image
                      key={index}
                      className="w-full h-full object-cover"
                      src={
                        files[index]
                          ? URL.createObjectURL(files[index])
                          : assets.upload_area
                      }
                      alt="Product image"
                      width={100}
                      height={96}
                    />
                    {!files[index] && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50">
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3 pt-2">
            <label
              className="text-sm font-semibold text-gray-900 flex items-center gap-2"
              htmlFor="product-name"
            >
              Product Name
              <span className="text-red-500">*</span>
            </label>
            <input
              id="product-name"
              type="text"
              placeholder="Enter product name"
              className="outline-none py-3 px-4 rounded-lg border-2 border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-50 transition-all text-gray-900 placeholder:text-gray-400"
              onChange={(e) => setName(e.target.value)}
              value={name}
              required
            />
          </div>
          <div className="flex flex-col gap-3">
            <label
              className="text-sm font-semibold text-gray-900 flex items-center gap-2"
              htmlFor="product-description"
            >
              Product Description
              <span className="text-red-500">*</span>
            </label>
            <textarea
              id="product-description"
              rows={5}
              className="outline-none py-3 px-4 rounded-lg border-2 border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-50 resize-none transition-all text-gray-900 placeholder:text-gray-400"
              placeholder="Describe your product in detail"
              onChange={(e) => setDescription(e.target.value)}
              value={description}
              required
            ></textarea>
          </div>
          <div className="pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="flex flex-col gap-3">
                <label
                  className="text-sm font-semibold text-gray-900 flex items-center gap-2"
                  htmlFor="category"
                >
                  Category
                  <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  className="outline-none py-3 px-4 rounded-lg border-2 border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-50 transition-all bg-white text-gray-900"
                  onChange={(e) => setCategory(e.target.value)}
                  value={category}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-3">
                <label
                  className="text-sm font-semibold text-gray-900 flex items-center gap-2"
                  htmlFor="product-price"
                >
                  Regular Price
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                    ৳
                  </span>
                  <input
                    id="product-price"
                    type="number"
                    placeholder="0.00"
                    className="outline-none py-3 pl-8 pr-4 rounded-lg border-2 border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-50 transition-all w-full text-gray-900 placeholder:text-gray-400"
                    onChange={(e) => setPrice(e.target.value)}
                    value={price}
                    required
                  />
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <label
                  className="text-sm font-semibold text-gray-900 flex items-center gap-2"
                  htmlFor="offer-price"
                >
                  Sale Price
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                    ৳
                  </span>
                  <input
                    id="offer-price"
                    type="number"
                    placeholder="0.00"
                    className="outline-none py-3 pl-8 pr-4 rounded-lg border-2 border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-50 transition-all w-full text-gray-900 placeholder:text-gray-400"
                    onChange={(e) => setOfferPrice(e.target.value)}
                    value={offerPrice}
                    required
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4 pt-8 border-t border-gray-200">
            <button
              type="submit"
              className="flex items-center justify-center gap-2 px-8 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-all duration-300 shadow-sm shadow-emerald-600/20 hover:shadow-md hover:shadow-emerald-600/30 hover:-translate-y-0.5 active:translate-y-0"
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>Add Product</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setName("");
                setDescription("");
                setCategory(CATEGORIES[0]?.id || "pottery");
                setPrice("");
                setOfferPrice("");
                setFiles([]);
              }}
              className="px-6 py-3 bg-white text-gray-700 font-semibold rounded-lg border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-300"
            >
              Clear Form
            </button>
          </div>
        </form>
      </div>
      {/* <Footer /> */}
    </div>
  );
};

export default AddProduct;
