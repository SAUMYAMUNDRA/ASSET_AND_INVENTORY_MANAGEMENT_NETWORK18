"use client";

import { useState, useEffect } from "react";
import { Download, ChevronLeft, ChevronRight } from "lucide-react";

export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalEvents, setTotalEvents] = useState(0);
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);

  const itemsPerPage = 50;

  const tabs = [
    "Dashboard",
    "Event Schedule",
    "Channels",
    "Reports",
    "Charts",
    "Admin Panel",
  ];

  const [stats, setStats] = useState([
    { label: "Total Events", value: 0, color: "bg-red-500" },
    { label: "Total Channels", value: 0, color: "bg-orange-500" },
    { label: "Live Events", value: 0, color: "bg-green-500" },
    { label: "Producers", value: 0, color: "bg-blue-500" },
    { label: "Cities", value: 0, color: "bg-purple-500" },
  ]);

  // Pagination math
  const totalPages = Math.ceil(totalEvents / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalEvents);

  // 🔴 Events (paginated)
  useEffect(() => {
    const fetchEvents = async () => {
      setEventsLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/eventreport/getglobalevents?page=${currentPage}&limit=${itemsPerPage}`,
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
  }, [currentPage]);

  // 🔴 Total Events
  // 🔴 Total Events
useEffect(() => {
  const fetchEventsCount = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/eventreport/getglobalevents`,
        { credentials: "include" }
      );
      const data = await res.json();

      // Use totalCount if that's what your API returns
      const total = data.totalCount ?? (data.events?.length ?? 0);

      setStats((prev) =>
        prev.map((s) =>
          s.label === "Total Events" ? { ...s, value: total } : s
        )
      );
    } catch (error) {
      console.error("Error fetching event count:", error);
    }
  };
  fetchEventsCount();
}, []);


  // 🔴 Live Events
  useEffect(() => {
    const fetchLiveEvents = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/eventreport/getgloballiveevents`,
          { credentials: "include" }
        );
        const data = await res.json();
        setStats((prev) =>
          prev.map((s) =>
            s.label === "Live Events" ? { ...s, value: data.totalEvents } : s
          )
        );
      } catch (error) {
        console.error("Error fetching live event count:", error);
      }
    };
    fetchLiveEvents();
  }, []);

  // 🔴 Channels
  useEffect(() => {
    const fetchTotalChannels = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/eventreport/gettotalchannels`,
          { credentials: "include" }
        );
        const data = await res.json();
        setStats((prev) =>
          prev.map((s) =>
            s.label === "Total Channels" ? { ...s, value: data.totalEvents } : s
          )
        );
      } catch (error) {
        console.error("Error fetching channel count:", error);
      }
    };
    fetchTotalChannels();
  }, []);

  // 🔴 Producers
  useEffect(() => {
    const fetchProducers = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/eventreport/getglobalproducers`,
          { credentials: "include" }
        );
        const data = await res.json();
        setStats((prev) =>
          prev.map((s) =>
            s.label === "Producers" ? { ...s, value: data.totalProducers } : s
          )
        );
      } catch (error) {
        console.error("Error fetching producer count:", error);
      }
    };
    fetchProducers();
  }, []);

  // 🔴 Cities
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/eventreport/getglobalcities`,
          { credentials: "include" }
        );
        const data = await res.json();
        setStats((prev) =>
          prev.map((s) =>
            s.label === "Cities" ? { ...s, value: data.totalCities } : s
          )
        );
      } catch (error) {
        console.error("Error fetching city count:", error);
      }
    };
    fetchCities();
  }, []);

  // 🔴 Current User
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
      } finally {
        setUserLoading(false);
      }
    };
    fetchUser();
  }, []);

  // Pagination handlers
  const handlePrevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
  const goToPage = (page) => page >= 1 && page <= totalPages && setCurrentPage(page);

  // Visible page numbers
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

  return (
    <div className="w-full">
      {/* Header buttons */}
      <div className="flex justify-end px-6 py-4 space-x-3">
        <button className="bg-green-500 text-white px-4 py-2 rounded shadow hover:bg-green-600 flex items-center space-x-2">
          <Download className="h-4 w-4" />
          <span>Download Excel (Full)</span>
        </button>
        <button className="bg-gray-900 text-white px-4 py-2 rounded shadow hover:bg-gray-800">
          All Events Only
        </button>
      </div>

      {/* Stats */}
      <div className="px-6 mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
        {stats.map((item) => (
          <div
            key={item.label}
            className={`${item.color} text-white rounded-lg shadow p-6 text-center`}
          >
            <p className="text-3xl font-bold">{item.value}</p>
            <p className="mt-1 text-lg">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Events Table */}
     
    </div>
  );
}
