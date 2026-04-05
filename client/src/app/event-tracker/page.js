// app/components/EventTracker.js
"use client";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Dashboard from "../components/event-tracker/dashboard"
import EventSchedule from "../components/event-tracker/eventschedule"
import ChannelEventsDashboard from "../components/event-tracker/channels"
import Reminder from "../components/event-tracker/eventreminder";
export default function EventTracker() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [user, setUser] = useState({ name: "John Doe", email: "john@demo.com", city: "Delhi" });
  const [userLoading, setUserLoading] = useState(false);

  // Tabs
  const tabs = ["Dashboard","Event Schedule" ,"Event Reminder", "Channels","Reports", "Charts","Admin Panel"];

  // Events state
  const [events, setEvents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 50;

  // Fetch events from backend (dummy for now)
  useEffect(() => {
    async function fetchEvents() {
      // Replace with your real API endpoint
      const response = await fetch("/api/events");
      const data = await response.json();
      setEvents(data);
    }
    fetchEvents();
  }, []);
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

  // Pagination
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = events.slice(indexOfFirstEvent, indexOfLastEvent);
  const totalPages = Math.ceil(events.length / eventsPerPage);

  return (
    <div className="w-full min-h-screen bg-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b">
        <div className="flex items-center space-x-2">
          <img src="/NW18.png" alt="Network18" className="h-6 w-auto" />
          <h1 className="text-xl font-bold text-black">Network18 Event Tracker</h1>
        </div>
        <div className="flex items-center space-x-3">
          {!userLoading && (
            <>
              <div className="text-right">
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-gray-500">
                  {user.city} • {user.email}
                </p>
              </div>
              <div className="h-9 w-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                {user.name ? user.name[0].toUpperCase() : "U"}
              </div>
            </>
          )}
        </div>
      </header>

      {/* Tabs */}
      <nav className="flex items-center px-6 space-x-6 border-b">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`py-3 text-sm font-medium ${
              activeTab === tab ? "text-red-500 border-b-2 border-red-500" : "text-gray-600"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
            {tab === "Admin Panel" && (
              <span className="ml-1 bg-red-200 text-red-800 text-xs px-1.5 py-0.5 rounded">
                ADMIN
              </span>
            )}
          </button>
        ))}
      </nav>
         {activeTab === "Dashboard" && <Dashboard />}
          {activeTab === "Event Schedule" && <EventSchedule />}
          {activeTab === "Channels" && <ChannelEventsDashboard />}
           {activeTab === "Event Reminder" && <Reminder/>}
      {/* Events Table */}
     
    </div>
  );
}
