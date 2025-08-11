"use client";

import { FaSignOutAlt, FaCog } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { getLoggedInUser } from "@/lib/auth/authHelpers";

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
        {getLoggedInUser()?.agency?.name || "N/A"} —{" "}
        <span className="text-blue-600">
          {getLoggedInUser()?.name || "N/A"}
        </span>
        <span className="ml-4 text-sm text-gray-500">
          Agency ID: {getLoggedInUser()?.agency?.code || "N/A"}
        </span>
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
