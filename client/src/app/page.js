"use client";

import React, { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/users/current-user`,
          { credentials: "include" } 
        );
        if (res.ok) {
          router.replace("/home");
        }
      } catch (err) {
        console.error("User check failed:", err);
      }
    };
    checkUser();
  }, [router]);

  const handleLogin = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/auth/login`,
        {
          method: "POST",
		  credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: form.email,
            password: form.password,
          }),
        }
      );


		
      const data = await res.json();
      if (!res.ok) {
         toast.error(data.error, { id: "global-toast" });
		 return;
      }
      // Show toast on success
	  
      toast.success(data.message, { id: "global-toast" });
      router.push("/home");


    } catch (err) {
      toast.error(err.message || "Something went wrong ❌", { id: "global-toast" });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"style={{ backgroundImage: "url('/bg.jpeg')" }}>
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        {/* Logo & Title */}
        <div className="text-center mb-6">
          <img
            src="/NW18.png"
            alt="Network18 Logo"
            className="h-16 mx-auto mb-4"
          />
          <h2 className="text-2xl font-bold text-gray-900">
            Login to Event Equipment System
          </h2>
          <p className="text-gray-600 mt-2">Enter your Network18 credentials</p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-600"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) =>
                  setForm((f) => ({ ...f, password: e.target.value }))
                }
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-600 "
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 font-medium"
          >
            Sign In
          </button>
        </div>

        {/* Optional Forgot Password */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <button
            className="text-blue-600 hover:underline"
            onClick={() => alert("PLEASE CONTACT ADMIN!")}
          >
            Forgot password?
          </button>
        </div>
      </div>
    </div>
  );
}
