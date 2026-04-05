"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function Channelname() {
  const [channelName, setChannelName] = useState("");
  const [channelType, setChannelType] = useState("Network"); // default type
  const [channels, setChannels] = useState([]);

  const channelTypes = [
    "Network",
    "National",
    "Buiseness",
    "Digital",
    "HSM",
    "Reigonal"
  ];

  const fetchChannels = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/assetinventory/channel/get-channels`,
        { credentials: "include" }
      );
      if (res.ok) {
        const data = await res.json();
        setChannels(data);
      } else {
        toast.error("❌ Failed to fetch channels");
      }
    } catch (err) {
      console.error("Error fetching channels:", err);
      toast.error("⚠️ Server error while fetching channels");
    }
  };

  useEffect(() => {
    fetchChannels();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this channel?")) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/assetinventory/channel/delete-channel/${id}`,
        { method: "DELETE", credentials: "include" }
      );
      if (res.ok) {
        toast.success("✅ Channel deleted successfully!");
        fetchChannels();
      } else {
        const error = await res.json();
        toast.error(`❌ Failed: ${error.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error deleting channel:", error);
      toast.error("⚠️ Server error.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!channelName.trim()) {
      toast.error("Channel name is required!");
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/assetinventory/channel/create-channel`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ channelName, channelType }), 
        }
      );

      if (res.ok) {
        toast.success("✅ Channel submitted successfully!");
        setChannelName("");
        setChannelType("Network"); // reset to default
        fetchChannels();
        return;
      }

      let message = "Unknown error";
      try {
        const data = await res.json();
        message = data?.message || data?.error || message;
      } catch {
        const text = await res.text();
        if (text) message = text;
      }
      toast.error(`❌ Failed: ${message}`);
    } catch (error) {
      console.error("Error submitting channel:", error);
      toast.error("⚠️ Server error.");
    }
  };

  return (
    <div className="bg-blue-50 p-6 rounded-lg shadow-md w-full">
      <form onSubmit={handleSubmit} className="bg-blue-50 p-6 rounded-lg shadow-md w-full">
        <div className="mb-4">
          <label htmlFor="channelName" className="block text-sm font-medium text-gray-700 mb-1">
            Channel name:<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="channelName"
            name="channelName"
            value={channelName}
            onChange={(e) => setChannelName(e.target.value)}
            placeholder="Enter channel name"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="channelType" className="block text-sm font-medium text-gray-700 mb-1">
            Channel type:<span className="text-red-500">*</span>
          </label>
          <select
            id="channelType"
            name="channelType"
            value={channelType}
            onChange={(e) => setChannelType(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          >
            {channelTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
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

      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">All Vendors</h2>
        <ul className="space-y-2">
          {channels.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between bg-white px-3 py-2 rounded shadow-sm"
            >
              <span className="text-gray-800">{c.channel_name} ({c.channel_type})</span>
              <button
                onClick={() => handleDelete(c.id)}
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
