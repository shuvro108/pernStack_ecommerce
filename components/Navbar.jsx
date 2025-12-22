"use client";
import React from "react";
import {
  assets,
  BagIcon,
  BoxIcon,
  CartIcon,
  HomeIcon,
  InfoIcon,
  ContactIcon,
} from "@/assets/assets";
import Link from "next/link";
import { useAppContext } from "@/context/AppContext";
import Image from "next/image";
import { useClerk, UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const { openSignIn } = useClerk();
  const { isSeller, router, user } = useAppContext();
  const pathname = usePathname();

  console.log("Navbar render - user:", !!user, "isSeller:", isSeller);

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 flex items-center justify-between px-6 md:px-16 lg:px-32 py-3 border-b border-gray-200 text-gray-700">
      <Image
        className="cursor-pointer w-40 md:w-48"
        onClick={() => router.push("/")}
        src={assets.logo}
        alt="logo"
      />
      <div className="flex items-center gap-4 lg:gap-8 max-md:hidden">
        <Link
          href="/"
          className={`link ${pathname === "/" ? "text-gray-900" : ""}`}
        >
          Home
        </Link>
        <Link
          href="/all-products"
          className={`link ${
            pathname === "/all-products" ? "text-gray-900" : ""
          }`}
        >
          Shop
        </Link>
        <Link
          href="/about"
          className={`link ${pathname === "/about" ? "text-gray-900" : ""}`}
        >
          About Us
        </Link>
        <Link
          href="/contact"
          className={`link ${pathname === "/contact" ? "text-gray-900" : ""}`}
        >
          Contact
        </Link>
        {user && isSeller && (
          <Link
            href="/seller"
            className={`link ${
              pathname.startsWith("/seller") ? "text-gray-900" : ""
            }`}
          >
            Shop Owner
          </Link>
        )}
      </div>

      <ul className="hidden md:flex items-center gap-4 ">
        {user ? (
          <UserButton>
            <UserButton.MenuItems>
              <UserButton.Link
                label="Cart"
                href="/cart"
                labelIcon={<CartIcon />}
              />
              <UserButton.Link
                label="My Orders"
                href="/my-orders"
                labelIcon={<BagIcon />}
              />
            </UserButton.MenuItems>
          </UserButton>
        ) : (
          <button
            onClick={openSignIn}
            className="flex items-center gap-2 hover:text-gray-900 transition hover-elevate focus-ring"
          >
            <Image src={assets.user_icon} alt="user icon" />
            Account
          </button>
        )}
      </ul>

      <div className="flex items-center md:hidden gap-3">
        {user && isSeller && (
          <button
            onClick={() => router.push("/seller")}
            className="text-xs border px-4 py-1.5 rounded-full hover-elevate focus-ring"
          >
            Shop Owner
          </button>
        )}
        {user ? (
          <UserButton>
            <UserButton.MenuItems>
              <UserButton.Link label="Home" href="/" labelIcon={<HomeIcon />} />
              <UserButton.Link
                label="Shop"
                href="/all-products"
                labelIcon={<BoxIcon />}
              />
              <UserButton.Link
                label="About Us"
                href="/about"
                labelIcon={<InfoIcon />}
              />
              <UserButton.Link
                label="Contact"
                href="/contact"
                labelIcon={<ContactIcon />}
              />
              <UserButton.Link
                label="Cart"
                href="/cart"
                labelIcon={<CartIcon />}
              />
              <UserButton.Link
                label="My Orders"
                href="/my-orders"
                labelIcon={<BagIcon />}
              />
            </UserButton.MenuItems>
          </UserButton>
        ) : (
          <button
            onClick={openSignIn}
            className="flex items-center gap-2 hover:text-gray-900 transition hover-elevate focus-ring"
          >
            <Image src={assets.user_icon} alt="user icon" />
            Account
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
