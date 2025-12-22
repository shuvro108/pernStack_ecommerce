"use client";

export const dynamic = "force-dynamic";

import React, { useEffect, useState } from "react";
import { assets, productsDummyData } from "@/assets/assets";
import { CATEGORIES } from "@/assets/productData";
import Image from "next/image";
import axios from "axios";
import { useAppContext } from "@/context/AppContext";
import Loading from "@/components/Loading";
import toast from "react-hot-toast";
import imageCompression from "browser-image-compression";

const ProductList = () => {
  const { router, user, fetchProductData } = useAppContext();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    offerPrice: "",
  });
  const [editFiles, setEditFiles] = useState([]);
  const [saving, setSaving] = useState(false);

  const fetchSellerProduct = async () => {
    // setProducts(productsDummyData)
    // setLoading(false)
    try {
      const { data } = await axios.get("/api/product/seller-list", {
        withCredentials: true,
      });
      if (data?.success) {
        setProducts(data.products);
        setLoading(false);
      } else {
        toast.error("Error fetching products: " + data.message);
      }
    } catch (error) {
      toast.error("Error fetching products: " + error.message);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSellerProduct();
    }
  }, [user]);

  const handleEdit = (product) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      offerPrice: product.offerPrice,
    });
    setEditFiles([]);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("productId", editingProduct._id);
      formData.append("name", editForm.name);
      formData.append("description", editForm.description);
      formData.append("category", editForm.category);
      formData.append("price", editForm.price);
      formData.append("offerPrice", editForm.offerPrice);

      // Compress images client-side to speed up uploads
      const compressionOpts = {
        maxSizeMB: 0.6,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
      };

      for (const file of editFiles) {
        if (!file) continue;
        try {
          const compressed = await imageCompression(file, compressionOpts);
          formData.append("images", compressed);
        } catch (err) {
          formData.append("images", file);
        }
      }

      const { data } = await axios.put("/api/product/update", formData);

      if (data?.success) {
        toast.success(data.message);
        setEditingProduct(null);
        await fetchSellerProduct();
        await fetchProductData();
      } else {
        toast.error(data?.message || "Update failed");
      }
    } catch (error) {
      toast.error("Error updating product: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const { data } = await axios.delete("/api/product/delete", {
        data: { productId },
      });

      if (data?.success) {
        toast.success(data.message);
        await fetchSellerProduct();
        await fetchProductData();
      } else {
        toast.error(data?.message || "Delete failed");
      }
    } catch (error) {
      toast.error("Error deleting product: " + error.message);
    }
  };

  const filteredProducts = products.filter((product) => {
    const searchLower = searchQuery.toLowerCase();
    const categoryName =
      CATEGORIES.find((cat) => cat.id === product.category)?.name || "";
    return (
      product.name.toLowerCase().includes(searchLower) ||
      product.description.toLowerCase().includes(searchLower) ||
      categoryName.toLowerCase().includes(searchLower) ||
      product.price.toString().includes(searchLower) ||
      product.offerPrice.toString().includes(searchLower)
    );
  });

  return (
    <div className="flex-1 min-h-screen flex flex-col justify-between bg-gray-50">
      {loading ? (
        <Loading />
      ) : (
        <div className="w-full md:p-10 p-4">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Product Management
            </h2>
            <p className="text-gray-600 mt-1">Manage your product inventory</p>
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
                placeholder="Search products by name, description, category, or price..."
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
                Found {filteredProducts.length} product
                {filteredProducts.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider max-sm:hidden">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider max-sm:hidden">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <svg
                            className="w-12 h-12 text-gray-400 mb-4"
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
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {searchQuery
                              ? "No Products Found"
                              : "No Products Yet"}
                          </h3>
                          <p className="text-gray-600">
                            {searchQuery
                              ? "Try adjusting your search terms"
                              : "Start by adding your first product"}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-3">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                              <Image
                                src={product.image[0]}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                width={64}
                                height={64}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {product.name}
                              </p>
                              <p className="text-sm text-gray-500 truncate max-w-xs">
                                {product.description}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3 max-sm:hidden">
                          <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-emerald-50 text-emerald-900">
                            {CATEGORIES.find(
                              (cat) => cat.id === product.category
                            )?.name || product.category}
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-gray-900">
                              ৳{product.offerPrice}
                            </span>
                            <span className="text-xs text-gray-500 line-through">
                              ৳{product.price}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-3 max-sm:hidden">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() =>
                                router.push(`/product/${product._id}`)
                              }
                              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                              title="View Product"
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
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </svg>
                              <span className="ml-2">View</span>
                            </button>
                            <button
                              onClick={() => handleEdit(product)}
                              className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                              title="Edit Product"
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
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                              <span className="ml-2">Edit</span>
                            </button>
                            <button
                              onClick={() => handleDelete(product._id)}
                              className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
                              title="Delete Product"
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
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                              <span className="ml-2">Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Edit Product
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Update product information
                  </p>
                </div>
                <button
                  onClick={() => setEditingProduct(null)}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <svg
                    className="w-6 h-6"
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
              </div>
            </div>

            <form onSubmit={handleUpdate} className="p-8 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Product Images
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  Upload new images or keep existing ones
                </p>
                <div className="grid grid-cols-4 gap-4">
                  {[...Array(4)].map((_, index) => (
                    <label
                      key={index}
                      htmlFor={`edit-image${index}`}
                      className="cursor-pointer group"
                    >
                      <input
                        onChange={(e) => {
                          const updatedFiles = [...editFiles];
                          updatedFiles[index] = e.target.files[0];
                          setEditFiles(updatedFiles);
                        }}
                        type="file"
                        id={`edit-image${index}`}
                        hidden
                        accept="image/*"
                      />
                      <div className="relative aspect-square border-2 border-dashed border-gray-300 rounded-lg overflow-hidden group-hover:border-rose-400 transition">
                        <Image
                          className="w-full h-full object-cover"
                          src={
                            editFiles[index]
                              ? URL.createObjectURL(editFiles[index])
                              : editingProduct.image[index] ||
                                assets.upload_area
                          }
                          alt=""
                          width={150}
                          height={150}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition">
                          <svg
                            className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-50 transition"
                    placeholder="Enter product name"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm({ ...editForm, description: e.target.value })
                    }
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-50 transition resize-none"
                    placeholder="Describe your product"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={editForm.category}
                    onChange={(e) =>
                      setEditForm({ ...editForm, category: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-50 transition"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Original Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                      ৳
                    </span>
                    <input
                      type="number"
                      value={editForm.price}
                      onChange={(e) =>
                        setEditForm({ ...editForm, price: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg pl-8 pr-4 py-3 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-50 transition"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Offer Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                      ৳
                    </span>
                    <input
                      type="number"
                      value={editForm.offerPrice}
                      onChange={(e) =>
                        setEditForm({ ...editForm, offerPrice: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg pl-8 pr-4 py-3 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-50 transition"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-slate-500 to-emerald-700 text-white font-semibold rounded-lg hover:from-emerald-700 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-sm transition"
                >
                  {saving ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Updating...
                    </span>
                  ) : (
                    "Update Product"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  disabled={saving}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 disabled:opacity-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;
