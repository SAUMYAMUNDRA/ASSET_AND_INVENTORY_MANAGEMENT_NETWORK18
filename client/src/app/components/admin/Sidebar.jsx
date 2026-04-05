"use client";
import { useState, useEffect } from "react";

export default function Sidebar({
  activeTab,
  setActiveTab,
  setActiveSubTab,
  sidebarOpen,
  setSidebarOpen,
}) {
  const [user, setUser] = useState(null);        
  const [userLoading, setUserLoading] = useState(true);

  useEffect(() => {
  const fetchUser = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/users/current-user`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error("Failed to fetch user data.");
      const data = await res.json();

      setUser({
        name: data.user.name,
        email: data.user.email,
        city: data.user.city_name,
        studio_display: Boolean(data.user.studio_display),
        asset_inventory: Boolean(data.user.asset_inventory),
        event_report: Boolean(data.user.event_report),
        access_name: data.user.access_name || []
      });
    } catch (err) {
      console.error("Error fetching user data:", err);
    } finally {
      setUserLoading(false);
    }
  };

  fetchUser();
}, []);


  // ✅ Build menu dynamically based on user flags
 const getMenuItems = () => {
  if (!user) return [];

  const allItems = [
    { id: "users", label: "Users", show: true },
    { id: "studio", label: "Studio", show: user.studio_display },
    { id: "inventory", label: "Inventory", show: user.asset_inventory },
    { id: "events", label: "Events", show: user.event_report },
  ];

  // Filter by both the boolean flag AND access_name array
  return allItems.filter(
    (item) =>
      item.show && user.access_name && user.access_name.includes(item.id)
  );
};


  return (
    <>
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static top-0 left-0 h-full w-40 bg-white shadow-md z-50 transform 
        transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="p-6 text-lg font-bold border-b">Admin</div>

        {/* Show user info */}
        {!userLoading && user && (
          <div className="p-4 border-b text-sm text-gray-700">
            {user.city && <p className="font-bold ml-3">City: {user.city}</p>}
          </div>
        )}

        {/* ✅ Dynamic menu rendering */}
        <nav className="flex flex-col p-4">
          {!userLoading &&
            getMenuItems().map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setActiveSubTab(
                    item.id === "users"
                      ? "manage"
                      : item.id === "studio"
                      ? "manage-studio"
                      : item.id === "inventory"
                      ? "create-inventory"
                      : item.id === "events"
                      ? "manage-events"
                      : ""
                  );
                  setSidebarOpen(false); // auto-close on mobile
                }}
                className={`p-3 rounded mb-2 text-left ${
                  activeTab === item.id
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {item.label}
              </button>
            ))}
        </nav>
      </aside>
    </>
  );
}
