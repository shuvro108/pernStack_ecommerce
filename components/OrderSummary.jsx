// import { addressDummyData } from "@/assets/assets";
import { useAppContext } from "@/context/AppContext";
import { useAuth } from "@clerk/nextjs";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

const OrderSummary = () => {
  const { getToken } = useAuth();
  const {
    currency,
    router,
    getCartCount,
    getCartAmount,
    user,
    cartItems,
    setCartItems,
  } = useAppContext();
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [userAddresses, setUserAddresses] = useState([]);
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promos, setPromos] = useState([]);
  const [promosLoading, setPromosLoading] = useState(false);

  // Fetch promos from database
  const fetchPromos = async () => {
    try {
      setPromosLoading(true);
      const { data } = await axios.get("/api/admin/promo");
      if (data?.success && Array.isArray(data.promos)) {
        setPromos(data.promos);
      }
    } catch (err) {
      console.error("Failed to fetch promos", err);
    } finally {
      setPromosLoading(false);
    }
  };

  // Get discount for a code
  const getPromoDiscount = (code) => {
    const promo = promos.find((p) => p.code === code);
    return promo ? promo.discount : null;
  };

  const subtotal = getCartAmount();
  const promoDiscount = appliedPromo ? getPromoDiscount(appliedPromo) : null;
  const discountAmount = promoDiscount
    ? Math.floor((subtotal * promoDiscount) / 100)
    : 0;
  const taxableAmount = Math.max(subtotal - discountAmount, 0);
  const taxAmount = Math.floor(taxableAmount * 0.02);
  const totalAmount = taxableAmount + taxAmount;

  const applyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) {
      toast.error("Enter a promo code first.");
      return;
    }
    const discount = getPromoDiscount(code);
    if (discount === null) {
      toast.error("Invalid or expired promo code.");
      setAppliedPromo(null);
      return;
    }
    if (subtotal <= 0) {
      toast.error("Add items to your cart before applying a code.");
      return;
    }
    setAppliedPromo(code);
    toast.success(`Promo ${code} applied: ${discount}% off`);
  };

  const fetchUserAddresses = async () => {
    // setUserAddresses(addressDummyData);
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/user/get-address", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (data?.success) {
        setUserAddresses(data.addresses);
        if (data.addresses.length > 0) {
          setSelectedAddress(data.addresses[0]);
        }
      } else {
        toast.error(
          data?.message || "No addresses found. Please add an address."
        );
      }
    } catch (error) {
      toast.error(
        error?.message || "Failed to fetch addresses. Please try again."
      );
    }
  };

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    setIsDropdownOpen(false);
  };

  const createOrder = async () => {
    try {
      if (!selectedAddress) {
        toast.error("Please select an address to proceed.");
        return;
      }
      let cartItemsArray = cartItems
        .map((item) => ({
          product: item.product?._id || item._id,
          quantity: item.quantity,
        }))
        .filter((item) => item.product && item.quantity > 0);

      if (cartItemsArray.length === 0) {
        toast.error("Your cart is empty. Please add items to place an order.");
        return;
      }

      const token = await getToken();
      const { data } = await axios.post(
        "/api/order/create",
        {
          items: cartItemsArray,
          // Prisma addresses use `id`, not `_id`
          address: selectedAddress.id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (data?.success) {
        toast.success(data?.message || "Order placed successfully.");
        setCartItems([]);
        router.push("/order-placed");
      } else {
        toast.error(
          data?.message || "Failed to place order. Please try again."
        );
      }
    } catch (error) {
      toast.error(error?.message || "Failed to place order. Please try again.");
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserAddresses();
    }
    fetchPromos();
  }, [user]);

  return (
    <div className="w-full md:w-96 bg-gray-500/5 p-5">
      <h2 className="text-xl md:text-2xl font-medium text-gray-700">
        Order Summary
      </h2>
      <hr className="border-gray-500/30 my-5" />
      <div className="space-y-5">
        <div>
          <label className="text-base font-medium uppercase text-gray-600 block mb-2">
            Select Address
          </label>
          <div className="relative inline-block w-full text-sm border">
            <button
              className="peer w-full text-left px-4 pr-2 py-2 bg-white text-gray-700 focus:outline-none"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span>
                {selectedAddress
                  ? `${selectedAddress.fullName}, ${selectedAddress.area}, ${selectedAddress.city}, ${selectedAddress.state}`
                  : "Select Address"}
              </span>
              <svg
                className={`w-5 h-5 inline float-right transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-0" : "-rotate-90"
                }`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="#6B7280"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {isDropdownOpen && (
              <ul className="absolute w-full bg-white border shadow-md mt-1 z-10 py-1.5">
                {userAddresses.map((address, index) => (
                  <li
                    key={index}
                    className="px-4 py-2 hover:bg-gray-500/10 cursor-pointer"
                    onClick={() => handleAddressSelect(address)}
                  >
                    {address.fullName}, {address.area}, {address.city},{" "}
                    {address.state}
                  </li>
                ))}
                <li
                  onClick={() => router.push("/add-address")}
                  className="px-4 py-2 hover:bg-gray-500/10 cursor-pointer text-center"
                >
                  + Add New Address
                </li>
              </ul>
            )}
          </div>
        </div>

        <div>
          <label className="text-base font-medium uppercase text-gray-600 block mb-2">
            Promo Code
          </label>
          <div className="flex flex-col items-start gap-3">
            <input
              type="text"
              placeholder="Enter promo code"
              className="flex-grow w-full outline-none p-2.5 text-gray-600 border"
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value)}
            />
            <button
              type="button"
              onClick={applyPromo}
              className="btn btn-primary px-9 py-2"
              disabled={subtotal <= 0}
            >
              {appliedPromo ? "Applied" : "Apply"}
            </button>
            {appliedPromo && (
              <p className="text-sm text-emerald-700">
                {appliedPromo} applied · {getPromoDiscount(appliedPromo)}% off
              </p>
            )}
          </div>
        </div>

        <hr className="border-gray-500/30 my-5" />

        <div className="space-y-4">
          <div className="flex justify-between text-base font-medium">
            <p className="uppercase text-gray-600">Items {getCartCount()}</p>
            <p className="text-gray-800">
              {currency}
              {subtotal}
            </p>
          </div>
          {appliedPromo && discountAmount > 0 && (
            <div className="flex justify-between text-sm text-emerald-700">
              <p>Promo discount ({getPromoDiscount(appliedPromo)}%)</p>
              <p>
                -{currency}
                {discountAmount}
              </p>
            </div>
          )}
          <div className="flex justify-between">
            <p className="text-gray-600">Shipping Fee</p>
            <p className="font-medium text-gray-800">Free</p>
          </div>
          <div className="flex justify-between">
            <p className="text-gray-600">Tax (2%)</p>
            <p className="font-medium text-gray-800">
              {currency}
              {taxAmount}
            </p>
          </div>
          <div className="flex justify-between text-lg md:text-xl font-medium border-t pt-3">
            <p>Total</p>
            <p>
              {currency}
              {totalAmount}
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={createOrder}
        className="btn btn-primary w-full py-3 mt-5"
      >
        Place Order
      </button>
    </div>
  );
};

export default OrderSummary;
