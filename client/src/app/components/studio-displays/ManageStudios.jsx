"use client";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, Check, X } from "lucide-react";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import autoTable from "jspdf-autotable";

const STATUS_STYLES = {
  "OK": { backgroundColor: "#22c55e", color: "#fff" },             // green-500
  "STANDBY": { backgroundColor: "#facc15", color: "#000" },        // yellow-400
  "FAULT": { backgroundColor: "#dc2626", color: "#fff" },          // red-600
  "NOT WORKING": { backgroundColor: "#b91c1c", color: "#fff" },    // red-700
  "OFF": { backgroundColor: "#6b7280", color: "#fff" },            // gray-500
  "UNDER MAINTENENCE": { backgroundColor: "#f97316", color: "#fff" }, // orange-500
  "NEEDS REPAIR": { backgroundColor: "#ec4899", color: "#fff" },   // pink-500
  "TESTING": { backgroundColor: "#60a5fa", color: "#fff" },        // blue-400
  "AWAITING PARTS": { backgroundColor: "#a855f7", color: "#fff" }, // purple-500
  "CALIBRATING": { backgroundColor: "#6366f1", color: "#fff" },    // indigo-500
  "OUT OF SERVICE": { backgroundColor: "#000000", color: "#fff" },
  "CUBE-A": { backgroundColor: "#14b8a6", color: "#fff" },         // teal-500
  "CUBE-B": { backgroundColor: "#06b6d4", color: "#fff" },         // cyan-500
  "CUBE-C": { backgroundColor: "#84cc16", color: "#000" },         // lime-500
  "CUBE-D": { backgroundColor: "#f59e0b", color: "#000" },         // amber-500
};

const STATUS_COLORS = {
  "OK": "bg-green-500 text-white",
  "STANDBY": "bg-yellow-400 text-black",
  "FAULT": "bg-red-600 text-white",
  "NOT WORKING": "bg-red-700 text-white",
  "OFF": "bg-gray-500 text-white",
  "UNDER MAINTENENCE": "bg-orange-500 text-white",
  "NEEDS REPAIR": "bg-pink-500 text-white",
  "TESTING": "bg-blue-400 text-white",
  "AWAITING PARTS": "bg-purple-500 text-white",
  "CALIBRATING": "bg-indigo-500 text-white",
  "OUT OF SERVICE": "bg-black text-white",
  "CUBE-A": "bg-teal-500 text-white",
  "CUBE-B": "bg-cyan-500 text-white",
  "CUBE-C": "bg-lime-500 text-black",
  "CUBE-D": "bg-amber-500 text-black",
};

const STATUS_COLORS_OTHER = {
  "OK": "text-green-500",
  "STANDBY": "text-yellow-400",
  "FAULT": "text-red-600",
  "NOT WORKING": "text-red-700",
  "OFF": "text-gray-500",
  "UNDER MAINTENENCE": "text-orange-500",
  "NEEDS REPAIR": "text-pink-500",
  "TESTING": "text-blue-400",
  "AWAITING PARTS": "text-purple-500",
  "CALIBRATING": "text-indigo-500",
  "OUT OF SERVICE": "text-black",
  "CUBE-A": "text-teal-500",
  "CUBE-B": "text-cyan-500",
  "CUBE-C": "text-lime-500",
  "CUBE-D": "text-amber-500",
};

const COLUMNS = [
  ["actions", "Actions"],
  ["sno", "S.No"],
  ["floor", "Floor"],
  ["studio", "Studio"],
  ["barco_model", "Display Name"],
  ["cube_a", "CUBE-A"],
  ["cube_b", "CUBE-B"],
  ["cube_c", "CUBE-C"],
  ["cube_d", "CUBE-D"],
  ["led_size_85_75_inch", "LED Size 85/75"],
  ["led_size_65_55_inch", "LED Size 65/55"],
  ["controller", "Controller"],
  ["lvc_sr_no", "LVC sr.no"],
  ["novastar_sr_no", "Novastar sr.no"],
  ["lvc_nds_status", "LVC/NDS"],
  ["wme_net_status", "WME/NET"],
  ["convertor", "Convertor"],
  ["led_tv_85_75_input", "LED TV 85/75"],
  ["led_tv_65_55_input", "LED TV 65/55"],
  ["hdmi_input", "HDMI Input"],
  ["lvc_input", "LVC Input"],
  ["pixel_input", "Pixel Input"],
  ["time", "Time"],
  ["status", "Status"],
  ["remarks", "Remarks"],
];

