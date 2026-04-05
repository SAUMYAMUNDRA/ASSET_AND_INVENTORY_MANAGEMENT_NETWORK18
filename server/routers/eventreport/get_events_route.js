import express from "express";
import * as event from "../../models/events_model.js";
import { isLoggedIn } from "../../middlewares/isloggedin.js";
import * as channel from "../../models/channelevent_model.js";
import {isAuthorized} from '../../middlewares/isAuthorized.js';

const eventRoute = express.Router();

// GET all events
eventRoute.get("/get/all", isLoggedIn,isAuthorized(35), async (req, res) => {
  try {
    const city_id=req.user.city_id
    const events = await event.getAllEvents(city_id);
    return res.status(200).json(events);
  } catch (error) {
    console.error("get/all error:", error);
    return res.status(500).json({ error: "Error fetching events", details: error.message });
  }
});

// DELETE an event by ID
eventRoute.delete("/delete/:id", isLoggedIn,isAuthorized(36), async (req, res) => {
  const eventId = req.params.id;
  if (!eventId) return res.status(400).json({ error: "Event ID is required" });

  try {
    const deleted = await event.deleteEvent(eventId);
    if (!deleted) return res.status(404).json({ error: "Event not found or already deleted" });

    return res.status(200).json({ message: `Event ${eventId} deleted successfully` });
  } catch (error) {
    console.error("delete event error:", error);
    return res.status(500).json({ error: "Error deleting event", details: error.message });
  }
});

// POST event details by ID
eventRoute.post("/get", isLoggedIn, isAuthorized(37), async (req, res) => {
  const { eventId } = req.body;

  if (!eventId) {
    return res.status(400).json({ error: "eventId is required in body" });
  }

  try {
    const eventData = await event.getEventById(eventId); // <-- you need a model function for this
    if (!eventData) {
      return res.status(404).json({ error: "Event not found" });
    }

    return res.status(200).json(eventData);
  } catch (error) {
    console.error("get event error:", error);
    return res.status(500).json({ error: "Error fetching event details", details: error.message });
  }
});



eventRoute.get("/getglobalevents", async (req, res) => {
  try {
    // Get pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    // Get total count first
    const totalCount = await event.globalGetEventCount(); // You'll need to create this method

    // Get paginated events with only the required fields
    const allEvents = await event.getAllEventsGlobalPaginated(offset, limit); // You'll need to create this method
    
    // Transform the data to match frontend expectations
    const transformedEvents = allEvents.map(event => ({
      id: event.id,
      setup_date: event.setup_date,
      channel: event.channel,
      event_name: event.event_name,
      show_producer: event.show_producer,
      location_hotel_name: event.location_hotel_name,
      show_type: event.show_type,
      setup_type: event.setup_type,
      camera: event.camera
    }));

    return res.status(200).json({ 
      events: transformedEvents,
      totalCount: totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit)
    });
    
  } catch (error) {
    console.error("get global events error:", error);
    return res.status(500).json({ 
      error: "Error fetching global events", 
      details: error.message 
    });
  }
});



eventRoute.get("/getglobaleventscount", async (req, res) => {
  try {

    const totalEvents = await event.globalGetEventCount(); // returns a number

    return res.status(200).json({ totalEvents }); // wrap in object
  } catch (error) {
    console.error("get event error:", error);
    return res.status(500).json({ 
      error: "Error fetching event details", 
      details: error.message 
    });
  }
});



eventRoute.get("/getallevents", async (req, res) => {
  try {
    const totalEvents = await event.getallEvents();

    return res.status(200).json({ totalEvents }); 
  } catch (error) {
    console.error("get event error:", error);
    return res.status(500).json({ 
      error: "Error fetching event details", 
      details: error.message 
    });
  }
});



eventRoute.get("/gettotalchannels", async (req, res) => {
  try {
    const totalEvents = await channel.getAllGlobalEventChannels(); // returns a number

    return res.status(200).json({ totalEvents }); 
  } catch (error) {
    console.error("get event error:", error);
    return res.status(500).json({ 
      error: "Error fetching event details", 
      details: error.message 
    });
  }
});


eventRoute.get("/getgloballiveevents", async (req, res) => {
  try {
    const totalEvents = await event.globalGetLiveEventCount();

    return res.status(200).json({ totalEvents }); // wrap in object
  } catch (error) {
    console.error("get event error:", error);
    return res.status(500).json({ 
      error: "Error fetching event details", 
      details: error.message 
    });
  }
});



// routes/eventreport.js (or your controller)
eventRoute.get("/getglobalproducers", async (req, res) => {
  try {
    const totalProducers = await event.globalGetProducerCount();
    res.json({ totalProducers });
  } catch (err) {
    console.error("Error fetching producers:", err);
    res.status(500).json({ error: "Failed to fetch producer count" });
  }
});


// routes/eventreport.js
eventRoute.get("/getglobalcities", async (req, res) => {
  try {
    const cityData = await event.globalGetCityCount();
    if (cityData === undefined) {
      return res.status(404).json({ error: "Cities not found" });
    }
    return res.status(200).json({ totalCities: cityData });
  } catch (error) {
    console.error("get city count error:", error);
    return res.status(500).json({ error: "Error fetching city count", details: error.message });
  }
});



eventRoute.get("/getchannelstats", async (req, res) => {
  try {
    // fetch all channels
    const channels = await channel.getAllChannels();

    // fetch all events
    const events = await channel.getAllEvents();

    const grouped = {};

    channels.forEach(ch => {
      const type = ch.channel_type;

      if (!grouped[type]) {
        grouped[type] = {
          channels: [],
          totalEvents: 0,
          liveEvents: 0,
          recordedEvents: 0,
          producers: new Set(),
          locations: new Set()
        };
      }

      // events for this channel
      const channelEvents = events.filter(e => e.channel === ch.channel_name);

      const liveCount = channelEvents.filter(e => e.broadcast_type === "Live").length;
      const recordedCount = channelEvents.filter(e => e.broadcast_type === "Recorded").length;

      const producers = new Set(channelEvents.filter(e => e.show_producer).map(e => e.show_producer));
      const locations = new Set(channelEvents.filter(e => e.location_hotel_name).map(e => e.location_hotel_name));

      grouped[type].channels.push({
        ...ch,
        totalEvents: channelEvents.length,
        liveEvents: liveCount,
        recordedEvents: recordedCount,
        producers: producers.size,
        locations: locations.size
      });

      grouped[type].totalEvents += channelEvents.length;
      grouped[type].liveEvents += liveCount;
      grouped[type].recordedEvents += recordedCount;

      producers.forEach(p => grouped[type].producers.add(p));
      locations.forEach(l => grouped[type].locations.add(l));
    });

    // convert sets to counts
    Object.keys(grouped).forEach(type => {
      grouped[type].producers = grouped[type].producers.size;
      grouped[type].locations = grouped[type].locations.size;
    });

    return res.json(grouped);
  } catch (error) {
    console.error("getchannelstats error:", error);
    return res.status(500).json({
      error: "Error fetching channel stats",
      details: error.message
    });
  }
});







export default eventRoute;
