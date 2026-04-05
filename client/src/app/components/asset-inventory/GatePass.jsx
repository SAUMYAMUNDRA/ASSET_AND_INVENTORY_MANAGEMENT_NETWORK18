"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function GatePass() {
  const [formData, setFormData] = useState({
    issued_to: "",
    employee_id: "",
    event_name: "",
    event_date: "",
    expected_return_date: "",
    equipment: [],
  });

  // --- State for User Data ---
  const [user, setUser] = useState({ name: "", email: "" });
  const [userLoading, setUserLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState("");
  const [assets, setAssets] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modelFilter, setModelFilter] = useState("");
const [locationFilter, setLocationFilter] = useState("");
  const [selectedEquip, setSelectedEquip] = useState(null); // select

  // Enhanced filtering that searches across multiple fields
  const filteredAssets = assets.filter((a) => {
    const matchesStatus = a.status === "Available";
    
    // Global search across multiple fields
    const searchTerm = searchFilter.toLowerCase();
    const matchesSearch = searchTerm === "" || 
      a.material?.toLowerCase().includes(searchTerm) ||
      a.make?.toLowerCase().includes(searchTerm) ||
      a.model?.toLowerCase().includes(searchTerm) ||
      a.serial_no?.toLowerCase().includes(searchTerm);
    
    // Location specific filter
    const matchesLocation = locationFilter === "" ||
      a.location?.toLowerCase().includes(locationFilter.toLowerCase());
    
    return matchesStatus && matchesSearch && matchesLocation;
  });
  // --- Fetch User Data on Component Mount ---
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/api/users/current-user`, {
          credentials: "include",
        });
        
        if (!res.ok) throw new Error("Failed to fetch user data.");
        const userData = await res.json();
        
        // Set the user state with the fetched email and name
        if (userData && userData.user) {
           setUser({ name: userData.user.name, email: userData.user.email });
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        toast.error("Error fetching user data.");
      } finally {
        setUserLoading(false); // Done loading
      }
    };

    fetchUser();
  }, []); // Empty dependency array ensures this runs only once on mount
  
const generateGatePassPDF = async (pdfData, size = "A4") => {
  try {
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: size,
	  compress: true
    });

    // ===============================
    // Logo
    // ===============================
    const logo = new Image();
    logo.src = "/NW18.png";
    await new Promise((resolve) => { logo.onload = resolve; });

    pdf.addImage(logo, "PNG", 10, 8, 28, 12);

    // ===============================
    // Header
    // ===============================
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    pdf.text(
      "Network18 Media & Investments Ltd",
      pdf.internal.pageSize.getWidth() / 2,
      15,
      { align: "center" }
    );

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.text(
      "Event Equipment Gate Pass",
      pdf.internal.pageSize.getWidth() / 2,
      21,
      { align: "center" }
    );

    // ===============================
    // Setup Columns
    // ===============================
    let y = 28;
    const leftColX = 12;
    const rightColX = pdf.internal.pageSize.getWidth() / 2 + 5;
    const labelGap = 24;

    pdf.setFontSize(7);

    // ===============================
    // Gate Pass Info
    // ===============================
    pdf.setFont("helvetica", "bold");
    pdf.text("Gate Pass ID:", leftColX, y);
    pdf.setFont("helvetica", "normal");
    pdf.text(pdfData.gate_pass_id || "-", leftColX + labelGap, y);

    pdf.setFont("helvetica", "bold");
    pdf.text("Issued By:", rightColX, y);
    pdf.setFont("helvetica", "normal");
    pdf.text(pdfData.user?.email || "-", rightColX + labelGap, y);
    y += 5;

    pdf.setFont("helvetica", "bold");
    pdf.text("Date:", leftColX, y);
    pdf.setFont("helvetica", "normal");
    pdf.text(pdfData.date || "-", leftColX + labelGap, y);

    pdf.setFont("helvetica", "bold");
    pdf.text("Department:", rightColX, y);
    pdf.setFont("helvetica", "normal");
    pdf.text(pdfData.department || "-", rightColX + labelGap, y);
    y += 5;

    pdf.setFont("helvetica", "bold");
    pdf.text("Time:", leftColX, y);
    pdf.setFont("helvetica", "normal");
    pdf.text(pdfData.time || "-", leftColX + labelGap, y);
    y += 6;

    // ===============================
    // Employee Details Box
    // ===============================
    const boxStartY = y;
    const boxHeight = 20; // reduced
    const boxWidth = pdf.internal.pageSize.getWidth() - 24;
    pdf.setFillColor(240, 240, 240);
    pdf.rect(leftColX, boxStartY, boxWidth, boxHeight, "F");
    y = boxStartY + 7;

    pdf.setFont("helvetica", "bold");
    pdf.text("Employee Details:", leftColX + 2, boxStartY + 4);

    pdf.text("Issued To:", leftColX + 2, y);
    pdf.setFont("helvetica", "normal");
    pdf.text(pdfData.issued_to || "-", leftColX + labelGap, y);

    pdf.setFont("helvetica", "bold");
    pdf.text("Event Name:", rightColX, y);
    pdf.setFont("helvetica", "normal");
    pdf.text(pdfData.event_name || "-", rightColX + labelGap, y);
    y += 5;

    pdf.setFont("helvetica", "bold");
    pdf.text("Employee ID:", leftColX + 2, y);
    pdf.setFont("helvetica", "normal");
    pdf.text(String(pdfData.employee_id) || "-", leftColX + labelGap, y);

    pdf.setFont("helvetica", "bold");
    pdf.text("Event Date:", rightColX, y);
    pdf.setFont("helvetica", "normal");
    pdf.text(pdfData.event_date || "-", rightColX + labelGap, y);
    y += 5;

    pdf.setFont("helvetica", "bold");
    pdf.text("Expected Return:", rightColX, y);
    pdf.setFont("helvetica", "normal");
    pdf.text(pdfData.expected_return_date || "-", rightColX + labelGap, y);

    y = boxStartY + boxHeight + 6;

    // ===============================
    // Equipment Table
    // ===============================
pdf.setFont("helvetica", "bold");
pdf.setFontSize(7);
pdf.text("Selected Equipment Items:", leftColX, y - 2);

if (pdfData.equipment && pdfData.equipment.length > 0) {
  const pageHeight = pdf.internal.pageSize.getHeight();
  const availableHeight = pageHeight - y - 40; // leave space for signatures

  // estimate row count and base row height
  const rowCount = pdfData.equipment.length + 1; // +1 for header
  let rowHeight = 6; // default row height
  let fontSize = 8;

  // shrink until it fits
  while (rowCount * rowHeight > availableHeight && fontSize > 4) {
    fontSize -= 0.5;
    rowHeight -= 0.3;
  }

  autoTable(pdf, {
    startY: y,
    head: [["S/NO.", "Material", "Make", "Model", "Serial No", "Qty"]],
    body: pdfData.equipment.map((eq, idx) => [
      idx + 1,
      eq.material,
      eq.make,
      eq.model,
      eq.serial_no,
      eq.qty || 1,
    ]),
    theme: "grid",
    styles: { fontSize, cellPadding: 0.5 },
    headStyles: {
      fillColor: [41, 49, 51],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize,
    },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { left: leftColX },
    tableWidth: "auto",
    rowPageBreak: "avoid", // force table to stay in current page
  });

  y = pdf.lastAutoTable.finalY + 8;
} else {
  y += 8;
}

    // ===============================
    // Signatures
    // ===============================
   

    const sigX1 = 10, sigX2 = 60, sigX3 = 110, lineWidth = 30;
    pdf.line(sigX1, y, sigX1 + lineWidth, y);
    pdf.line(sigX2, y, sigX2 + lineWidth, y);
    pdf.line(sigX3, y, sigX3 + lineWidth, y);

    y += 4;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.text("Engineer", sigX1, y);
    pdf.text("Supervisor", sigX2, y);
    pdf.text("Security", sigX3, y);
    y += 4;
    pdf.text("Date: _______", sigX1, y);
    pdf.text("Date: _______", sigX2, y);
    pdf.text("Date: _______", sigX3, y);

    // ===============================
    // Save
    // ===============================
    pdf.save(`GatePass_${pdfData.gate_pass_id || "unknown"}.pdf`);
  } catch (err) {
    console.error("❌ Gate Pass generation failed:", err);
    toast.error("Could not generate Gate Pass.");
  }
};


  const generatePDF = (size = "A5") => {
	  
    const now = new Date();
    const pdfData = {
      ...formData,
      gate_pass_id: `GP-${Date.now()}`,
      date: now.toLocaleDateString("en-GB"),
      time: now.toLocaleTimeString("en-GB"),
      // ✅ Pass the user object from state into the PDF data
      user: user,
      department: "Technical",
    };
    generateGatePassPDF(pdfData, size);
  };


const handleClear = () => {
  setFormData({
    issued_to: "",
    employee_id: "",
    event_name: "",
    event_date: "",
    expected_return_date: "",
    equipment: [], // ✅ reset equipment as well
  });
};

  // fetch assets function
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
      } else {
        console.error("❌ Failed to fetch assets");
      }
    } catch (err) {
      console.error("⚠️ Error fetching assets:", err);
    }
  };

  // when modal opens, fetch assets
  useEffect(() => {
    if (showModal) {
      fetchAssets();
    }
  }, [showModal]);

  // handle input change
  const handleChange = (e) => {
  const { name, value } = e.target;

  setFormData((prev) => {
    if (name === "event_date") {
      // Clear return date only when event date changes
      return { ...prev, event_date: value, expected_return_date: "" };
    }
    return { ...prev, [name]: value };
  });
};

  const handleSelectEquipment = (equip) => {
    setFormData((prev) => {
      const alreadySelected = prev.equipment.some((e) => e.id === equip.id);
      if (alreadySelected) {
        return {
          ...prev,
          equipment: prev.equipment.filter((e) => e.id !== equip.id),
        };
      } else {
        return {
          ...prev,
          equipment: [...prev.equipment, equip],
        };
      }
    });
  };

  const handleClearSelection = () => {
    setFormData((prev) => ({
      ...prev,
      equipment: [],
    }));
  };

  const handleSelectAll = () => {
    setFormData((prev) => ({
      ...prev,
      equipment: [...filteredAssets],
    }));
  };

  const handleClearFilters = () => {
    setSearchFilter("");
    setLocationFilter("");
  };

  const handleDone = () => {
    setShowModal(false);
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const payload = {
      ...formData,
      equipment: formData.equipment.map((eq) => eq.id),
    };
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/assetinventory/gatepass/create-gatepass`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      }
    );

    if (res.ok) {
      toast.success("✅ Gate Pass created successfully!");

      // Generate PDF **after successful submission**
      generatePDF();

      setFormData({
        issued_to: "",
        employee_id: "",
        event_name: "",
        event_date: "",
        expected_return_date: "",
        equipment: [],
      });
      setSelectedEquip(null);
    } else {
      const error = await res.json();
      toast.error(`❌ Failed: ${error.message || "Unknown error"}`);
    }
  } catch (err) {
    console.error("Error creating gate pass:", err);
    toast.error("⚠️ Server error while creating gate pass.");
  }
};


  return (
    <>
      {/* Main Form */}
 <form onSubmit={handleSubmit} className="bg-blue-50 p-6 rounded-lg shadow-md w-full">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          {/* Issued To */}
          <div>
            <label
              htmlFor="issued_to"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Issued To <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="issued_to"
              id="issued_to"
              placeholder="Enter name of person receiving equipment"
              value={formData.issued_to}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Employee ID */}
          <div>
            <label
              htmlFor="employee_id"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Employee ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="employee_id"
              id="employee_id"
              placeholder="Enter employee ID"
              value={formData.employee_id}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Event Name */}
          <div>
            <label
              htmlFor="event_name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Event Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="event_name"
              id="event_name"
              placeholder="Enter event name"
              value={formData.event_name}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Event Date */}
         <div>
  <label
    htmlFor="event_date"
    className="block text-sm font-medium text-gray-700 mb-1"
  >
    Event Date <span className="text-red-500">*</span>
  </label>
  <input
    type="date"
    name="event_date"
    id="event_date"
    value={formData.event_date}
    onChange={handleChange}
    required
    min={new Date().toISOString().split("T")[0]}
    className="w-full p-2 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
  />
