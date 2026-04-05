"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function EventsTable() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ name: "", from: "", to: "" }); // <-- updated filters state
  const router = useRouter();

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/eventreport/get/all`,
        {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleView = (event) => {
    const url = `/create-event-report/${event.id}`;
    window.open(url, "_blank");
  };

  const handleDelete = async (eventId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this event?"
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/eventreport/delete/${eventId}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!res.ok) throw new Error("Failed to delete event");

      setEvents((prevEvents) =>
        prevEvents.filter((event) => event.id !== eventId)
      );
      alert("Event deleted successfully");
    } catch (err) {
      console.error(err);
      alert("Error deleting event: " + err.message);
    }
  };

  // Apply filters before rendering
  const filteredEvents = events.filter((e) => {
    const matchesName = e.event_name
      ?.toLowerCase()
      .includes(filters.name.toLowerCase());

    const eventDate = new Date(e.event_date);
    const fromDate = filters.from ? new Date(filters.from) : null;
    const toDate = filters.to ? new Date(filters.to) : null;

    let matchesDate = true;

    if (fromDate && toDate) {
      // Range filter
      matchesDate = eventDate >= fromDate && eventDate <= toDate;
    } else if (fromDate) {
      // Single date filter
      matchesDate =
        eventDate.toLocaleDateString("en-CA") === fromDate.toLocaleDateString("en-CA");
    }

    return matchesName && matchesDate;
  });

  if (loading) return <p>Loading events...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      {/* Filter Box */}
      <div className="flex flex-wrap gap-4 items-center mb-4">
        <input
          type="text"
          placeholder="Filter by Event Name"
          value={filters.name}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, name: e.target.value }))
          }
          className="border px-3 py-2 rounded w-60"
        />
		FROM:
        <input
          type="date"
          value={filters.from}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, from: e.target.value }))
          }
          className="border px-3 py-2 rounded"
        />
		TO:
        <input
          type="date"
          value={filters.to}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, to: e.target.value }))
          }
          className="border px-3 py-2 rounded"
        />
        <button
          onClick={() => setFilters({ name: "", from: "", to: "" })}
          className="bg-gray-500 text-white px-3 py-2 rounded hover:bg-gray-600"
        >
          Clear Filters
        </button>
      </div>

      {/* Table */}
      {filteredEvents.length === 0 ? (
        <p>No events found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300">
            <thead className="bg-gray-800 text-white">
              <tr className="text-center">
                <th className="px-4 py-2 border">S.No</th>
                <th className="px-4 py-2 border">ID</th>
                <th className="px-4 py-2 border">Event Name</th>
                <th className="px-4 py-2 border">Event Date</th>
                <th className="px-4 py-2 border">View</th>
                <th className="px-4 py-2 border">Delete</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((e, index) => (
                <tr key={e.id} className="text-center">
                  <td className="px-4 py-2 border">{index + 1}</td>
                  <td className="px-4 py-2 border">{e.id}</td>
                  <td className="px-4 py-2 border">{e.event_name}</td>
                  <td className="px-4 py-2 border">
                    {e.event_date
                      ? new Date(e.event_date).toLocaleDateString("en-GB")
                      : "-"}
                  </td>
                  <td className="px-4 py-2 border">
                    <button
                      onClick={() => handleView(e)}
                      className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                    >
                      View
                    </button>
                  </td>
                  <td className="px-4 py-2 border">
                    <button
                      onClick={() => handleDelete(e.id)}
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

