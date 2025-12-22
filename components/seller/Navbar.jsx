import React from "react";
import { assets } from "../../assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import { useClerk } from "@clerk/nextjs";

const Navbar = () => {
  const { router } = useAppContext();
  const { signOut } = useClerk();

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <div className="flex items-center px-6 md:px-8 py-3 justify-between bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <Image
          onClick={() => router.push("/")}
          className="w-40 lg:w-48 cursor-pointer hover:opacity-70 transition-opacity duration-200"
          src={assets.logo}
          alt="TerraCotta Logo"
        />
        <div className="hidden md:block h-6 w-px bg-gray-300"></div>
        <div className="hidden md:flex items-center gap-2 text-emerald-700">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a6 6 0 00-9-5.497A4 4 0 00-2 13v1h14z" />
          </svg>
          <span className="text-sm font-semibold text-gray-800">
            Shop Owner
          </span>
        </div>
      </div>
      <button
        onClick={handleLogout}
        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-all duration-200 shadow-sm hover:shadow-md hover-elevate focus-ring"
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
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
        <span className="hidden sm:inline">Logout</span>
      </button>
    </div>
  );
};

export default Navbar;
