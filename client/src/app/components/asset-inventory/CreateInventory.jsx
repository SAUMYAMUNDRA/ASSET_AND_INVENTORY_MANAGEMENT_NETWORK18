"use client";
import { useState } from "react";
import { toast } from "sonner";

export default function AssetForm({ onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    material: "",
    status: "Available",   // default
    location: "",
    make: "",
    model: "",
    serial: "",
    asset_tag: "",       
  });

  // handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/assetinventory/create-assetinventory`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),  
        }
      );

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "❌ Failed to create asset");
        return;
      }

      toast.success("✅ Asset created successfully!");
      if (onSuccess) onSuccess(data.asset);

      // reset form
      setFormData({
        material: "",
        status: "Available",
        location: "",
        make: "",
        model: "",
        serial: "",
        asset_tag: "",
      });
    } catch (err) {
      console.error("⚠️ Error creating asset:", err);
      toast.error(err.message || "Error creating asset");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-4">
        <input
          name="material"
          placeholder="Equipment Name/Material *"
          value={formData.material}
          onChange={handleChange}
          className="border rounded-lg px-3 py-2 text-sm"
          required
        />

        <input
          name="location"
          placeholder="Floor *"
          value={formData.location}
          onChange={handleChange}
          className="border rounded-lg px-3 py-2 text-sm"
          required
        />

        <input
          name="make"
          placeholder="Make *"
          value={formData.make}
          onChange={handleChange}
          className="border rounded-lg px-3 py-2 text-sm"
          required
        />

        <input
          name="model"
          placeholder="Model *"
          value={formData.model}
          onChange={handleChange}
          className="border rounded-lg px-3 py-2 text-sm"
          required
        />

        <input
          name="serial"
          placeholder="Serial Number *"
          value={formData.serial}
          onChange={handleChange}
          className="border rounded-lg px-3 py-2 text-sm"
          required
        />

        <input
          name="asset_tag"
          placeholder="Asset Tag *"
          value={formData.asset_tag}
          onChange={handleChange}
          className="border rounded-lg px-3 py-2 text-sm"
          required
        />
      </div>

      <div className="flex justify-end gap-3 mt-6">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border rounded-lg text-sm"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
        >
          + Add Equipment
        </button>
      </div>
    </form>
  );
}
