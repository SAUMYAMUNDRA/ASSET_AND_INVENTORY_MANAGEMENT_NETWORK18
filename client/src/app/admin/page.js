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
import Eventvendorname from "../components/event/Eventvendorname";
import Channelname from "../components/event/Channelname";
import ShowTypes from "../components/event/ShowTypes";

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
 const [activeTab, setActiveTab] = useState(null);     // ❌ no default tab
const [activeSubTab, setActiveSubTab] = useState(null); // ❌ no default sub-tab
  const [sidebarOpen, setSidebarOpen] = useState(false);
   const [user, setUser] = useState(null);        // stores user info
  const [userLoading, setUserLoading] = useState(true); // loading state
  
useEffect(() => {
  const fetchUser = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/users/current-user`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error("Failed to fetch user data.");

      const userData = await res.json();

      setUser({
        name: userData.user.name,
        email: userData.user.email,
        city: userData.user.city_name,
      });
    } catch (err) {
      console.error("Error fetching user data:", err);
      toast.error("Error fetching user data. Redirecting to login...");
      router.replace("/login");
    } finally {
      setUserLoading(false);
    }
  };

  fetchUser();
}, []); // ✅ runs only on page reload / mount

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
          setLoading(false);
        } else {
          setLoading(false);
        }
      } catch (err) {
        setLoading(false);
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
              <button
                onClick={() => setActiveSubTab("eventvendorname")}
                className={`pb-2 whitespace-nowrap ${
                  activeSubTab === "eventvendorname"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-600"
                }`}
              >
                Manage Vendors
              </button>  
 <button
                onClick={() => setActiveSubTab("channelname")}
                className={`pb-2 whitespace-nowrap ${
                  activeSubTab === "channelname"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-600"
                }`}
              >
                Manage Channels
              </button> 	
 <button
                onClick={() => setActiveSubTab("showtype")}
                className={`pb-2 whitespace-nowrap ${
                  activeSubTab === "showtype"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-600"
                }`}
              >
                Manage Show Types
              </button> 			 
            </div>          

            
            {activeSubTab === "manage-events" && <EventsTable />}
             {activeSubTab === "eventvendorname" && <Eventvendorname />}
       {activeSubTab === "channelname" && <Channelname/>}
	          {activeSubTab === "showtype" && <ShowTypes/>}

          </>
        )}
		      
      </main>
    </div>
  );
}
