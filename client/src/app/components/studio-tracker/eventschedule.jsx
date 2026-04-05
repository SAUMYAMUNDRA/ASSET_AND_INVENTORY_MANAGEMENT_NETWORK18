"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Search, Download } from "lucide-react";

export default function Eventschedule() {
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalEvents, setTotalEvents] = useState(0);

  // filters state
  const [filters, setFilters] = useState({
    q: "",
    channel: "",
    type: "",
    from: "",
    to: "",
    programming: "",
    format: "",
    equipment: "",
  });

  // static channel list
  const [channels] = useState([
    { name: "CNN-News18", type: "National" },
    { name: "CNBC-TV18", type: "Business" },
    { name: "News18 India", type: "HSM" },
    { name: "News18 Punjab", type: "Regional" },
  ]);

  const itemsPerPage = 50;
  const totalPages = Math.ceil(totalEvents / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalEvents);

  // fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      setEventsLoading(true);
      try {
        const params = new URLSearchParams({
          page: currentPage,
          limit: itemsPerPage,
          q: filters.q || "",
          channel: filters.channel || "",
          type: filters.type || "",
          from: filters.from || "",
          to: filters.to || "",
          programming: filters.programming || "",
          format: filters.format || "",
          equipment: filters.equipment || "",
        });

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/eventreport/getglobalevents?${params.toString()}`,
          { credentials: "include" }
        );
        const data = await res.json();

        if (data.events) {
          setEvents(data.events || []);
          setTotalEvents(data.totalCount || data.events.length);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
        setEvents([]);
        setTotalEvents(0);
      } finally {
        setEventsLoading(false);
      }
    };

    fetchEvents();
  }, [currentPage, filters]);

  // pagination handlers
  const handlePrevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
  const goToPage = (page) => page >= 1 && page <= totalPages && setCurrentPage(page);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    const halfVisible = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) pages.push(i);
    return pages;
  };

  // filter change helper
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1); // reset to page 1 when filters change
  };

  return (
    <div className="px-6 py-6">
      {/* 🔎 Filters Section */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6 text-black">
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    {/* Search */}
    <div className="relative">
      <label className="block text-sm font-medium mb-1">Search</label>
      <Search className="absolute left-3 top-9 text-gray-400 h-4 w-4" />
      <input
        type="text"
        placeholder="Search events..."
        value={filters.q}
        onChange={(e) => handleFilterChange("q", e.target.value)}
        className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm"
      />
    </div>

    {/* Channel */}
    <div>
      <label className="block text-sm font-medium mb-1">Channel</label>
      <select
        value={filters.channel}
        onChange={(e) => handleFilterChange("channel", e.target.value)}
        className="w-full px-3 py-2 border rounded-lg text-sm"
      >
        <option value="">All Channels</option>
        {channels.map((ch) => (
          <option key={ch.name} value={ch.name}>
            {ch.name}
          </option>
        ))}
      </select>
    </div>

    {/* Type */}
    <div>
      <label className="block text-sm font-medium mb-1">Broadcast Type</label>
      <select
        value={filters.type}
        onChange={(e) => handleFilterChange("type", e.target.value)}
        className="w-full px-3 py-2 border rounded-lg text-sm"
      >
        <option value="">All Types</option>
        <option value="Live">Live</option>
        <option value="Recorded">Recorded</option>
        <option value="LiveRec">LiveRec</option>
      </select>
    </div>

    {/* Date From */}
    <div>
      <label className="block text-sm font-medium mb-1">From Date</label>
      <input
        type="date"
        value={filters.from}
        onChange={(e) => handleFilterChange("from", e.target.value)}
        className="w-full px-3 py-2 border rounded-lg text-sm"
      />
    </div>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
    {/* Date To */}
    <div>
      <label className="block text-sm font-medium mb-1">To Date</label>
      <input
        type="date"
        value={filters.to}
        onChange={(e) => handleFilterChange("to", e.target.value)}
        className="w-full px-3 py-2 border rounded-lg text-sm"
      />
    </div>

    {/* Programming */}
  <div>
  <label className="block text-sm font-medium mb-1">Programming</label>
  <select
    value={filters.programming}
    onChange={(e) => handleFilterChange("programming", e.target.value)}
    className="w-full px-3 py-2 border rounded-lg text-sm"
  >
    <option value="">All</option>
    <option>Intellectual Properties (IP)</option>
    <option>News</option>
    <option>Business</option>
    <option>Focus</option>
    <option>Other</option>
  </select>
</div>


    {/* Format */}
   <div>
  <label className="block text-sm font-medium mb-1">Format</label>
  <select
    value={filters.format}
    onChange={(e) => handleFilterChange("format", e.target.value)}
    className="w-full px-3 py-2 border rounded-lg text-sm"
  >
    <option value="">All</option>
    <option>4K</option>
    <option>HD</option>
  </select>
</div>


    {/* Equipment */}
    <div>
      <label className="block text-sm font-medium mb-1">Equipment</label>
      <select
        value={filters.equipment}
        onChange={(e) => handleFilterChange("equipment", e.target.value)}
        className="w-full px-3 py-2 border rounded-lg text-sm"
      >
        <option value="">All</option>
        <option value="BNC">BNC</option>
        <option value="TRIAX">TRIAX</option>
        <option value="OTHER">OTHER</option>
      </select>
    </div>
  </div>

  {/* Actions */}
  <div className="mt-4 flex justify-between">
    <button
      onClick={() => console.log("Export Excel clicked")}
      className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg text-sm"
    >
      <Download className="h-4 w-4" /> Export Excel
    </button>
  </div>
</div>


      {/* 📋 Events Table */}
      <div className="bg-white border rounded-lg shadow-sm">
        {/* Table Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">
            Events ({totalEvents})
          </h2>
          <div className="text-sm text-gray-500">
            Showing {startIndex + 1}-{endIndex} of {totalEvents}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-700">DATE</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">CHANNEL</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">PROGRAM</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">PRODUCER</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">LOCATION</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">SHOW</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">SETUP TYPE</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">CAMERA SETUP</th>
              </tr>
            </thead>
            <tbody>
              {eventsLoading ? (
                <tr>
                  <td colSpan="8" className="text-center py-8">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                      <span className="ml-2">Loading events...</span>
                    </div>
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-gray-500">
                    No events found
                  </td>
                </tr>
              ) : (
                events.map((event, index) => (
                  <tr
                    key={event.id || index}
                    className="border-b hover:bg-gray-50 text-gray-600"
                  >
                    <td className="py-3 px-4 text-sm">
                      {event.setup_date
                        ? new Date(event.setup_date).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="py-3 px-4 text-sm">{event.channel || "-"}</td>
                    <td className="py-3 px-4 text-sm">{event.event_name || "-"}</td>
                    <td className="py-3 px-4 text-sm">{event.show_producer || "-"}</td>
                    <td className="py-3 px-4 text-sm">
                      {event.location_hotel_name || "-"}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                        {event.show_type || "N/A"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">{event.setup_type || "-"}</td>
                    <td className="py-3 px-4 text-sm">{event.camera || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="p-2 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div className="flex space-x-1">
                {getPageNumbers().map((page) => (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`px-3 py-1 text-sm rounded ${
                      page === currentPage
                        ? "bg-red-500 text-white"
                        : "border hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="p-2 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
