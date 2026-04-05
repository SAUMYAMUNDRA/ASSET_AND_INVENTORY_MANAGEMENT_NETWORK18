"use client";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

import { useState, useEffect } from "react";
import {Wrench, Download, Pencil, Trash2, Check, X } from "lucide-react";
import { toast } from "sonner";

export default function ManageInventory({ is_admin = false }) {
    const [loadingId, setLoadingId] = useState(null);
  const [assets, setAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchModel, setSearchModel] = useState("");
const [searchSerial, setSearchSerial] = useState("");
  const [locationFilter, setLocationFilter] = useState("All Locations");
  const [locations, setLocations] = useState([]);
  const[statusFilter,setStatusFilter]=useState("All Status")
  // State for in-line editing, similar to ManageStudios
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

const handleMaintenanceToggle = async (asset) => {
  const isMaintenance = asset.status === "Maintenance";

  const confirmAction = window.confirm(
    isMaintenance
      ? "Do you want to bring this item back from maintenance?"
      : "Do you want to send this item to maintenance?"
  );

  if (!confirmAction) return;

  setLoadingId(asset.id);

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/assetinventory/to-maintenance/${asset.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...asset,
          status: isMaintenance ? "Available" : "Maintenance",
        }),
      }
    );

    if (res.ok) {
      toast.success(
        isMaintenance
          ? "✅ Asset brought back from maintenance!"
          : "✅ Asset sent to maintenance!"
      );
      fetchAssets(); // refresh table
    } else {
      toast.error("❌ Failed to update asset status.");
    }
  } catch (err) {
    toast.error("⚠️ Error updating asset status.");
    console.error(err);
  }

  setLoadingId(null);
};



  const fetchAssets = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/assetinventory/get-inventory`,
        { credentials: "include" }
      );
      if (res.ok) {
        const data = await res.json();
        const inventories = Array.isArray(data.inventories)
          ? data.inventories
          : [];
        setAssets(inventories);
        setFilteredAssets(inventories);

        // Extract unique locations
        const uniqueLocations = [...new Set(inventories.map((a) => a.location))];
        setLocations(uniqueLocations);
      } else {
        console.error("❌ Failed to fetch assets");
      }
    } catch (err) {
      console.error("⚠️ Error fetching assets:", err);
    }
  };


// ...


const handleExportExcel = async () => {
  if (!filteredAssets || filteredAssets.length === 0) {
    toast.error("⚠️ No data available to export.");
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Assets");

  // ✅ Header row
worksheet.addRow([
  "SNO",
  "MATERIAL",
  "STATUS",
  "LOCATION",
  "MAKE",
  "MODEL",
  "SERIAL NO",
  "ASSET TAG",  // ✅ New column
]);

  const headerRow = worksheet.getRow(1);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4B5563" }, // Tailwind gray-700
    };
  });

  // ✅ Data rows
filteredAssets.forEach((a, idx) => {
  const row = worksheet.addRow([
    idx + 1,
    a.material,
    a.status,
    a.location,
    a.make,
    a.model,
    a.serial_no,
    a.asset_tag,  // ✅ New column
  ]);

    // Apply color to STATUS cell
    const statusCell = row.getCell(3);
    if (a.status === "Available") {
      statusCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFC6EFCE" }, // light green
      };
    } else if (a.status === "Unavailable") {
      statusCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFFC7CE" }, // light red
      };
    } else if (a.status === "Maintenance") {
      statusCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFFEB9C" }, // light yellow
      };
    }
  });

  // ✅ Save as Excel
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, "asset_inventory.xlsx");
};



  useEffect(() => {
    fetchAssets();
  }, []);



  useEffect(() => {
    let results = assets;
    if (searchTerm) {
      results = results.filter((a) =>
      a.material?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||  // ✅ Add this
      a.serial_no?.toLowerCase().includes(searchTerm.toLowerCase()) // ✅ Add this
      );
    }
    if (locationFilter !== "All Locations") {
      results = results.filter((a) => a.location === locationFilter);
    }
    if (statusFilter !== "All Status") {
      results = results.filter((a) => a.status === statusFilter);
    }
    setFilteredAssets(results);
}, [searchTerm, locationFilter, assets, statusFilter]);


  // ✅ Start editing a row
  const handleEditClick = (asset) => {
    setEditingId(asset.id); 
    setEditData({ ...asset });
  };

  // ✅ Cancel editing
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  // ✅ Handle changes in edit inputs
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Save the edited row
  const handleSaveEdit = async (assetId) => {
    if (!assetId) return;
    try {
      
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/assetinventory/edit-inventory/${assetId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(editData),
        }
      );

      if (res.ok) {
        toast.success("✅ Asset updated successfully!");
        setEditingId(null);
        fetchAssets(); // Refresh data to show changes
      } else {
        const errorData = await res.json();
        toast.error(`❌ Failed to update asset: ${errorData.error || 'Unknown error'}`);
        console.error("❌ Failed to update asset", errorData);
      }
    } catch (err) {
      toast.error("⚠️ An error occurred while updating the asset.");
      console.error("⚠️ Error updating asset:", err);
    }
  };


  // ✅ Delete Asset (using _id from your data)
  const handleDelete = async (assetId) => {
    if (!assetId) return;
    if (!confirm("Are you sure you want to delete this asset?")) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/assetinventory/delete-inventory/${assetId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (res.ok) {
        toast.success("✅ Asset deleted successfully!");
        fetchAssets();
      } else {
        toast.error("❌ Failed to delete asset.");
        console.error("❌ Failed to delete asset");
      }
    } catch (err) {
      toast.error("⚠️ Error deleting asset.");
      console.error("⚠️ Error deleting asset:", err);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow border mt-6 overflow-hidden">
      {/* Stats Section (unchanged) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
        <div className="bg-white shadow rounded-lg p-4 border">
          <p className="text-sm text-gray-500">TOTAL ASSETS</p>
          <p className="text-2xl font-bold text-gray-800">{assets.length}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4 border">
          <p className="text-sm text-gray-500">AVAILABLE</p>
          <p className="text-2xl font-bold text-green-600">
            {assets.filter((a) => a.status === "Available").length}
          </p>
        </div>
        <div className="bg-white shadow rounded-lg p-4 border">
          <p className="text-sm text-gray-500">CHECKED OUT</p>
          <p className="text-2xl font-bold text-red-600">
            {assets.filter((a) => a.status === "Unavailable").length}
          </p>
        </div>
        <div className="bg-white shadow rounded-lg p-4 border">
          <p className="text-sm text-gray-500">MAINTENANCE</p>
          <p className="text-2xl font-bold text-yellow-600">
            {assets.filter((a) => a.status === "Maintenance").length}
          </p>
        </div>
      </div>

      {/* Header (unchanged) */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-700">
          Asset Inventory ({filteredAssets.length} Items)
        </h2>
        <div className="flex gap-2">
          
          <button   onClick={handleExportExcel}  className="flex items-center gap-2 bg-purple-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-purple-700">
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* Search & Filter (unchanged) */}
      <div className="flex flex-col sm:flex-row items-center gap-3 p-4">
        <input
          type="text"
          placeholder="Search assets by material, model and serial number"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border rounded-lg px-3 py-2 w-full sm:flex-1 text-sm"
        />
       {/* Status Filter ✅ */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 w-full sm:w-auto text-sm"
        >
          <option>All Status</option>
          <option>Available</option>
          <option>Unavailable</option>
          <option>Maintenance</option>
        </select>

        <select
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 w-full sm:w-auto text-sm"
        >
          <option>All Locations</option>
          {locations.map((loc, idx) => (
            <option key={idx}>{loc}</option>
          ))}
        </select>
      </div>

      {/* Table with In-line Editing */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-t">
<thead className="bg-gray-800 text-white">
  <tr>
    <th className="p-3 text-left">SNO</th>
    <th className="p-3 text-left">MATERIAL</th>
    <th className="p-3 text-left">STATUS</th>
    <th className="p-3 text-left">LOCATION</th>
    <th className="p-3 text-left">MAKE</th>
    <th className="p-3 text-left">MODEL</th>
    <th className="p-3 text-left">SERIAL NO</th>
    <th className="p-3 text-left">ASSET TAG</th>  
    <th className="p-3 text-left">ACTIONS</th>
  </tr>
</thead>
          <tbody>
            {filteredAssets.length > 0 ? (
              filteredAssets.map((a, idx) => {
                const isEditing = editingId === a.id;
                return (
                 <tr key={a.id} className="border-t hover:bg-gray-50 transition-colors">
  <td className="p-3 text-gray-700 font-medium">{idx + 1}</td>

  {/* Material */}
  <td className="p-3 font-medium text-gray-800">
    {isEditing && is_admin ? (
      <input
        type="text"
        name="material
        "
        value={editData.material}
        onChange={handleEditChange}
        className="w-full border rounded px-2 py-1 text-sm"
      />
    ) : (
      a.material
    )}
  </td>

  {/* Status (editable only if Admin + not Unavailable) */}
  <td className="p-3">
    {isEditing  && a.status !== "Unavailable" ? (
      <select
        name="status"
        value={editData.status}
        onChange={handleEditChange}
        className="w-full border rounded px-2 py-1 text-sm bg-white"
      >
        <option>Available</option>
        <option>Maintenance</option>
		<option>Not in use</option>
      </select>
    ) : (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          a.status === "Available"
            ? "bg-green-100 text-green-800"
            : a.status === "Maintenance"
            ? "bg-yellow-200 text-yellow-800"
            : "bg-red-100 text-red-800"
        }`}
      >
        {a.status || "N/A"}
      </span>
    )}
  </td>

  {/* Location */}
  <td className="p-3 text-gray-600">
    {isEditing && is_admin ? (
      <input
        type="text"
        name="location"
        value={editData.location}
        onChange={handleEditChange}
        className="w-full border rounded px-2 py-1 text-sm"
      />
    ) : (
      a.location
    )}
  </td>

  {/* Make */}
  <td className="p-3 text-gray-600">
    {isEditing && is_admin ? (
      <input
        type="text"
        name="make"
        value={editData.make}
        onChange={handleEditChange}
        className="w-full border rounded px-2 py-1 text-sm"
      />
    ) : (
      a.make
    )}
  </td>

  {/* Model */}
  <td className="p-3 text-gray-600">
    {isEditing && is_admin ? (
      <input
        type="text"
        name="model"
        value={editData.model}
        onChange={handleEditChange}
        className="w-full border rounded px-2 py-1 text-sm"
      />
    ) : (
      a.model
    )}
  </td>

  {/* Serial Number */}
  <td className="p-3 text-gray-600 font-mono">
    {isEditing && is_admin ? (
      <input
        type="text"
        name="serial_no"
        value={editData.serial_no}
        onChange={handleEditChange}
        className="w-full border rounded px-2 py-1 text-sm"
      />
    ) : (
      a.serial_no
    )}
  </td>
{/* Asset Tag */}
<td className="p-3 text-gray-600">
  {isEditing && is_admin ? (
    <input
      type="text"
      name="asset_tag"
      value={editData.asset_tag || ""}
      onChange={handleEditChange}
      className="w-full border rounded px-2 py-1 text-sm"
    />
  ) : (
    a.asset_tag || "N/A"
  )}