export default function ManageStudios({ is_admin = false }) { 
  const [studios, setStudios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userLoading, setUserLoading] = useState(true);
  const [fetched, setFetched] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [user, setUser] = useState({ name: "Loading...", email: "Loading..." });
  const [currentDateTime, setCurrentDateTime] = useState("");
// Additional Notes state
const [additionalNotes, setAdditionalNotes] = useState("");
const [notesEditing, setNotesEditing] = useState(false);
const [notesLoaded, setNotesLoaded] = useState(false);


useEffect(() => {
  const fetchAdditionalNotes = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/api/studiodisplays/get-additional`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch additional notes");
      const data = await res.json();
	  console.log(data.studio_display_additional_notes);
      setAdditionalNotes(data.studio_display_additional_notes || "");
    } catch (err) {
      console.error(err);
    } finally {
      setNotesLoaded(true);
    }
  };
  fetchAdditionalNotes();
}, []);

// Save additional notes
const handleSaveNotes = async () => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/api/studiodisplays/edit-additional`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ studio_display_additional_notes: additionalNotes }),
    });
    if (!res.ok) throw new Error("Failed to save notes");
    toast.success("Additional notes updated!");
    setNotesEditing(false);
  } catch (err) {
    console.error(err);
    toast.error(err.message || "Failed to update notes");
  }
};

// NEW FUNCTION: Handle specific fields (LVC/NDS, WME/NET, Convertor, Remarks)
const handleSpecificFieldUpdate = async (id, field, value) => {
  try {
    const original = studios.find((s) => s.id === id);
    if (!original) throw new Error("Studio not found");

    // Prepare the data for the specific fields
    const updatedData = { [field]: value };

    // username
    let userNameParam = "anonymous";
    if (user?.name) {
      userNameParam = user.name.replace(/\s+/g, "-").toLowerCase();
    }

    // API call for specific fields
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/studiodisplays/update-specific-fields/${id}/${userNameParam}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updatedData),
      }
    );

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to update field");

    toast.success("Field updated successfully!");
    
    // Update the studios state with the saved data
    setStudios((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  } catch (err) {
    console.error("Error updating field:", err);
    toast.error(err.message || "Error updating field");
  }
};

  const defaultVisible = Object.fromEntries(COLUMNS.map(([k]) => [k, true]));
  const [visibleCols, setVisibleCols] = useState(() => {
    try {
      const raw =
        typeof window !== "undefined" &&
        localStorage.getItem("studios_visible_cols");
      return raw ? JSON.parse(raw) : defaultVisible;
    } catch {
      return defaultVisible;
    }
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/api/users/current-user`, {
          credentials: "include",
        });
        
        if (!res.ok) throw new Error("Failed to fetch user data.");
        const userData = await res.json();
        console.log(userData);
        setUser({ name: userData.user.name, email: userData.user.email,city:userData.user.city_name, });
      } catch (err) {
        toast.error("Error fetching user data.");
      }finally {
            setUserLoading(false); // Set to false regardless of success or failure
        }
    };
    
    const fetchStudios = () => {
      setLoading(true);
      fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/api/studiodisplays/get-displays`, {
        credentials: "include",
      })
        .then(async (res) => {
          let data;
          try {
            data = await res.json();
          } catch (e) {
            console.error("Failed to parse JSON:", e);
            throw new Error("Invalid response from server");
          }
          if (!res.ok) {
            toast.error(data?.error || "Failed to fetch studio displays");
          }
setStudios(
  (data.displays || [])
    .map(item => ({
      ...item,
      status: item.status ? item.status.toUpperCase() : "",
    }))
    .sort((a, b) => {
      const floorA = a.floor;
      const floorB = b.floor;

      const isAlphaA = isNaN(Number(floorA));
      const isAlphaB = isNaN(Number(floorB));

      if (isAlphaA && isAlphaB) {
        // Both alphabetic: sort alphabetically
        return floorA.localeCompare(floorB);
      } else if (isAlphaA) {
        // Alphabetic comes first
        return -1;
      } else if (isAlphaB) {
        return 1;
      } else {
        // Both numeric: special numeric order (10 first, then 2,3,4...)
        const numericOrder = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
        return numericOrder.indexOf(floorA) - numericOrder.indexOf(floorB);
      }
    })
);
          setFetched(true);
        })
        .catch((err) => {
          console.error("Error fetching studio displays:", err);
          toast.error(err.message || "Error fetching studio displays");
        })
        .finally(() => setLoading(false));
    };

    if (!fetched) {
      fetchUser();
      fetchStudios();
    }
    const updateDateTime = () => {
      const now = new Date();
      const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      };
      const formattedDate = new Intl.DateTimeFormat('en-US', options).format(now);
      setCurrentDateTime(formattedDate.replace(',', ''));
    };
    
    updateDateTime();
    const timer = setInterval(updateDateTime, 1000);

    return () => clearInterval(timer);
  }, [fetched]);

  useEffect(() => {
    try {
      localStorage.setItem("studios_visible_cols", JSON.stringify(visibleCols));
    } catch {}
  }, [visibleCols]);

  const handleToggleColumn = (key) =>
    setVisibleCols((p) => ({ ...p, [key]: !p[key] }));

  const handleEditClick = (studio) => {
    setEditingId(studio.id);
    setEditData({ ...studio });
  };

