"use client";
import { useEffect, useState } from "react";
import { AlertTriangle, FilterX } from "lucide-react";

export default function App() {
  const [stats, setStats] = useState({
    totalIssued: 0,
    returned: 0,
    active: 0,
    overdue: 0,
    pending: 0,
  });
  const [gatePasses, setGatePasses] = useState([]);
  const [filteredGatePasses, setFilteredGatePasses] = useState([]);

  const [filters, setFilters] = useState({
    status: "",
    issuedTo: "",
    eventName: "",
    eventDate: "",
    returnDate: "",
  });

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const d = new Date(dateString);
    const day = String(d.getUTCDate()).padStart(2, "0");
    const month = String(d.getUTCMonth() + 1).padStart(2, "0");
    const year = d.getUTCFullYear();
    return `${day}-${month}-${year}`;
  };
  const [showModal, setShowModal] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [loadingAssets, setLoadingAssets] = useState(false);

  const fetchAssetsByGatePass = async (gatepassid) => {
    try {
      setLoadingAssets(true);
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
  const approveacceptupdateStatus = async (id, newStatus) => {
    try {

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/assetinventory/gatepass/gatepassreturn_adminapprove/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ status: newStatus }),
        }
      );
      if (!res.ok) throw new Error("Failed to update gate pass status");
      const data = await res.json();
      console.log(data.message);

      setGatePasses((prev) =>
        prev.map((pass) => (pass.id === id ? { ...pass, status: newStatus } : pass))
      );
    } catch (error) {
      console.error("Error updating gate pass:", error);
    }
  };
   const disapproveacceptupdateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/assetinventory/gatepass/gatepassreturn_admindisapprove/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ status: newStatus }),
        }
      );
      if (!res.ok) throw new Error("Failed to update gate pass status");
      const data = await res.json();
      console.log(data.message);

      setGatePasses((prev) =>
        prev.map((pass) => (pass.id === id ? { ...pass, status: newStatus } : pass))
      );
    } catch (error) {
      console.error("Error updating gate pass:", error);
    }
  };

