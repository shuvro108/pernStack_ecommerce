"use client";
import Navbar from "@/components/seller/Navbar";
import Sidebar from "@/components/seller/Sidebar";
import React from "react";

const Layout = ({ children }) => {
  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      <div className="flex w-full">
        <Sidebar />
        <div className="flex-1 bg-gray-50">{children}</div>
      </div>
    </div>
  );
};

export default Layout;
