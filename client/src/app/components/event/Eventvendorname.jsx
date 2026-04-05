"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function Eventvendorname() {
  const [vendorName, setVendorName] = useState("");
  const [vendors, setVendors] = useState([]);

  // ✅ Fetch vendors
  const fetchVendors = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/assetinventory/vendor/get-vendors`,
        { credentials: "include" }
      );
      if (res.ok) {
        const data = await res.json();
        setVendors(data);
      } else {
        toast.error("❌ Failed to fetch vendors");
      }
    } catch (err) {
      console.error("Error fetching vendors:", err);
      toast.error("⚠️ Server error while fetching vendors");
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleChange = (e) => {
    setVendorName(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!vendorName.trim()) {
      toast.error("❌ Vendor name is required!");
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/assetinventory/vendor/create-vendor`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ vendorName }),
        }
      );

      if (res.ok) {
        toast.success("✅ Vendor submitted successfully!");
        setVendorName("");
        fetchVendors(); // 🔄 Refresh
      } else {
        const error = await res.json();
        toast.error(`❌ Failed: ${error.message || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Error submitting vendor:", err);
      toast.error("⚠️ Server error.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this vendor?")) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/assetinventory/vendor/delete-vendor/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (res.ok) {
        toast.success("✅ Vendor deleted successfully!");
        fetchVendors(); // 🔄 Refresh list
      } else {
        const error = await res.json();
        toast.error(`❌ Failed: ${error.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Error deleting vendor:", err);
      toast.error("⚠️ Server error.");
    }
  };

  return (
    <div className="bg-blue-50 p-6 rounded-lg shadow-md w-full">
      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor="vendorName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Vendor name:<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="vendorName"
            name="vendorName"
            value={vendorName}
            onChange={handleChange}
            placeholder="Enter vendor name"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-blue-600 text-white font-bold px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Submit
          </button>
        </div>
      </form>

      {/* Vendor List */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">All Vendors</h2>
        <ul className="space-y-2">
          {vendors.map((v) => (
            <li
              key={v.id}
              className="flex items-center justify-between bg-white px-3 py-2 rounded shadow-sm"
            >
              <span className="text-gray-800">{v.vendor_name}</span>
              <button
                onClick={() => handleDelete(v.id)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
