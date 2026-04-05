"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export default function Reminder() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [reminderOptions] = useState(["1d", "2d", "3d", "7d", "14d"]);

  // Modal state
  const [showForm, setShowForm] = useState(false);

  // Form fields state
  const [newEvent, setNewEvent] = useState({
    date: "",
    time: "",
    channel: "Network 18",
    program: "",
    producer: "",
    location: "",
    show: "Live",
    setupType: "",
    cameraSetup: "",
    reminder: 7,
  });

  // Fetch events from API
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL;
      const response = await fetch(`${baseUrl}/api/eventreminder/allreminders`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }
      
      const data = await response.json();
      
      // Transform API data to match your component's expected format
      const transformedEvents = data.map((event, index) => ({
        id: event.id || index + 1,
        date: event.event_date,
        channel: event.channel_name,
        program: event.program_name,
        producer: event.producer_name,
        location: event.location,
        show: event.show_type,
        setupType: event.setup_type,
        cameraSetup: event.camera_setup,
        reminder: event.reminder_days,
        reminderDate: "", // You might want to calculate this based on event_date and reminder_days
        reminderAgo: "", // You might want to calculate this
        status: "Scheduled", // Default status or get from API if available
      }));
      
      setEvents(transformedEvents);
      setError(null);
    } catch (error) {
      console.error("Error fetching events:", error);
      setError("Failed to load events. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Load events when component mounts
  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSaveEvent = async () => {
    try {
      const payload = {
        event_date: newEvent.date,
        event_time: newEvent.time,
        channel_name: newEvent.channel,
        producer_name: newEvent.producer,
        program_name: newEvent.program,
        show_type: newEvent.show,
        location: newEvent.location,
        reminder_days: newEvent.reminder,
        setup_type: newEvent.setupType,
        camera_setup: newEvent.cameraSetup,
      };

      const baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL;
      const response = await fetch(`${baseUrl}/api/eventreminder/createreminder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to save event");
      }

      const savedEvent = await response.json();

      // Refresh the events list instead of manually updating
      await fetchEvents();

      // Reset form + close modal
      setShowForm(false);
      setNewEvent({
        date: "",
        time: "",
        channel: "Network 18",
        program: "",
        producer: "",
        location: "",
        show: "Live",
        setupType: "",
        cameraSetup: "",
        reminder: 7,
      });
    } catch (error) {
      console.error("Error saving event:", error);
      alert("Something went wrong while saving the event.");
    }
  };

  const handleResetData = () => {
    fetchEvents(); // Refresh data from API
  };

  if (loading) {
    return (
      <div className="p-6 text-black">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading events...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-black">
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 text-black">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Events ({events.length})</h2>
        <div className="flex gap-2">
          <button
            className="bg-red-500 text-white px-4 py-2 rounded-md"
            onClick={() => setShowForm(true)}
          >
            Add Event
          </button>
          <button 
            className="border px-4 py-2 rounded-md"
            onClick={handleResetData}
          >
            Refresh Data
          </button>
        </div>
      </div>

      {/* Events Table */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2">DATE</th>
              <th className="px-4 py-2">CHANNEL</th>
              <th className="px-4 py-2">PROGRAM</th>
              <th className="px-4 py-2">PRODUCER</th>
              <th className="px-4 py-2">LOCATION</th>
              <th className="px-4 py-2">SHOW</th>
              <th className="px-4 py-2">SETUP TYPE</th>
              <th className="px-4 py-2">CAMERA SETUP</th>
              <th className="px-4 py-2">REMINDER</th>
              <th className="px-4 py-2">STATUS</th>
              <th className="px-4 py-2">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 ? (
              <tr>
                <td colSpan="11" className="px-4 py-8 text-center text-gray-500">
                  No events found. Click "Add Event" to create your first event.
                </td>
              </tr>
            ) : (
              events.map((event) => (
                <tr key={event.id} className="border-t">
                  <td className="px-4 py-2">{event.date}</td>
                  <td className="px-4 py-2">{event.channel}</td>
                  <td className="px-4 py-2">{event.program}</td>
                  <td className="px-4 py-2">{event.producer}</td>
                  <td className="px-4 py-2">{event.location}</td>
                  <td className="px-4 py-2">{event.show}</td>
                  <td className="px-4 py-2">{event.setupType}</td>
                  <td className="px-4 py-2">{event.cameraSetup}</td>
                  <td className="px-4 py-2">{event.reminder} days before</td>
                  <td className="px-4 py-2">{event.status}</td>
                  <td className="px-4 py-2 flex gap-2 text-sm">
                    <button className="text-green-500">Done</button>
                    <button className="text-blue-500">Cancel</button>
                    <button>Postpone</button>
                    <button>Edit</button>
                    <button className="text-red-500">Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <span className="text-sm">Page 1 of 1</span>
        <div className="flex gap-2">
          <button className="flex items-center border px-2 py-1 rounded">
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>
          <button className="flex items-center border px-2 py-1 rounded">
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Add Event Modal */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-[750px] relative">
            {/* Close Button */}
            <button
              className="absolute top-3 right-3 text-gray-600"
              onClick={() => setShowForm(false)}
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-semibold mb-6">Add Event</h3>

            <div className="grid grid-cols-2 gap-6">
              {/* Date */}
              <div className="flex flex-col">
                <label className="mb-1 text-sm font-medium">Date</label>
                <input
                  type="date"
                  name="event_date"
                  className="border rounded px-3 py-2"
                  value={newEvent.date}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, date: e.target.value })
                  }
                />
              </div>

              {/* Time */}
              <div className="flex flex-col">
                <label className="mb-1 text-sm font-medium">Time</label>
                <input
                  type="time"
                  name="event_time"
                  className="border rounded px-3 py-2"
                  value={newEvent.time}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, time: e.target.value })
                  }
                />
              </div>

              {/* Channel */}
              <div className="flex flex-col">
                <label className="mb-1 text-sm font-medium">Channel</label>
                <input
                  type="text"
                  name="channel_name"
                  className="border rounded px-3 py-2"
                  value={newEvent.channel}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, channel: e.target.value })
                  }
                />
              </div>

              {/* Producer */}
              <div className="flex flex-col">
                <label className="mb-1 text-sm font-medium">Producer</label>
                <input
                  type="text"
                  name="producer_name"
                  className="border rounded px-3 py-2"
                  placeholder="Online / Name"
                  value={newEvent.producer}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, producer: e.target.value })
                  }
                />
              </div>

              {/* Program */}
              <div className="flex flex-col">
                <label className="mb-1 text-sm font-medium">Program</label>
                <input
                  type="text"
                  name="program_name"
                  className="border rounded px-3 py-2"
                  placeholder="Program Name"
                  value={newEvent.program}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, program: e.target.value })
                  }
                />
              </div>

              {/* Show */}
              <div className="flex flex-col">
                <label className="mb-1 text-sm font-medium">Show</label>
                <select
                  name="show_type"
                  className="border rounded px-3 py-2"
                  value={newEvent.show}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, show: e.target.value })
                  }
                >
                  <option>Live</option>
                  <option>Recorded</option>
                  <option>Rehearsal</option>
                  <option>Standby</option>
                </select>
              </div>

              {/* Location */}
              <div className="flex flex-col col-span-2">
                <label className="mb-1 text-sm font-medium">Location</label>
                <input
                  type="text"
                  name="location"
                  className="border rounded px-3 py-2 w-full"
                  placeholder="Enter Location"
                  value={newEvent.location}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, location: e.target.value })
                  }
                />
              </div>

              {/* Reminder */}
              <div className="flex flex-col">
                <label className="mb-1 text-sm font-medium">Reminder (Days before)</label>
                <div className="flex items-center gap-2">
                  <button
                    name="reminder_days"
                    type="button"
                    className="px-3 py-1 bg-gray-200 rounded"
                    onClick={() =>
                      setNewEvent({
                        ...newEvent,
                        reminder: Math.max(1, newEvent.reminder - 1),
                      })
                    }
                  >
                    -
                  </button>
                  <input
                    type="number"
                    className="border rounded px-3 py-2 w-20 text-center"
                    value={newEvent.reminder}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, reminder: Number(e.target.value) })
                    }
                  />
                  <button
                    type="button"
                    className="px-3 py-1 bg-gray-200 rounded"
                    onClick={() =>
                      setNewEvent({
                        ...newEvent,
                        reminder: newEvent.reminder + 1,
                      })
                    }
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Setup Type */}
              <div className="flex flex-col">
                <label className="mb-1 text-sm font-medium">Setup Type</label>
                <input
                  name="setup_type"
                  type="text"
                  className="border rounded px-3 py-2"
                  placeholder="Triax / OB / Anycast / ATEM..."
                  value={newEvent.setupType}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, setupType: e.target.value })
                  }
                />
              </div>

              {/* Camera Setup */}
              <div className="flex flex-col">
                <label className="mb-1 text-sm font-medium">Camera Setup</label>
                <input
                  name="camera_setup"
                  type="text"
                  className="border rounded px-3 py-2"
                  placeholder="e.g. 9 Camera"
                  value={newEvent.cameraSetup}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, cameraSetup: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                className="bg-black text-white px-5 py-2 rounded"
                onClick={handleSaveEvent}
              >
                Save
              </button>
              <button
                className="border px-5 py-2 rounded"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}