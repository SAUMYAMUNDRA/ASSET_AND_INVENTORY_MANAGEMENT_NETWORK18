"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ManageInventory from "../components/asset-inventory/ManageInventory";
import GatePass from "../components/asset-inventory/GatePass";
import MyGatePass from "../components/asset-inventory/MyGatePass";
import Tracking from "../components/asset-inventory/Tracking";

export default function EventAssetInventoryPage() {
  const router = useRouter();
  const [activeSubTab, setActiveSubTab] = useState("manage-inventory"); // default tab

  return (
    <main className="p-6 bg-gray-50 min-h-screen text-gray-700 overflow-auto relative">
      {/* Go Back Button */}
      <button
        onClick={() => router.push("/home")}
        className="fixed top-2 left-4 px-3 py-1 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 z-50"
      >
        ← Go Back to Home
      </button>

      {/* Logo */}
      <div className="pt-0 ">
        <img src="/NW18.png" alt="Network18 Logo" className="h-16 mt-5" />
      </div>

      <h1 className="text-2xl font-semibold mb-6 text-center">
        Manage Inventory
      </h1>

      {/* Tabs */}
      <div className="flex gap-4 border-b mb-4 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab("manage-inventory")}
          className={`pb-2 whitespace-nowrap ${
            activeSubTab === "manage-inventory"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600"
          }`}
        >
          Manage Inventory
        </button>
        
        <button
          onClick={() => setActiveSubTab("gate-pass")}
          className={`pb-2 whitespace-nowrap ${
            activeSubTab === "gate-pass"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600"
          }`}
        >
          Gate Pass
        </button>
        <button
          onClick={() => setActiveSubTab("my-gate-pass")}
          className={`pb-2 whitespace-nowrap ${
            activeSubTab === "my-gate-pass"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600"
          }`}
        >
          My Gate Pass
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

      {/* Tab Content */}
      {activeSubTab === "manage-inventory" && <ManageInventory />}
      {activeSubTab === "gate-pass" && <GatePass />}
      {activeSubTab === "my-gate-pass" && <MyGatePass />}
	               {activeSubTab === "Tracking" && <Tracking />}


    </main>
  );
}