</div>

{/* Expected Return Date */}
<div className="md:col-span-2">
  <label
    htmlFor="expected_return_date"
    className="block text-sm font-medium text-gray-700 mb-1"
  >
    Expected Return Date <span className="text-red-500">*</span>
  </label>
  <input
    type="date"
    name="expected_return_date"
    id="expected_return_date"
    value={formData.expected_return_date}
    onChange={handleChange}
    required
    min={formData.event_date || new Date().toISOString().split("T")[0]}
    className="w-full p-2 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
  />
</div>

          {/* Equipment Selection */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Equipment Selection
            </label>
            <div className="flex items-center justify-between w-full p-3 border border-gray-300 bg-white rounded-md shadow-sm">
            <div className="flex flex-wrap gap-2">
  {formData.equipment.length > 0 ? (
    formData.equipment.map((eq) => (
      <div
        key={eq.id}
        className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
      >
        <span>{eq.material}</span>
        <button
          type="button"
          onClick={() =>
            setFormData((prev) => ({
              ...prev,
              equipment: prev.equipment.filter((e) => e.id !== eq.id),
            }))
          }
          className="ml-1 text-red-500 hover:text-red-700"
        >
          ✕
        </button>
      </div>
    ))
  ) : (
    <span className="text-gray-500">No equipment selected</span>
  )}
</div>
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700"
              >
                + Select Equipment
              </button>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="mt-6 flex gap-3">
        
          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-blue-600 text-white font-bold px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Submit
          </button>
        </div>
      </form>
{/* Hidden Gate Pass Preview for PDF */}
<div
  id="gatepass-preview"
  style={{ position: "absolute", top: "-9999px", left: "-9999px", width: "794px", background: "#fff", padding: "20px" }}
>
  <h1 className="text-xl font-bold text-center mb-4">Gate Pass</h1>
  <p><strong>Issued To:</strong> {formData.issued_to}</p>
  <p><strong>Employee ID:</strong> {formData.employee_id}</p>
  <p><strong>Event:</strong> {formData.event_name}</p>
  <p><strong>Event Date:</strong> {formData.event_date}</p>
  <p><strong>Expected Return:</strong> {formData.expected_return_date}</p>

  <h2 className="mt-4 font-semibold">Equipment List</h2>
  <ul className="list-disc ml-5">
    {formData.equipment.map((eq, idx) => (
      <li key={idx}>
        {eq.material} (Serial: {eq.serial_no})
      </li>
    ))}
  </ul>
</div>

   {/* Modal Popup */}
{showModal && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-11/12 max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">
            Select Equipment for Gate Pass
          </h2>
          <button
            className="text-gray-500 hover:text-gray-700 text-xl font-bold"
            onClick={() => setShowModal(false)}
          >
            ✕
          </button>
        </div>

        {/* Filters Section */}
        <div className="p-4 border-b bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Equipment
              </label>
              <input
                type="text"
                placeholder="Search by material, make, model, or serial number..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Location
              </label>
              <input
                type="text"
                placeholder="Enter location..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          {/* Filter Actions */}
          <div className="flex justify-between items-center mt-3">
            <div className="text-sm text-gray-600">
              Showing {filteredAssets.length} of {assets.filter(a => a.status === "Available").length} available items
            </div>
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Equipment List */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredAssets.length > 0 ? (
            <div className="space-y-3">
              {filteredAssets.map((asset) => (
                <div
                  key={asset.id}
                  className={`border rounded-lg p-4 transition-all duration-200 cursor-pointer hover:shadow-md ${
                    formData.equipment.some((eq) => eq.id === asset.id)
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => handleSelectEquipment(asset)}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={formData.equipment.some((eq) => eq.id === asset.id)}
                      onChange={() => handleSelectEquipment(asset)}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="flex-1">
                      <div className="flex flex-wrap items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {asset.material}
                          </h3>
                          <div className="mt-1 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Serial:</span> {asset.serial_no}
                            </div>
                            <div>
                              <span className="font-medium">Location:</span> {asset.location}
                            </div>
                            <div>
                              <span className="font-medium">Make:</span> {asset.make}
                            </div>
                            <div>
                              <span className="font-medium">Model:</span> {asset.model}
                            </div>
                          </div>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-2">
                          {asset.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 text-lg mb-2">📦</div>
              <p className="text-gray-500 text-lg">No matching equipment found</p>
              <p className="text-gray-400 text-sm mt-1">
                Try adjusting your search criteria
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t bg-gray-50 gap-3">
          <div className="text-sm text-gray-600 order-2 sm:order-1">
            <span className="font-medium">{formData.equipment.length}</span> item(s) selected
          </div>
          <div className="flex gap-3 order-1 sm:order-2">
            <button
              type="button"
              onClick={handleClearSelection}
              className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
            >
              Clear Selection
            </button>
            <button
              type="button"
              onClick={handleSelectAll}
              disabled={filteredAssets.length === 0}
              className="px-4 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Select All Filtered
            </button>
            <button
              onClick={handleDone}
              className="px-4 py-2 rounded-md bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
)}

    </>
  );
}
