"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { toast } from "react-hot-toast";

const normalizeItems = (items = []) => {
  // Keep all items with positive quantity
  // Don't filter out items with null products
  return (items || []).filter(
    (item) => item && item.quantity && item.quantity > 0
  );
};

const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const router = useRouter();
  const { user } = useUser();
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [currency, setCurrency] = useState("৳");
  const [isSeller, setIsSeller] = useState(false);
  const [appliedPromoCode, setAppliedPromoCode] = useState(null);
  const [promoDiscountPercent, setPromoDiscountPercent] = useState(0);

  // Fetch products from API
  const fetchProductData = async () => {
    try {
      const { data } = await axios.get("/api/product/list");
      if (data?.success) {
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  // Fetch user's cart
  const fetchCartData = async () => {
    try {
      const { data } = await axios.get("/api/cart/get", {
        withCredentials: true,
      });
      if (data?.success) {
        setCartItems(normalizeItems(data.items));
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  // Check if user is a seller
  const checkSellerStatus = async () => {
    if (!user?.id) {
      setIsSeller(false);
      return;
    }

    try {
      const { data } = await axios.get("/api/user/data?t=" + Date.now(), {
        withCredentials: true,
      });
      console.log("Seller status check response:", data);
      const sellerStatus =
        data?.isSeller || data?.user?.seller || data?.seller || false;
      console.log("Setting isSeller to:", sellerStatus);
      setIsSeller(sellerStatus);
    } catch (error) {
      console.error("Error checking seller status:", error);
      setIsSeller(false);
    }
  };

  // Add to cart
  const addToCart = async (productId, quantity = 1) => {
    if (!user) {
      toast.error("Please sign in to add items");
      return false;
    }

    if (!productId) {
      console.error("addToCart called with empty productId");
      toast.error("Product ID is missing");
      return false;
    }

    const cleanId = String(productId);
    console.log("[addToCart] Adding productId:", cleanId, "qty:", quantity);
    console.log("[addToCart] Current cartItems before API call:", cartItems);

    try {
      const { data } = await axios.post(
        "/api/cart/update",
        { productId: cleanId, quantity },
        { withCredentials: true }
      );
      console.log("[addToCart] API response:", {
        success: data?.success,
        itemsCount: data.items?.length,
        items: data.items,
        cart: data.cart,
      });
      if (data?.success) {
        const normalizedItems = normalizeItems(data.items);
        console.log("[addToCart] After normalize:", normalizedItems);
        setCartItems(normalizedItems);
        return true;
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add to cart");
    }
    return false;
  };

  // Update cart quantity (absolute set)
  const updateCartQuantity = async (cartItemId, quantity, productId) => {
    if (!cartItemId) {
      console.error("updateCartQuantity called with empty cartItemId");
      toast.error("Item ID is missing");
      return false;
    }

    const cleanId = String(cartItemId);
    console.log(
      "[updateCartQuantity] Updating cartItemId:",
      cleanId,
      "to qty:",
      quantity
    );

    try {
      const requestBody = { cartItemId: cleanId, quantity };

      // If productId is provided, include it for better tracking
      if (productId) {
        requestBody.productId = String(productId);
      }

      const { data } = await axios.post("/api/cart/update", requestBody, {
        withCredentials: true,
      });
      if (data?.success) {
        console.log(
          "[updateCartQuantity] Success, items count:",
          data.items?.length
        );
        setCartItems(normalizeItems(data.items));
        return true;
      }
    } catch (error) {
      console.error("Error updating cart:", error);
      toast.error("Failed to update cart");
    }
    return false;
  };

  // Get cart count
  const getCartCount = () => {
    return cartItems.reduce((total, item) => total + (item.quantity || 0), 0);
  };

  // Get cart total
  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const base = item.product?.offerPrice || item.product?.price || 0;
      const qty = item.quantity || 0;
      const discounted =
        promoDiscountPercent > 0
          ? Number((base * (1 - promoDiscountPercent / 100)).toFixed(2))
          : base;
      return total + discounted * qty;
    }, 0);
  };

  // Get cart amount (alias for getCartTotal for backward compatibility)
  const getCartAmount = () => {
    return getCartTotal();
  };

  const getCartSubtotalBeforePromo = () => {
    return cartItems.reduce((total, item) => {
      const price = item.product?.offerPrice || item.product?.price || 0;
      return total + price * (item.quantity || 0);
    }, 0);
  };

  const getEffectiveUnitPrice = (product) => {
    const base = product?.offerPrice || product?.price || 0;
    return promoDiscountPercent > 0
      ? Number((base * (1 - promoDiscountPercent / 100)).toFixed(2))
      : base;
  };

  const setAppliedPromo = (code, percent) => {
    setAppliedPromoCode(code || null);
    setPromoDiscountPercent(Math.max(0, Number(percent) || 0));
  };

  const clearAppliedPromo = () => {
    setAppliedPromoCode(null);
    setPromoDiscountPercent(0);
  };

  // Initialize on mount
  useEffect(() => {
    fetchProductData();
    fetchCartData();
    if (user) {
      checkSellerStatus();
    }
  }, [user]);

  const value = {
    products,
    cartItems,
    setCartItems,
    currency,
    user,
    router,
    isSeller,
    fetchProductData,
    fetchCartData,
    addToCart,
    updateCartQuantity,
    getCartCount,
    getCartTotal,
    getCartAmount,
    getCartSubtotalBeforePromo,
    getEffectiveUnitPrice,
    appliedPromoCode,
    promoDiscountPercent,
    setAppliedPromo,
    clearAppliedPromo,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppContextProvider");
  }
  return context;
};
