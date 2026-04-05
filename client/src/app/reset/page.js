"use client";
import { useState } from "react";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const [form, setForm] = useState({ currentpassword: "", newpassword: "", confirmpassword: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Simple validations
    if (form.newpassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (form.newpassword !== form.confirmpassword) {
      toast.error("New password and confirmation do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/api/users/resetuser-pass`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentpassword: form.currentpassword,
          newpassword: form.newpassword,
        }),
      });

      if (!res.ok) {
		  const data = await res.json()
		  toast.error(data.error);
		  return;
	  }
      toast.success("Password reset successfully ✅");
      setForm({ currentpassword: "", newpassword: "", confirmpassword: "" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to reset password ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50 text-gray-500">
      <div className="bg-white p-6 rounded shadow-md w-96">
	            <img
            src="/NW18.png"
            alt="Network18 Logo"
            className="h-16 mx-auto mb-1"
          />
        <h2 className="text-xl font-semibold mb-4">Reset Password</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Current Password</label>
            <input
              type="password"
              value={form.currentpassword}
              onChange={(e) => setForm({ ...form, currentpassword: e.target.value })}
              className="w-full border p-2 rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">New Password</label>
            <input
              type="password"
              value={form.newpassword}
              onChange={(e) => setForm({ ...form, newpassword: e.target.value })}
              className="w-full border p-2 rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Confirm New Password</label>
            <input
              type="password"
              value={form.confirmpassword}
              onChange={(e) => setForm({ ...form, confirmpassword: e.target.value })}
              className="w-full border p-2 rounded"
              required
            />
          </div>
          <button
            type="submit"
            className={`w-full py-2 rounded text-white ${loading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"}`}
            disabled={loading}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