const deriveStatus = (row) => {
  const raw = (row?.status || "").toString().trim().toLowerCase();

  if (raw === "returned" || raw === "available") return "returned";
  if (raw === "pending") return "Pending";

  if (row?.expected_return_date) {
    const exp = new Date(row.expected_return_date);
    const now = new Date();

    const overdueThreshold = new Date(exp.getTime() + 24 * 60 * 60 * 1000);

    if (now > overdueThreshold) return "Overdue";
  }

  return "active";
};

  const statusClasses = (s) =>
    s === "returned"
      ? "bg-gray-200 text-black"
      : s === "Pending"
      ? "bg-orange-100 text-orange-700"
      : s === "Overdue"
      ? "bg-red-100 text-red-700"
      : "bg-yellow-100 text-yellow-700"; // active

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/assetinventory/gatepass/gatepass`,
          { credentials: "include" }
        );
        if (!res.ok) throw new Error("Failed to fetch gate passes");
        const data = await res.json();
        setGatePasses(data.rows || data.gate_passes || []);
      } catch (error) {
        console.error("Error fetching gate passes:", error);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const counts = gatePasses.reduce(
      (acc, row) => {
        const s = deriveStatus(row);
        acc.totalIssued += 1;
        if (s === "returned") acc.returned += 1;
        else if (s === "Overdue") acc.overdue += 1;
        else if (s === "Pending") acc.pending += 1;
        else acc.active += 1;
        return acc;
      },
      { totalIssued: 0, returned: 0, active: 0, overdue: 0, pending: 0 }
    );
    setStats(counts);
  }, [gatePasses]);

  useEffect(() => {
    let filtered = gatePasses.filter((pass) => {
      return (
        (filters.status ? deriveStatus(pass) === filters.status : true) &&
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
          ? formatDate(pass.expected_return_date) === formatDate(filters.returnDate)
          : true)
      );
    });

    const statusPriority = { pending: 1, overdue: 2, active: 3, returned: 4 };
    filtered.sort((a, b) => {
      const statusA = statusPriority[deriveStatus(a).toLowerCase()] || 5;
      const statusB = statusPriority[deriveStatus(b).toLowerCase()] || 5;
      if (statusA !== statusB) return statusA - statusB;
      const dateA = new Date(a.expected_return_date || a.event_date);
      const dateB = new Date(b.expected_return_date || b.event_date);
      return dateA - dateB;
    });

    setFilteredGatePasses(filtered);
  }, [filters, gatePasses]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
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

  const { totalIssued, returned, active, overdue, pending } = stats;

  return (
    <div className="bg-white rounded-lg shadow p-6 font-sans">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Gate Pass Tracking</h2>
          <p className="text-gray-600 text-sm">
            Monitor all issued gate passes and equipment returns
          </p>
        </div>
        <span className="text-sm text-gray-500">Total Gate Passes: {totalIssued}</span>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-center">
          <h3 className="text-sm font-medium text-blue-700">TOTAL ISSUED</h3>
          <p className="text-2xl font-bold text-blue-800">{totalIssued}</p>
        </div>
        <div className="bg-orange-50 border border-orange-100 rounded-lg p-4 text-center">
          <h3 className="text-sm font-medium text-orange-700">PENDING</h3>
          <p className="text-2xl font-bold text-orange-800">{pending}</p>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-lg p-4 text-center">
          <h3 className="text-sm font-medium text-red-700">OVERDUE</h3>
          <p className="text-2xl font-bold text-red-800">{overdue}</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 text-center">
          <h3 className="text-sm font-medium text-yellow-700">ACTIVE</h3>
          <p className="text-2xl font-bold text-yellow-800">{active}</p>
        </div>
        <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 text-center">
          <h3 className="text-sm font-medium text-gray-700">RETURNED</h3>
          <p className="text-2xl font-bold text-gray-800">{returned}</p>
        </div>
      </div>

      {/* Table Section */}
      {gatePasses.length > 0 ? (
        <>
          <h1 className="text-xl font-bold text-gray-800 mb-4">ALL GATE PASSES</h1>
          {/* Filter Section */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <div className="flex flex-col">
                <label htmlFor="status" className="text-xs font-medium text-gray-600 mb-1">Status</label>
                <select id="status" name="status" value={filters.status} onChange={handleFilterChange} className="border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="">All</option>
                  <option value="Pending">Pending</option>
                  <option value="Overdue">Overdue</option>
                  <option value="active">active</option>
                  <option value="returned">returned</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label htmlFor="issuedTo" className="text-xs font-medium text-gray-600 mb-1">Issued To</label>
                <input type="text" id="issuedTo" name="issuedTo" placeholder="Filter by name..." value={filters.issuedTo} onChange={handleFilterChange} className="border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div className="flex flex-col">
                <label htmlFor="eventName" className="text-xs font-medium text-gray-600 mb-1">Event Name</label>
                <input type="text" id="eventName" name="eventName" placeholder="Filter by event..." value={filters.eventName} onChange={handleFilterChange} className="border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div className="flex flex-col">
                <label htmlFor="eventDate" className="text-xs font-medium text-gray-600 mb-1">Event Date</label>
                <input type="date" id="eventDate" name="eventDate" value={filters.eventDate} onChange={handleFilterChange} className="border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div className="flex flex-col">
                <label htmlFor="returnDate" className="text-xs font-medium text-gray-600 mb-1">Return Date</label>
                <input type="date" id="returnDate" name="returnDate" value={filters.returnDate} onChange={handleFilterChange} className="border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
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
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="px-4 py-2 border">SNo</th>
              <th className="px-4 py-2 border">Issued To</th>
              <th className="px-4 py-2 border">Employee ID</th>
              <th className="px-4 py-2 border">Event Name</th>
              <th className="px-4 py-2 border">Event Date</th>
              <th className="px-4 py-2 border">Expected Return Date</th>
              <th className="px-4 py-2 border">Return Date</th>
              <th className="px-4 py-2 border">Status</th>
              <th className="px-4 py-2 border">Assets</th>
            </tr>
          </thead>
          <tbody>
            {filteredGatePasses.length > 0 ? (
              filteredGatePasses.map((row, index) => {
                const s = deriveStatus(row);
                return (
                  <tr key={row.id || index} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border">{index + 1}</td>
                    <td className="px-4 py-2 border">{row.issued_to}</td>
                    <td className="px-4 py-2 border">{row.employee_id}</td>
                    <td className="px-4 py-2 border">{row.event_name}</td>
                    <td className="px-4 py-2 border">{formatDate(row.event_date)}</td>
                    <td className="px-4 py-2 border">{formatDate(row.expected_return_date)}</td>
                    <td className="px-4 py-2 border">{formatDate(row.return_date)}</td>
 <td className="px-4 py-2 border flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${statusClasses(s)}`}>{s}</span>
                        {s === "Pending" && (
                          <>
                            <button onClick={() => approveacceptupdateStatus(row.id, "returned")} className="ml-2 px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600">Approve Return</button>
                            <button onClick={() => disapproveacceptupdateStatus(row.id, "active")} className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600">Disapprove</button>
                          </>
                        )}
                      </td>
                    <td className="px-4 py-2 border">
                      <button
                        onClick={() => fetchAssetsByGatePass(row.id)}
                        className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        View Assets
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
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
                </tr>
              </thead>
              <tbody>
                {selectedAssets.map((asset, idx) => (
                  <tr key={asset.id || idx} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border">{idx + 1}</td>
                    <td className="px-4 py-2 border">{asset.material}</td>
                    <td className="px-4 py-2 border">{asset.status}</td>
                    <td className="px-4 py-2 border">{asset.location}</td>
                    <td className="px-4 py-2 border">{asset.make}</td>
                    <td className="px-4 py-2 border">{asset.model}</td>
                    <td className="px-4 py-2 border">{asset.serial_no}</td>
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

        </>
      ) : (
        <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg mt-6">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <div>
            <span className="font-medium">No Gate Passes Found. </span>
            <span className="text-sm">Go to the <span className="font-semibold">"Gate Pass"</span> tab to create your first one.</span>
          </div>
        </div>
      )}
    </div>
  );
}
