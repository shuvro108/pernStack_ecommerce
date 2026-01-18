import React from "react";
import Link from "next/link";
import { assets } from "../../assets/assets";
import Image from "next/image";
import { usePathname } from "next/navigation";

const SideBar = () => {
  const pathname = usePathname();
  const menuItems = [
    { name: "Add Product", path: "/seller", icon: assets.add_icon },
    {
      name: "Product List",
      path: "/seller/product-list",
      icon: assets.product_list_icon,
    },
    { name: "Orders", path: "/seller/orders", icon: assets.order_icon },
    {
      name: "AI Insights",
      path: "/seller/ai-insights",
      icon: assets.add_icon, // Using add_icon as placeholder - you can add a custom AI icon
      badge: "AI",
    },
    {
      name: "Newsletter",
      path: "/seller/send-newsletter",
      icon: assets.email_icon || assets.add_icon,
    },
    {
      name: "Promo Codes",
      path: "/admin/promo",
      icon: assets.add_icon,
    },
  ];

  return (
    <div className="md:w-64 w-20 bg-white border-r border-gray-200 min-h-screen py-8 px-3 md:px-5 flex flex-col gap-0.5 sticky left-0 top-20 shadow-sm">
      <div className="mb-8 px-3 hidden md:block">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
          Navigation
        </h3>
      </div>
      {menuItems.map((item) => {
        const isActive = pathname === item.path;

        return (
          <Link href={item.path} key={item.name} passHref>
            <div
              className={`flex items-center py-3 px-3.5 gap-3.5 rounded-lg transition-all duration-200 group cursor-pointer border-l-4 hover-elevate ${
                isActive
                  ? "bg-emerald-50 text-emerald-700 border-l-emerald-600 shadow-sm"
                  : "text-gray-600 border-l-transparent hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                  isActive
                    ? "bg-emerald-100"
                    : "bg-gray-100 group-hover:bg-gray-200"
                }`}
              >
                {item.badge === "AI" ? (
                  <svg
                    className={`w-5 h-5 ${isActive ? "text-emerald-700" : "text-gray-600"}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"></path>
                  </svg>
                ) : (
                  <Image
                    src={item.icon}
                    alt={`${item.name.toLowerCase()}_icon`}
                    className="w-5 h-5 object-contain"
                  />
                )}
              </div>
              <div className="flex items-center gap-2 flex-1">
                <p
                  className={`md:block hidden font-medium text-sm transition-all ${
                    isActive
                      ? "text-emerald-700 font-semibold"
                      : "text-gray-700"
                  }`}
                >
                  {item.name}
                </p>
                {item.badge && (
                  <span className="hidden md:inline-block px-2 py-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold rounded-full">
                    {item.badge}
                  </span>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default SideBar;