</td>
  {/* Action Buttons */}
  <td className="p-3">
    <div className="flex gap-3">
      {isEditing ? (
        <>
          { (
            <button
              onClick={() => handleSaveEdit(a.id)}
              className="text-green-600 hover:text-green-800"
              title="Save"
            >
              <Check size={16} />
            </button>
          )}
          <button
            onClick={handleCancelEdit}
            className="text-gray-600 hover:text-gray-800"
            title="Cancel"
          >
            <X size={16} />
          </button>
        </>
      ) : (
        <>
          { is_admin &&  (
            <button
              onClick={() => handleEditClick(a)}
              className="text-blue-600 hover:text-blue-800"
              title="Edit Asset"
            >
              <Pencil size={16} />
            </button>
          )}
          {is_admin && (
            <button
              onClick={() => handleDelete(a.id)}
              className="text-red-500 hover:text-red-700"
              title="Delete Asset"
            >
              <Trash2 size={16} />
            </button>
          )}
          {a.status!=="Unavailable" && ( <button
                onClick={() => handleMaintenanceToggle(a)}
                disabled={loadingId === a.id}
                className="p-2 rounded hover:bg-yellow-100"
                title="Send To Maintenance"
              >
                <Wrench
                  className={`w-5 h-5 ${
                    a.status === "maintenance"
                      ? "text-yellow-600"
                      : "text-gray-600"
                  }`}
                />
              </button>
          )}
        </>
      )}
    </div>
  </td>
</tr>

                );
              })
            ) : (
              <tr>
                <td className="p-4 text-center text-gray-500" colSpan={8}>
                  No assets found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
