"use client";

import { FaSignOutAlt, FaCog } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

export default function Topbar() {
  const router = useRouter();

  const { logout } = useAuth();

  const handleSignOut = () => {
    logout();
  };

  return (
    <header className="w-full h-16 bg-white border-b flex items-center justify-between px-6 shadow-sm">
      {/* Left side: Agency info */}
      <div className="text-lg font-semibold text-gray-800">
        Unity Homecare — <span className="text-blue-600">UCC45678</span>
      </div>

      {/* Right side: Settings + Sign Out */}
      <div className="flex items-center space-x-6">
        <button
          onClick={() => router.push("/settings")}
          className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition"
        >
          <FaCog />
          <span>Settings</span>
        </button>
        <button
          onClick={handleSignOut}
          className="flex items-center space-x-2 text-red-600 hover:text-red-800 transition"
        >
          <FaSignOutAlt />
          <span>Sign Out</span>
        </button>
      </div>
    </header>
  );
}
