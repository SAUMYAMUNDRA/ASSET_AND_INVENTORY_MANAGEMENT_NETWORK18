"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import Sidebar from "../components/admin/Sidebar";
import ManageUsers from "../components/admin/Users/ManageUsers";
import AddUser from "../components/admin/Users/AddUser";
import ManageStudios from "../components/studio-displays/ManageStudios";
import CreateStudios from "../components/studio-displays/CreateStudios";
import ManageInventory from "../components/asset-inventory/ManageInventory";
import CreateInventory from "../components/asset-inventory/CreateInventory";
import Tracking from "../components/asset-inventory/Tracking";
import EventsTable from "../components/event/ManageEvents";

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("users");
  const [activeSubTab, setActiveSubTab] = useState("manage");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/admin/auth/verify`,
          {
            method: "POST",
            credentials: "include",
          }
        );
        if (res.status !== 200) {
          router.replace("/");
        } else {
          setLoading(false);
        }
      } catch (err) {
        router.replace("/");
      }
    };

    verifyAdmin();
  }, [router]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="flex text-gray-600 h-screen bg-gray-50">
      {/* Mobile toggle button */}
      <button
        className="p-3 lg:hidden fixed top-3 left-3 z-50 bg-blue-600 text-white rounded"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        ☰
      </button>

      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setActiveSubTab={setActiveSubTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main content */}
      <main className="flex-1 p-6 overflow-y-auto bg-white relative">
        {/* Go Back to Home button */}
        <button
          onClick={() => router.push("/home")}
          className="mb-3 px-3 py-1 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
        >
          ← Go Back to Home
        </button>

        <img
          src="/NW18.png"
          alt="Network18 Logo"
          className="h-16  mb-3"
        />

        {/* Users tab */}
        {activeTab === "users" && (
          <>
            <div className="flex gap-4 border-b mb-4 overflow-x-auto">
              <button
                onClick={() => setActiveSubTab("manage")}
                className={`pb-2 whitespace-nowrap ${
                  activeSubTab === "manage"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-600"
                }`}
              >
                Manage Users
              </button>
              <button
                onClick={() => setActiveSubTab("add")}
                className={`pb-2 whitespace-nowrap ${
                  activeSubTab === "add"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-600"
                }`}
              >
                Add User
              </button>
            </div>

            {activeSubTab === "manage" && <ManageUsers />}
            {activeSubTab === "add" && <AddUser />}
          </>
        )}

        {/* Studios tab */}
        {activeTab === "studio" && (
          <>
            <div className="flex gap-4 border-b mb-4 overflow-x-auto">
              <button
                onClick={() => setActiveSubTab("manage-studio")}
                className={`pb-2 whitespace-nowrap ${
                  activeSubTab === "manage-studio"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-600"
                }`}
              >
                Manage Studios
              </button>
              <button
                onClick={() => setActiveSubTab("create-studio")}
                className={`pb-2 whitespace-nowrap ${
                  activeSubTab === "create-studio"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-600"
                }`}
              >
                Create Studio
              </button>
            </div>

            {activeSubTab === "manage-studio" && <ManageStudios is_admin={true} />}
            {activeSubTab === "create-studio" && <CreateStudios />}
          </>
        )}

        {/* Inventory tab */}
        {activeTab === "inventory" && (
          <>
            <div className="flex gap-4 border-b mb-4 overflow-x-auto">
              <button
                onClick={() => setActiveSubTab("create-inventory")}
                className={`pb-2 whitespace-nowrap ${
                  activeSubTab === "create-inventory"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-600"
                }`}
              >
                Manage Inventory
              </button>
              <button
                onClick={() => setActiveSubTab("manage-inventory")}
                className={`pb-2 whitespace-nowrap ${
                  activeSubTab === "manage-inventory"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-600"
                }`}
              >
                Create Inventory
              </button>
  <button
                onClick={() => setActiveSubTab("Tracking")}
                className={`pb-2 whitespace-nowrap ${
                  activeSubTab === "Tracking"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-600"
                }`}
              >
               Tracking
              </button>
            </div>          

            {activeSubTab === "create-inventory" && <ManageInventory is_admin={true} />}
            {activeSubTab === "manage-inventory" && <CreateInventory />}
             
             {activeSubTab === "Tracking" && <Tracking />}
          </>
        )}
        {activeTab === "events" && (
          <>
            <div className="flex gap-4 border-b mb-4 overflow-x-auto">
              <button
                onClick={() => setActiveSubTab("manage-events")}
                className={`pb-2 whitespace-nowrap ${
                  activeSubTab === "manage-events"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-600"
                }`}
              >
                Manage Events
              </button>
             
            </div>          

            
            {activeSubTab === "manage-events" && <ManageEvents />}
             
          </>
        )}
      </main>
    </div>
  );
}
