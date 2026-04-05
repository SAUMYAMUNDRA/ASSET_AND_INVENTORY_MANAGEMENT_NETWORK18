import express from "express";
import * as eventreminder from "../../models/eventreminder_model.js";

const create_eventreminderRoute = express.Router();

// ✅ Create Event Reminder
create_eventreminderRoute.post("/createreminder", async (req, res) => {
  try {

    const {
      event_date,
      event_time,
      channel_name,
      producer_name,
      program_name,
      show_type,
      location,
      reminder_days,
      setup_type,
      camera_setup,
    } = req.body;
if (!event_date || !event_time || !channel_name || !program_name) {
  return res.status(400).json({ error: "Missing required fields" });
}
    // Insert into DB
    const insertId = await eventreminder.createEventreminder({
      event_date,
      event_time,
      channel_name,
      producer_name,
      program_name,
      show_type,
      location,
      reminder_days,
      setup_type,
      camera_setup,
    });

    // Fetch the saved record
    const savedEvent = await eventreminder.getEventreminderById(insertId);

    res.status(201).json(savedEvent);
  } catch (error) {
    console.error("create-eventreminder error:", error);
    return res.status(500).send({
      error: "Error creating event reminder",
      details: error.message,
    });
  }
});

create_eventreminderRoute.get("/allreminders", async (req, res) => {
  try {
    const reminders = await eventreminder.getAllEventreminder();
    res.json(reminders);
  } catch (error) {
    console.error("getAll-eventreminder error:", error);
    res.status(500).json({ error: "Error fetching event reminders" });
  }
});


export default create_eventreminderRoute;
