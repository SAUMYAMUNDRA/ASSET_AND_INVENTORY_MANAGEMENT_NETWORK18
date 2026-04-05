"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function LogoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async (type) => {
    if (type === "all") {
      const confirmLogout = window.confirm(
        "Are you sure you want to logout from ALL devices?"
      );
      if (!confirmLogout) return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/auth/logout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ logout_type: type }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Logout failed", { id: "global-toast" });
        setLoading(false);
        return;
      }

      toast.success(data.message || "Logged out successfully", {
        id: "global-toast",
      });
      router.push("/"); // redirect to homepage after logout
    } catch (err) {
      toast.error(err.message || "Something went wrong ❌", {
        id: "global-toast",
      });
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-6 bg-gray-50">
      <h2 className="text-2xl font-semibold text-gray-800">Logout</h2>
      <p className="text-gray-600">
        Do you want to logout of all devices or just this one?
      </p>

      <div className="flex gap-4">
        {/* Current Device Logout */}
        <button
          className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
          onClick={() => handleLogout("single")}
          disabled={loading}
        >
          Current Device
        </button>

        {/* All Devices Logout */}
        <button
          className="px-6 py-2 bg-red-800 text-white rounded hover:bg-red-900 disabled:opacity-50"
          onClick={() => handleLogout("all")}
          disabled={loading}
        >
          All Devices
        </button>

        {/* Cancel Button */}
        <button
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          onClick={() => router.push("/home")}
          disabled={loading}
        >
          Cancel
        </button>
      </div>

      {loading && <p className="text-gray-500">Processing logout...</p>}
    </div>
  );
}