const handleEditChange = (field, value) => {
  setEditData((prev) => {
    const next = { ...prev, [field]: value };
    return next;
  });
};

const handleDropdownChange = (id, field, value) => {
  // update UI immediately
  setStudios((prev) =>
    prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
  );

  // Check if this is one of the specific fields
  if (["lvc_nds_status", "wme_net_status", "convertor"].includes(field)) {
    // Use the new specific function
    handleSpecificFieldUpdate(id, field, value);
  } else {
    // Use the original function for status
    handleSaveEdit(id, { [field]: value });
  }
};

const handleDirectFieldChange = (id, field, value) => {
  // Update UI immediately
  setStudios((prev) =>
    prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
  );
};

const handleDirectFieldSave = (id, field, value) => {
  // Check if this is remarks field (one of the specific fields)
  if (field === "remarks") {
    // Use the new specific function
    handleSpecificFieldUpdate(id, field, value);
  } else {
    // Use the original function for other fields
    handleSaveEdit(id, { [field]: value });
  }
};

const handleSaveEdit = async (id, overrides = {}) => {
  try {
    const original = studios.find((s) => s.id === id);
    if (!original) throw new Error("Studio not found");

    // If we're in edit mode, use editData; otherwise use overrides
    let updatedData;
    if (editingId === id) {
      // We're saving from edit mode - use editData
      updatedData = { ...original, ...editData, ...overrides };
    } else {
      // We're saving from dropdown change - use overrides
      updatedData = { ...original, ...overrides };
    }

    // update time if status changed
    if (overrides.status !== undefined && original.status !== overrides.status) {
      const now = new Date();
      updatedData.time = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
      });
    } else if (!overrides.time) {
      // Keep original time if not explicitly updating it
      updatedData.time = original.time;
    }

    // username
    let userNameParam = "anonymous";
    if (user?.name) {
      userNameParam = user.name.replace(/\s+/g, "-").toLowerCase();
    }

    // API call
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/studiodisplays/edit-display/${id}/${userNameParam}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updatedData),
      }
    );

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to update studio");

    toast.success("Studio updated successfully!");
    
    // Update the studios state with the saved data
    setStudios((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updatedData } : s))
    );
    
    // Clear edit state if we were in edit mode
    if (editingId === id) {
      setEditingId(null);
      setEditData({});
    }
  } catch (err) {
    console.error("Error updating studio:", err);
    toast.error(err.message || "Error updating studio");
  }
};

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleDelete = async (id) => {
    if (!id) return;
    if (!confirm("Are you sure you want to delete this studio?")) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/studiodisplays/delete-display/${id}`,
        { method: "GET", credentials: "include" }
      );
      let data;
      try {
        data = await res.json();
      } catch {
        data = { error: `Server returned status ${res.status}` };
      }
      if (!res.ok) throw new Error(data.error || "Failed to delete studio");
      toast.success("Studio deleted successfully!");
      setStudios((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error("Error deleting studio:", err);
      toast.error(err.message || "Error deleting studio");
    }
  };

  const getStatusKey = (val) => {
    if (!val && val !== 0) return "";
    const asIs = String(val).trim();
    return Object.keys(STATUS_COLORS).includes(asIs)
      ? asIs
      : Object.keys(STATUS_COLORS).find(
          (k) => k.toLowerCase() === asIs.toLowerCase()
        ) || asIs;
  };
  
const hexToRgb = (hex) => {
  hex = hex.replace(/^#/, "");
  if (hex.length === 3) {
    hex = hex.split("").map((c) => c + c).join("");
  }
  const num = parseInt(hex, 16);
  return [num >> 16, (num >> 8) & 255, num & 255];
};

const handleExportPdf = () => {
  toast.info("Generating PDF, please wait...");

  const table = document.getElementById("studio-displays-table-pdf");
  if (!table) {
    toast.error("Table not found");
    return;
  }

const pdf = new jsPDF({
  orientation: "landscape",
  unit: "mm",
  format: "b3",
  compress: true
});
  const docWidth = pdf.internal.pageSize.getWidth();

  // Logo + Header
  const logo = new Image();
  logo.src = "/NW18.png";
  logo.onload = () => {
    pdf.addImage(logo, "PNG", 10, 10, 45, 20);

    pdf.setFontSize(18);
    pdf.setFont(undefined, "bold");
    pdf.text(
      "Noida Studio Displays (Barco, Pixel LED & LED TVs) Checklist",
      docWidth / 2,
      35,
      { align: "center" }
    );

    pdf.setFontSize(12);
    pdf.setFont(undefined, "normal");
    pdf.text(`Generated By: ${user.name}`, 10, 45);
    pdf.text(`Email: ${user.email}`, 10, 52);
    pdf.text(`Generated: ${currentDateTime}`, docWidth - 10, 52, { align: "right" });

    // AutoTable with custom cell styling
// Build a list of visible column keys (excluding actions)
const visibleColumnKeys = COLUMNS.filter(([key]) => key !== "actions" && visibleCols[key]).map(([key]) => key);

autoTable(pdf, {
  html: "#studio-displays-table-pdf",
  startY: 70,
  theme: "grid",
  headStyles: {
    fillColor: [43, 61, 79],
    textColor: 255,
    fontSize: 8,
    cellPadding: 1,
  },
  bodyStyles: {
    fontSize: 8,
    cellPadding: 1,
  },
  styles: {
    fontSize: 8,
    cellPadding: 1,
    minCellHeight: 6,
    overflow: "linebreak",
  },
  margin: { left: 10, right: 10, top: 70, bottom: 20 },
  didParseCell: (data) => {
    const colKey = visibleColumnKeys[data.column.index]; // use filtered list
    const value = (typeof data.cell.raw === "string"
      ? data.cell.raw
      : data.cell.raw?.textContent || ""
    ).trim();

    if (colKey === "status" && STATUS_STYLES[value]) {
      const bg = STATUS_STYLES[value].backgroundColor || "#fff";
      const color = STATUS_STYLES[value].color || "#000";
      data.cell.styles.fillColor = hexToRgb(bg);
      data.cell.styles.textColor = hexToRgb(color);
    }

    if (["lvc_nds_status", "wme_net_status", "convertor"].includes(colKey) && STATUS_STYLES[value]) {
      const color = STATUS_STYLES[value].backgroundColor || "#000";
      data.cell.styles.textColor = hexToRgb(color);
      data.cell.styles.fillColor = [255, 255, 255];
    }
  },
});
    // Additional Notes
    if (additionalNotes && additionalNotes.trim()) {
      let finalY = pdf.lastAutoTable.finalY + 10 || 70;
      pdf.setFontSize(14);
      pdf.setFont(undefined, "bold");
      pdf.text("Additional Notes:", 10, finalY);

      pdf.setFontSize(12);
      pdf.setFont(undefined, "normal");
      const notesLines = pdf.splitTextToSize(additionalNotes, docWidth - 20);
      pdf.text(notesLines, 10, finalY + 6);
    }

    pdf.save("studio_displays_checklist.pdf");
    toast.success("PDF generated successfully!");
  };
};



 const handleExportCsv = () => {
    toast.info("Generating CSV, please wait...");
  
    // 1. Filter for visible columns, excluding the 'actions' column
   const allColumnsForExport = COLUMNS.filter(
  ([key]) => key !== 'actions'
);
  
    // 2. Create the header row from the labels of visible columns
    const headers = allColumnsForExport.map(([, label]) => label);
    const headerRow = headers.join(',');
  
    // 3. Create the data rows
    const rows = studios.map((studio, index) => {
      return allColumnsForExport
        .map(([key]) => {
          // Handle special 'sno' case which is based on index
          const cellValue = key === 'sno' ? index + 1 : studio[key] ?? '';
  
          // Wrap cell value in quotes if it contains a comma to prevent CSV corruption
          const processedValue = String(cellValue).includes(',') 
            ? `"${cellValue}"` 
            : cellValue;
            
          return processedValue;
        })
        .join(',');
    });
  
    // 4. Combine header and data rows into a single CSV string
    const csvContent = [headerRow, ...rows].join('\n');
  
    // 5. Create a Blob and trigger a download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "studio_displays_checklist.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("CSV exported successfully!");
    } else {
      toast.error("CSV export is not supported in your browser.");
    }
  };


  return (
    <div className="p-2 text-[11px]">
      <div className="flex flex-col gap-2 p-4 text-[11px] font-sans">
        <div className="flex justify-between items-center mb-4">
          <div className="flex flex-col">
            <h1 className="text-[2rem] font-semibold text-gray-800">
              Noida Studio Displays Checklist
            </h1>
            <p className="text-gray-600 text-[1rem]">
              Barco, Pixel LED & LED TVs Management System
            </p>
          </div>
          <div className="p-4 border border-gray-300 rounded-md bg-gray-50 text-gray-700">
            <div className="flex gap-2">
              <span className="font-semibold">Logged in as:</span>
              <span>{user.name}</span><br />
            </div>
                           <div className="flex gap-2">
              <span className="font-semibold">City:</span>
                          <span>{user.city && <p className="font-bold">{user.city}</p>}</span>
            </div>

            <div className="flex gap-2">
              <span className="font-semibold">Email:</span>
              <span>{user.email}</span>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {currentDateTime}
            </div>
          </div>
        </div>
        
        <div className="flex justify-center gap-4 mt-4">
          <button 
            onClick={handleExportPdf}
            className="flex items-center justify-center gap-2 px-6 py-2 bg-red-600 text-white rounded-md font-semibold hover:bg-red-700 transition-colors duration-200"
          >
            <span className="text-sm">Export to PDF</span>
          </button>
          <button onClick={handleExportCsv} className="flex items-center justify-center gap-2 px-6 py-2 bg-green-600 text-white rounded-md font-semibold hover:bg-green-700 transition-colors duration-200">
            <span className="text-sm">Export to Excel</span>
          </button>
        </div>
      
      </div>
      
     

<div className="w-full overflow-x-auto">
  {/* Column toggler row */}
  <div className="mb-2">
    <div className="inline-flex py-2 px-2 bg-gray-800 text-white w-full gap-4 overflow-x-auto">
      <div className="flex py-2 px-2 bg-gray-800 text-white gap-2">
        {COLUMNS.map(([key, label]) => (
          <label
            key={key}
            className="flex flex-col items-center justify-center min-w-[90px] break-words text-center"
          >
            <input
              type="checkbox"
              checked={!!visibleCols[key]}
              onChange={() => handleToggleColumn(key)}
              className="w-4 h-4"
            />
            <span className="mt-1 text-xs">{label}</span>
          </label>
        ))}
      </div>
    </div>
  </div>

  {/* Loading / Empty / Data */}
  {loading && <p className="text-[11px]">Loading studios...</p>}
  {!loading && studios.length === 0 && (
    <p className="text-[11px]">No studios found.</p>
  )}

  {!loading && studios.length > 0 && (
    <div className="w-full overflow-x-auto">
     <table
  id="studio-displays-table"
  className="w-full table-auto border border-gray-200 text-[1rem]"
>
  {/* Table Header */}
  <thead className="bg-gray-100 sticky top-0 z-10">
<tr>
  {COLUMNS.filter(([key]) => {
    if (key === "actions" && !is_admin) return false;
    return true;
  }).map(
    ([key, label]) =>
      visibleCols[key] && (
        <th
          key={key}
          className={`px-1 py-1 border text-[1rem] ${
            key === "status"
              ? "min-w-[100px]"
              : key === "time"
              ? "min-w-[120px]"
              : key === "sno"
              ? "w-8 text-center"
              : "min-w-[80px]"
          }`}
        >
          {label}
        </th>
      )
  )}
</tr>
  </thead>

  {/* Table Body */}
  <tbody>
    {studios.map((s, idx) => {
      const statusKey = getStatusKey(s.status);
      const isEditing = editingId === s.id;

      return (
        <tr
          key={s.id || idx}
          className="hover:bg-gray-50 even:bg-gray-50 odd:bg-white text-center align-middle"
        >
{/* Action Buttons */}
{is_admin && visibleCols["actions"] && (
  <td className="px-2 py-1 border">
    <div className="flex justify-center gap-1">
      {isEditing ? (
        <>
          <button
            onClick={() => handleSaveEdit(s.id)}
            className="p-1 text-green-600 hover:bg-green-100 rounded"
          >
            <Check size={14} />
          </button>
          <button
            onClick={handleCancelEdit}
            className="p-1 text-gray-600 hover:bg-gray-100 rounded"
          >
            <X size={14} />
          </button>
        </>
      ) : (
        <>
          <button
            onClick={() => handleEditClick(s)}
            className="p-1 text-blue-600 hover:bg-blue-100 rounded"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => handleDelete(s.id)}
            className="p-1 text-red-600 hover:bg-red-100 rounded"
          >
            <Trash2 size={14} />
          </button>
        </>
      )}
    </div>
  </td>
)}

          {/* Dynamic Columns */}
          {COLUMNS.filter(([k]) => k !== "actions").map(([key]) =>
            visibleCols[key] ? (
              <td
                key={key}
                className={`px-2 py-1 border ${
                  key === "status" ? "min-w-[100px]" : ""
                }`}
                title={s[key]}
              >
                {/* STATUS → always dropdown */}
{key === "status" ? (
  <select
    value={s[key] ?? ""}
    onChange={(e) => {
      const newValue = e.target.value === "NULL" ? null : e.target.value;
      handleDropdownChange(s.id, key, newValue);
    }}
    className={`w-full border px-0.4 py-0.5 text-[15px] rounded ${
      STATUS_COLORS[getStatusKey(s[key])] || "bg-gray-200 text-black"
    }`}
  >
    {Object.keys(STATUS_COLORS).map((status) => (
      <option key={status} value={status}>
        {status}
      </option>
    ))}
  </select>
) : ["lvc_nds_status", "wme_net_status", "convertor"].includes(key) ? (
  (s[key] || is_admin) ? (  
    <select
      value={s[key] ?? "NULL"}
      onChange={(e) => {
        const newValue = e.target.value === "NULL" ? null : e.target.value;
        handleDropdownChange(s.id, key, newValue);
      }}
      className={`w-full border px-0.4 py-0.5 text-[15px] rounded ${
        STATUS_COLORS_OTHER[getStatusKey(s[key])] || "bg-gray-200 text-black"
      }`}
    >
      {/* Default option for admins when NULL */}
      <option value="OK">OK</option>
      <option value="NOT WORKING">NOT WORKING</option>
      <option value="STANDBY">STANDBY</option>
      <option value="OFF">OFF</option>
      <option value="FAULT">FAULT</option>
      {is_admin && <option value="NULL">NULL</option>}
    </select>
  ) : null
)  : key === "remarks" ? (
  // Direct editing for remarks - available to all users
  <input
    type="text"
    value={s[key] ?? ""}
    onChange={(e) => handleDirectFieldChange(s.id, key, e.target.value)}
    onKeyDown={(e) => {
      if (e.key === 'Enter') {
        e.target.blur(); // This will trigger onBlur
      }
    }}
    onBlur={(e) => handleDirectFieldSave(s.id, key, e.target.value)}
    className="w-full border px-1 py-0.5 text-[15px] bg-transparent"
    placeholder="Add remarks..."
  />
) : editingId === s.id && key !== "sno" ? (
  (key === "floor" && !is_admin) || key === "time" ? (
    <span>{s[key]}</span>
  ) : (
    <input
      type="text"
      value={editData[key] ?? ""}
      onChange={(e) => handleEditChange(key, e.target.value)}
      className="w-full border px-1 py-0.5 text-[11px]"
    />
  )
) : (
  <span>{key === "sno" ? idx + 1 : s[key]}</span>
)}


              </td>
            ) : null
          )}
        </tr>
      );
    })}
  </tbody>
</table>

      {/* Hidden table for PDF export */}
  <table
  id="studio-displays-table-pdf"
  style={{
    position: "absolute",
    left: "-9999px",
    top: "0",
    borderCollapse: "collapse",
    width: "100%",
    fontSize: "15px",
    color: "#000",
    textAlign: "center",
  }}
>
  <thead>
    <tr>
      {COLUMNS.filter(([key]) => key !== "actions" && visibleCols[key]).map(
        ([key, label]) => (
          <th
            key={key}
            style={{
              border: "1px solid #ccc",
              padding: "4px",
              backgroundColor: "#2b3d4f",
              color: "#fff",
              textAlign: "center",
              verticalAlign: "middle",
              height: "45px",
              minWidth: "100px",
            }}
          >
            {label}
          </th>
        )
      )}
    </tr>
  </thead>
  <tbody>
    {studios.map((s, idx) => (
      <tr key={s.id || idx}>
        {COLUMNS.filter(([key]) => key !== "actions" && visibleCols[key]).map(
          ([key]) => {
            const value =
              key === "sno"
                ? idx + 1
                : s[key] === null || s[key] === undefined || String(s[key]).toLowerCase() === "null"
                ? ""
                : s[key];

            if (key === "status") {
              return (
                <td
                  key={key}
                  style={{
                    border: "1px solid #ccc",
                    padding: "4px",
                    textAlign: "center",
                    verticalAlign: "middle",
                    height: "40px",
                    ...(STATUS_STYLES[s[key]] || { backgroundColor: "#fff", color: "#000" }),
                  }}
                >
                  {value}
                </td>
              );
            } else if (["lvc_nds_status", "wme_net_status", "convertor"].includes(key)) {
              const bgColor = STATUS_STYLES[s[key]]?.backgroundColor || "#000";
              return (
                <td
                  key={key}
                  style={{
                    border: "1px solid #ccc",
                    padding: "4px",
                    textAlign: "center",
                    verticalAlign: "middle",
                    height: "40px",
                    color: bgColor,
                    backgroundColor: "transparent",
                  }}
                >
                  {value}
                </td>
              );
            } else {
              return (
                <td
                  key={key}
                  style={{
                    border: "1px solid #ccc",
                    padding: "4px",
                    textAlign: "center",
                    verticalAlign: "middle",
                    height: "40px",
                  }}
                >
                  {value}
                </td>
              );
            }
          }
        )}
      </tr>
    ))}
  </tbody>
</table>
    </div>
  )}
</div>


	  <div className="mt-4 p-4 border border-gray-300 rounded-md bg-gray-50">
  <h3 className="font-semibold mb-2 text-sm">Additional Notes</h3>
{notesLoaded && (
  <>
    {notesEditing ? (
      <div className="flex flex-col gap-2">
        <textarea
          value={additionalNotes}
          onChange={(e) => setAdditionalNotes(e.target.value)}
          className="w-full border rounded-md p-2 text-sm bg-white"
          rows={4}
        />
        <div className="flex gap-2">
          <button
            onClick={handleSaveNotes}
            className="px-3 py-1 bg-green-600 text-white rounded-md text-sm"
          >
            <Check size={14} />
          </button>
          <button
            onClick={() => { setNotesEditing(false); }}
            className="px-3 py-1 bg-gray-400 text-white rounded-md text-sm"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    ) : additionalNotes ? (
      <div className="flex flex-col gap-2">
        <textarea
          value={additionalNotes}
          readOnly
          className="w-full border rounded-md p-2 text-sm bg-gray-100"
          rows={4}
        />
        <div className="flex gap-2">
          <button
            onClick={() => setNotesEditing(true)}
            className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm"
          >
            Edit
          </button>
        </div>
      </div>
    ) : (
      <button
        onClick={() => setNotesEditing(true)}
        className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm"
      >
        Add Additional Notes
      </button>
    )}
  </>
)}
</div>
    </div>
  );
}