"use client";
import { useEffect, useState } from "react";
import { AlertTriangle, FilterX, Plus, Download } from "lucide-react";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
export default function App() {
  const [stats, setStats] = useState({
    totalIssued: 0,
    returned: 0,
    active: 0,
    overdue: 0,
  });
  const [gatePasses, setGatePasses] = useState([]);
  const [currentGatePassId, setCurrentGatePassId] = useState(null);
  const [filteredGatePasses, setFilteredGatePasses] = useState([]);
  
  // State for filter inputs
  const [filters, setFilters] = useState({
    status: "",
    issuedTo: "",
    eventName: "",
    eventDate: "",
    returnDate: "",
  });

  // Assets modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [loadingAssets, setLoadingAssets] = useState(false);

  // Add Equipment modal states
  const [showAddEquipmentModal, setShowAddEquipmentModal] = useState(false);
  const [assets, setAssets] = useState([]);
  const [searchFilter, setSearchFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [selectedEquipmentForAdd, setSelectedEquipmentForAdd] = useState([]);
  const [currentGatePassForAdd, setCurrentGatePassForAdd] = useState(null);

  // Enhanced filtering for add equipment modal
  const filteredAssetsForAdd = assets.filter((a) => {
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

  // Format dd-mm-yyyy
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const d = new Date(dateString);
    const day = String(d.getUTCDate()).padStart(2, "0");
    const month = String(d.getUTCMonth() + 1).padStart(2, "0");
    const year = d.getUTCFullYear();
    return `${day}-${month}-${year}`;
  };

  // Helper for comparing only yyyy-mm-dd from a Date object
  const dateOnly = (d) => new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());

  // Normalize + compute status
  const deriveStatus = (row) => {
    const raw = (row?.status || "").toString().trim().toLowerCase();

    if (raw === "returned" || raw === "available") return "Returned";
    if (raw === "pending") return "Pending";   

    if (row?.expected_return_date) {
      const exp = new Date(row.expected_return_date);
      exp.setDate(exp.getDate() + 1);
      const expDateStr = exp.toISOString().split("T")[0];
      const todayDateStr = new Date().toISOString().split("T")[0];
      if (expDateStr < todayDateStr) return "Overdue";
    }

    return "Active";
  };

  const statusClasses = (s) =>
    s === "Returned"
      ? "bg-gray-200 text-black"
      : s === "Overdue"
      ? "bg-red-100 text-red-700"
      : s === "Pending"
      ? "bg-red-100 text-red-700"
      : "bg-yellow-100 text-yellow-700"; 

  const [currentGatePassStatus, setCurrentGatePassStatus] = useState("");

  // Enhanced PDF Generation Function
  const generateGatePassPDF = async (gatePassData, assets, size = "A4") => {
    try {
      // Dynamically import jsPDF and autoTable
      const { jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: size,
        compress: true
      });

  
      const logo = new Image();
      logo.src = "/NW18.png";
      await new Promise((resolve) => { logo.onload = resolve; });
      pdf.addImage(logo, "PNG", 10, 8, 28, 12);


      // ===============================
      // Header
      // ===============================
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.text(
        "Network18 Media & Investments Ltd",
        pdf.internal.pageSize.getWidth() / 2,
        20,
        { align: "center" }
      );

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(12);
      pdf.text(
        "Event Equipment Gate Pass",
        pdf.internal.pageSize.getWidth() / 2,
        28,
        { align: "center" }
      );

      // ===============================
      // Setup Columns
      // ===============================
      let y = 40;
      const leftColX = 12;
      const rightColX = pdf.internal.pageSize.getWidth() / 2 + 5;
      const labelGap = 30;

      pdf.setFontSize(9);

      // ===============================
      // Gate Pass Info
      // ===============================
      pdf.setFont("helvetica", "bold");
      pdf.text("Gate Pass ID:", leftColX, y);
      pdf.setFont("helvetica", "normal");
      pdf.text(gatePassData.id?.toString() || "-", leftColX + labelGap, y);

      pdf.setFont("helvetica", "bold");
      pdf.text("Issue Date:", rightColX, y);
      pdf.setFont("helvetica", "normal");
      pdf.text(formatDate(gatePassData.event_date) || "-", rightColX + labelGap, y);
      y += 7;

      pdf.setFont("helvetica", "bold");
      pdf.text("Event Date:", leftColX, y);
      pdf.setFont("helvetica", "normal");
      pdf.text(formatDate(gatePassData.event_date) || "-", leftColX + labelGap, y);

      pdf.setFont("helvetica", "bold");
      pdf.text("Return Date:", rightColX, y);
      pdf.setFont("helvetica", "normal");
      pdf.text(formatDate(gatePassData.expected_return_date) || "-", rightColX + labelGap, y);
      y += 7;

      pdf.setFont("helvetica", "bold");
      pdf.text("Status:", leftColX, y);
      pdf.setFont("helvetica", "normal");
      pdf.text(deriveStatus(gatePassData), leftColX + labelGap, y);
      y += 10;

      // ===============================
      // Employee Details Box
      // ===============================
      const boxStartY = y;
      const boxHeight = 25;
      const boxWidth = pdf.internal.pageSize.getWidth() - 24;
      pdf.setFillColor(240, 240, 240);
      pdf.rect(leftColX, boxStartY, boxWidth, boxHeight, "F");
      
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.text("Employee Details:", leftColX + 2, boxStartY + 6);

      pdf.setFontSize(9);
      y = boxStartY + 12;

      pdf.text("Issued To:", leftColX + 2, y);
      pdf.setFont("helvetica", "normal");
      pdf.text(gatePassData.issued_to || "-", leftColX + labelGap, y);

      pdf.setFont("helvetica", "bold");
      pdf.text("Event Name:", rightColX, y);
      pdf.setFont("helvetica", "normal");
      pdf.text(gatePassData.event_name || "-", rightColX + labelGap, y);
      y += 6;

      pdf.setFont("helvetica", "bold");
      pdf.text("Employee ID:", leftColX + 2, y);
      pdf.setFont("helvetica", "normal");
      pdf.text(String(gatePassData.employee_id) || "-", leftColX + labelGap, y);

      y = boxStartY + boxHeight + 10;

      // ===============================
      // Equipment Table
      // ===============================
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.text("Equipment Items:", leftColX, y);
      y += 5;

      if (assets && assets.length > 0) {
        const pageHeight = pdf.internal.pageSize.getHeight();
        const availableHeight = pageHeight - y - 50; // leave space for signatures

        // Estimate row count and base row height
        const rowCount = assets.length + 1; // +1 for header
        let rowHeight = 8; // default row height
        let fontSize = 8;

        // Shrink until it fits
        while (rowCount * rowHeight > availableHeight && fontSize > 5) {
          fontSize -= 0.5;
          rowHeight -= 0.3;
        }

        autoTable(pdf, {
          startY: y,
          head: [["S/NO.", "Material", "Make", "Model", "Serial No", "Location", "Status"]],
          body: assets.map((eq, idx) => [
            idx + 1,
            eq.material || "-",
            eq.make || "-",
            eq.model || "-",
            eq.serial_no || "-",
            eq.location || "-",
            eq.status || "-"
          ]),
          theme: "grid",
          styles: { 
            fontSize, 
            cellPadding: 1,
            lineWidth: 0.1
          },
          headStyles: {
            fillColor: [41, 49, 51],
            textColor: [255, 255, 255],
            fontStyle: "bold",
            fontSize,
          },
          alternateRowStyles: { fillColor: [245, 245, 245] },
          margin: { left: leftColX, right: 12 },
          tableWidth: "auto",
          columnStyles: {
            0: { cellWidth: 15 }, // S/NO
            1: { cellWidth: 'auto' }, // Material
            2: { cellWidth: 25 }, // Make
            3: { cellWidth: 25 }, // Model
            4: { cellWidth: 30 }, // Serial No
            5: { cellWidth: 25 }, // Location
            6: { cellWidth: 20 }, // Status
          },
        });

        y = pdf.lastAutoTable.finalY + 15;
      } else {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        pdf.text("No equipment items assigned to this gate pass.", leftColX, y);
        y += 15;
      }

      // ===============================
      // Signatures Section
      // ===============================
      // Make sure we don't go off the page
      const pageHeight = pdf.internal.pageSize.getHeight();
      if (y > pageHeight - 40) {
        pdf.addPage();
        y = 20;
      }

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      pdf.text("Signatures:", leftColX, y);
      y += 10;

      const sigX1 = 20, sigX2 = 80, sigX3 = 140;
      const lineWidth = 40;
      
      // Signature lines
      pdf.line(sigX1, y, sigX1 + lineWidth, y);
      pdf.line(sigX2, y, sigX2 + lineWidth, y);
      pdf.line(sigX3, y, sigX3 + lineWidth, y);

      y += 5;
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.text("Engineer", sigX1 + 15, y);
      pdf.text("Supervisor", sigX2 + 10, y);
      pdf.text("Security", sigX3 + 15, y);
      
      y += 5;
      pdf.text("Date: _______", sigX1, y);
      pdf.text("Date: _______", sigX2, y);
      pdf.text("Date: _______", sigX3, y);

      // ===============================
      // Save PDF
      // ===============================
      const fileName = `GatePass_${gatePassData.id || 'unknown'}_${gatePassData.issued_to?.replace(/\s+/g, '_') || 'employee'}.pdf`;
      pdf.save(fileName);

    } catch (err) {
      console.error("❌ Gate Pass PDF generation failed:", err);
      alert("Could not generate Gate Pass PDF. Please try again.");
    }
  };

  // Function to handle PDF download
  const handleDownloadPDF = async (gatePassData) => {
    try {
      // First fetch the assets for this gate pass
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/assetinventory/gatepass/get-assetbygatepass`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ gatepassid: gatePassData.id }),
        }
      );
      
      if (!res.ok) throw new Error("Failed to fetch assets");
      const data = await res.json();
      const assets = data.assets || [];
      
      // Generate PDF with gate pass data and assets
      await generateGatePassPDF(gatePassData, assets);
      
    } catch (err) {
      console.error("Error downloading PDF:", err);
      alert("Failed to download PDF. Please try again.");
    }
  };

  const fetchAssetsByGatePass = async (gatepassid, status) => {
    try {
      setLoadingAssets(true);
      setCurrentGatePassId(gatepassid);
      setCurrentGatePassStatus(status);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/assetinventory/gatepass/get-assetbygatepass`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ gatepassid }),
        }
      );
      if (!res.ok) throw new Error("Failed to fetch assets");
      const data = await res.json();
      setSelectedAssets(data.assets || []);
      setShowModal(true);
    } catch (err) {
      console.error("Error fetching assets:", err);
    } finally {
      setLoadingAssets(false);
    }
  };

  const makeAssetAvailable = async (assetId) => {
    const confirmed = window.confirm("Are you sure you want to return this asset?");
    if (!confirmed) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/assetinventory/makeassetavailable/${assetId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ gateid: currentGatePassId }),
        }
      );

      if (!res.ok) throw new Error("Failed to make asset available");

      const data = await res.json();
      console.log(data.message);

      // Update the asset status in the modal
      setSelectedAssets((prev) =>
        prev.map((asset) =>
          asset.id === assetId ? { ...asset, status: "EarlyReturned" } : asset
        )
      );
    } catch (error) {
      console.error("Error making asset available:", error);
    }
  };

  // Fetch available assets for adding to gate pass
  const fetchAssetsForAdd = async () => {
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

  // Open add equipment modal
  const openAddEquipmentModal = (gatePassId) => {
    setCurrentGatePassForAdd(gatePassId);
    setSelectedEquipmentForAdd([]);
    setSearchFilter("");
    setLocationFilter("");
    setShowAddEquipmentModal(true);
    fetchAssetsForAdd();
  };

  // Handle equipment selection for adding
  const handleSelectEquipmentForAdd = (equip) => {
    setSelectedEquipmentForAdd((prev) => {
      const alreadySelected = prev.some((e) => e.id === equip.id);
      if (alreadySelected) {
        return prev.filter((e) => e.id !== equip.id);
      } else {
        return [...prev, equip];
      }
    });
  };

  // Clear equipment selection
  const handleClearSelectionForAdd = () => {
    setSelectedEquipmentForAdd([]);
  };

  // Select all filtered equipment
  const handleSelectAllForAdd = () => {
    setSelectedEquipmentForAdd([...filteredAssetsForAdd]);
  };

  // Clear filters in add equipment modal
  const handleClearFiltersForAdd = () => {
    setSearchFilter("");
    setLocationFilter("");
  };

  // Add selected equipment to gate pass
  const handleAddEquipmentToGatePass = async () => {
    if (selectedEquipmentForAdd.length === 0) {
      alert("Please select at least one equipment item.");
      return;
    }

    try {
      const payload = {
        equipment: selectedEquipmentForAdd.map((eq) => eq.id),
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/assetinventory/gatepass/edit-gatepass/${currentGatePassForAdd}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );

      if (res.ok) {
        alert("Equipment added to gate pass successfully!");
        setShowAddEquipmentModal(false);
        setSelectedEquipmentForAdd([]);
        // Refresh gate passes to show updated data
        fetchGatePasses();
      } else {
        const error = await res.json();
        alert(`Failed: ${error.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Error adding equipment to gate pass:", err);
      alert("Server error while adding equipment.");
    }
  };

  // Fetch rows from API
  const fetchGatePasses = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/assetinventory/gatepass/gatepassbyempid`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error("Failed to fetch gate passes");
      const data = await res.json();
      setGatePasses(data.rows || data.gate_passes || []);
    } catch (error) {
      console.error("Error fetching gate passes:", error);
    }
  };

  useEffect(() => {
    fetchGatePasses();
  }, []);

  const updatestatus = async (id) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/assetinventory/gatepass/updattegatepassstatus/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ status: "pending" }), 
        }
      );

      if (!res.ok) throw new Error("Failed to update gate pass status");

      const data = await res.json();

      // Optimistically update UI: set status to "pending" for that row
      setGatePasses((prev) =>
        prev.map((gp) =>
          gp.id === id ? { ...gp, status: "pending", return_date: new Date().toISOString() } : gp
        )
      );

      console.log(data.message);
    } catch (error) {
      console.error("Error updating gate pass:", error);
    }
  };
  
  // Recompute stats whenever original rows change
  useEffect(() => {
    const counts = gatePasses.reduce(
      (acc, row) => {
        const s = deriveStatus(row);
        acc.totalIssued += 1;
        if (s === "Returned") acc.returned += 1;
        else if (s === "Overdue") acc.overdue += 1;
        else acc.active += 1;
        return acc;
      },
      { totalIssued: 0, returned: 0, active: 0, overdue: 0 }
    );
    setStats(counts);
  }, [gatePasses]);

  // Apply filters whenever filters or gatePasses change
  useEffect(() => {
    let filtered = gatePasses.filter((pass) => {
      return (
        (filters.status ? pass.status === filters.status : true) &&
        (filters.issuedTo
          ? pass.issued_to.toLowerCase().includes(filters.issuedTo.toLowerCase())
          : true) &&
        (filters.eventName
          ? pass.event_name.toLowerCase().includes(filters.eventName.toLowerCase())
          : true) &&
        (filters.eventDate
          ? formatDate(pass.event_date) === formatDate(filters.eventDate)
          : true) &&
        (filters.returnDate
          ? formatDate(pass.expected_return_date) ===
            formatDate(filters.returnDate)
          : true)
      );
    });

    // Custom sort: Overdue → Active → Returned
    const statusPriority = { overdue: 1, active: 2, returned: 3 };

    filtered.sort((a, b) => {
      // Compare by status first
      const statusA = statusPriority[a.status?.toLowerCase()] || 4;
      const statusB = statusPriority[b.status?.toLowerCase()] || 4;
      if (statusA !== statusB) return statusA - statusB;

      // If same status → compare by return date
      const dateA = new Date(a.expected_return_date || a.event_date);
      const dateB = new Date(b.expected_return_date || b.event_date);

      return dateA - dateB; 
    });

    setFilteredGatePasses(filtered);
  }, [filters, gatePasses]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      status: "",
      issuedTo: "",
      eventName: "",
      eventDate: "",
      returnDate: "",
    });
  };

  const { totalIssued, returned, active, overdue } = stats;

  return (
    <div className="bg-white rounded-lg shadow p-6 font-sans">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Gate Pass Tracking</h2>
          <p className="text-gray-600 text-sm">
            Monitor all your issued gate passes and equipment returns
          </p>
        </div>
        <span className="text-sm text-gray-500">
          Total Gate Passes: {totalIssued}
        </span>
      </div>

      {/* Table Section */}
      {gatePasses.length > 0 ? (
        <>
          <h1 className="text-xl font-bold text-gray-800 mb-4">ALL GATE PASSES</h1>
          
          {/* Filter Section */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {/* Status Filter */}
              <div className="flex flex-col">
                <label htmlFor="status" className="text-xs font-medium text-gray-600 mb-1">Status</label>
                <select id="status" name="status" value={filters.status} onChange={handleFilterChange} className="border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="">All</option>
                  <option value="active">Active</option>
                  <option value="returned">Returned</option>
                  <option value="Overdue">Overdue</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              {/* Issued To Filter */}
              <div className="flex flex-col">
                <label htmlFor="issuedTo" className="text-xs font-medium text-gray-600 mb-1">Issued To</label>
                <input type="text" id="issuedTo" name="issuedTo" placeholder="Filter by name..." value={filters.issuedTo} onChange={handleFilterChange} className="border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              {/* Event Name Filter */}
              <div className="flex flex-col">
                <label htmlFor="eventName" className="text-xs font-medium text-gray-600 mb-1">Event Name</label>
                <input type="text" id="eventName" name="eventName" placeholder="Filter by event..." value={filters.eventName} onChange={handleFilterChange} className="border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              {/* Event Date Filter */}
              <div className="flex flex-col">
                <label htmlFor="eventDate" className="text-xs font-medium text-gray-600 mb-1">Event Date</label>
                <input type="date" id="eventDate" name="eventDate" value={filters.eventDate} onChange={handleFilterChange} className="border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              {/* Return Date Filter */}
              <div className="flex flex-col">
                <label htmlFor="returnDate" className="text-xs font-medium text-gray-600 mb-1">Return Date</label>
                <input type="date" id="returnDate" name="returnDate" value={filters.returnDate} onChange={handleFilterChange} className="border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              {/* Clear Button */}
              <div className="flex flex-col justify-end">
                 <button onClick={clearFilters} className="flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-md text-sm transition-colors">
                    <FilterX className="w-4 h-4" />
                    Clear
                 </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 text-sm text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 border">SNo</th>
                  <th className="px-4 py-2 border">Issued To</th>
                  <th className="px-4 py-2 border">Employee ID</th>
                  <th className="px-4 py-2 border">Event Name</th>
                  <th className="px-4 py-2 border">Event Date</th>
                  <th className="px-4 py-2 border">Expected Return Date</th>
                  <th className="px-4 py-2 border">Status</th>
                  <th className="px-4 py-2 border">Assets</th>
                  <th className="px-4 py-2 border">Actions</th>
				  <th className="px-4 py-2 border"><Download className="w-3 h-3" /></th>
                </tr>
              </thead>
              <tbody>
                {filteredGatePasses.length > 0 ? filteredGatePasses.map((row, index) => {
                  const s = deriveStatus(row);

                  return (
                    <tr key={row.id || index} className="hover:bg-gray-50">
                      <td className="px-4 py-2 border">{index + 1}</td>
                      <td className="px-4 py-2 border">{row.issued_to}</td>
                      <td className="px-4 py-2 border">{row.employee_id}</td>
                      <td className="px-4 py-2 border">{row.event_name}</td>
                      <td className="px-4 py-2 border">{formatDate(row.event_date)}</td>
                      <td className="px-4 py-2 border">{formatDate(row.expected_return_date)}</td>
                      <td className="px-4 py-2 border flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${statusClasses(s)}`}>
                          {s}
                        </span>


                        {(s === "Active" || s === "Overdue") && (
                          <button
                            onClick={() => updatestatus(row.id)}
                            className="ml-2 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                          >
                            Return Item
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-2 border">
						<button
						  onClick={() => fetchAssetsByGatePass(row.id, deriveStatus(row))}
						  className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
						>
						  View Assets
						</button>
                      </td>
                      <td className="px-4 py-2 border">
                        {/* NEW - Add Equipment button */}
                        {(s === "Active" || s === "Overdue") && (
                          <button
                            onClick={() => openAddEquipmentModal(row.id)}
                            className="flex items-center gap-1 px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                          >
                            <Plus className="w-3 h-3" />
                            Add Equipment
                          </button>
                        )}
                      </td>
					  <td className="px-4 py-2 border">
  {/* Download PDF button - only for Active/Overdue */}
  {(s === "Active" || s === "Overdue") && (
    <button
      onClick={() => handleDownloadPDF(row)}
      className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600"
    >
      <Download className="w-3 h-3" />
      Download PDF
    </button>
  )}
</td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan="9" className="text-center py-8 text-gray-500">
                      No gate passes match the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Assets Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-6 relative">
                <button
                  onClick={() => setShowModal(false)}
                  className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                >
                  X
                </button>
                <h2 className="text-lg font-bold text-gray-800 mb-4">Assets for Gate Pass</h2>

                {loadingAssets ? (
                  <p className="text-gray-600">Loading assets...</p>
                ) : selectedAssets.length > 0 ? (
                  <div className="overflow-x-auto">
                    {/* scrollable section */}
                    <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                      <table className="min-w-full text-sm text-left">
                        <thead className="bg-gray-800 text-white sticky top-0">
                          <tr>
                            <th className="px-4 py-2 border">SNo</th>
                            <th className="px-4 py-2 border">Material</th>
                            <th className="px-4 py-2 border">Status</th>
                            <th className="px-4 py-2 border">Location</th>
                            <th className="px-4 py-2 border">Make</th>
                            <th className="px-4 py-2 border">Model</th>
                            <th className="px-4 py-2 border">Serial No</th>
                            <th className="px-4 py-2 border">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedAssets.map((asset, idx) => (
                            <tr key={asset.id || idx} className="hover:bg-gray-50">
                              <td className="px-4 py-2 border">{idx + 1}</td>
                              <td className="px-4 py-2 border">{asset.material}</td>
                              <td className="px-4 py-2 border">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  asset.status === "EarlyReturned" 
                                    ? "bg-green-100 text-green-700"
                                    : asset.status === "Issued" 
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-gray-100 text-gray-700"
                                }`}>
                                  {asset.status}
                                </span>
                              </td>
                              <td className="px-4 py-2 border">{asset.location}</td>
                              <td className="px-4 py-2 border">{asset.make}</td>
                              <td className="px-4 py-2 border">{asset.model}</td>
                              <td className="px-4 py-2 border">{asset.serial_no}</td>
                              <td className="px-4 py-2 border">
                                  {currentGatePassStatus !== "Returned" && asset.status !== "EarlyReturned" && (

                                  <button
                                    onClick={() => makeAssetAvailable(asset.id)}
                                    className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                                  >
                                    Return Asset
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">No assets found for this gate pass.</p>
                )}
              </div>
            </div>
          )}

          {/* NEW - Add Equipment Modal */}
          {showAddEquipmentModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white rounded-lg shadow-xl w-11/12 max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b bg-gray-50">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Add Equipment to Gate Pass
                  </h2>
                  <button
                    className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                    onClick={() => setShowAddEquipmentModal(false)}
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
                      Showing {filteredAssetsForAdd.length} of {assets.filter(a => a.status === "Available").length} available items
                    </div>
                    <button
                      type="button"
                      onClick={handleClearFiltersForAdd}
                      className="text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>

                {/* Equipment List */}
                <div className="flex-1 overflow-y-auto p-4">
                  {filteredAssetsForAdd.length > 0 ? (
                    <div className="space-y-3">
                      {filteredAssetsForAdd.map((asset) => (
                        <div
                          key={asset.id}
                          className={`border rounded-lg p-4 transition-all duration-200 cursor-pointer hover:shadow-md ${
                            selectedEquipmentForAdd.some((eq) => eq.id === asset.id)
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => handleSelectEquipmentForAdd(asset)}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={selectedEquipmentForAdd.some((eq) => eq.id === asset.id)}
                              onChange={() => handleSelectEquipmentForAdd(asset)}
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
                    <span className="font-medium">{selectedEquipmentForAdd.length}</span> item(s) selected
                  </div>
                  <div className="flex gap-3 order-1 sm:order-2">
                    <button
                      type="button"
                      onClick={handleClearSelectionForAdd}
                      className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                    >
                      Clear Selection
                    </button>
                    <button
                      type="button"
                      onClick={handleSelectAllForAdd}
                      disabled={filteredAssetsForAdd.length === 0}
                      className="px-4 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      Select All Filtered
                    </button>
                    <button
                      onClick={handleAddEquipmentToGatePass}
                      className="px-4 py-2 rounded-md bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors"
                    >
                      Add Selected Equipment
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </>
      ) : (
        // Empty State when no gate passes exist at all
        <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg mt-6">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <div>
            <span className="font-medium">No Gate Passes Found. </span>
            <span className="text-sm">
              Go to the <span className="font-semibold">"Gate Pass"</span> tab to create your first one.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}