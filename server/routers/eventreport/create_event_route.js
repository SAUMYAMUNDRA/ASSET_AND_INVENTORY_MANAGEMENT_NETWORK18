import express from "express";
import * as event from "../../models/events_model.js"
import * as electric from "../../models/electricpower_event_models.js"
import * as live from "../../models/livesource_event_model.js"

import * as equipment from "../../models/equipment_event_models.js"; // <-- import the equipment model

import * as dayModel  from "../../models/days_events_model.js"
import { isLoggedIn } from "../../middlewares/isloggedin.js";
import {isAuthorized} from '../../middlewares/isAuthorized.js'

const create_eventRoute = express.Router();
create_eventRoute.post("/create-event", isLoggedIn,isAuthorized(34), async (req, res) => {
  try {
    const toNull = (val) => (val === "" ? null : val);
    const city_id=req.user.city_id;
    // Normalize incoming data
const normalizedData = {
  event_name: req.body.eventName,
  event_date: toNull(req.body.date),
  channel: req.body.channel,
  broadcast_type: req.body.broadcastType,
  location_hotel_name: toNull(req.body.location),
  state_city: toNull(req.body.city),
  setup_type: toNull(req.body.setup),
  camera: toNull(req.body.camera),
  jimmy_jib: toNull(req.body.jimmy),
  show_type: toNull(req.body.showType),
  event_engineer: toNull(req.body.event_engineer),
  show_producer: toNull(req.body.show_producer),
  show_dop: toNull(req.body.show_dop),
  online_editor: toNull(req.body.online_editor),
  electrical: toNull(req.body.electrical),
  sound_engineer: toNull(req.body.sound_engineer),
  production_control: toNull(req.body.production_control),
  setup_date: toNull(req.body.setupDate),
  setup_start_time: toNull(req.body.setupStartTime),
  setup_end_time: toNull(req.body.setupEndTime),
  checking_done: toNull(req.body.checkingDone),
  created_by: req.user.user_id,
};

// Arrays
const days = req.body.day || [];
const electricData = req.body.electricData || [];
const liveSourceData = req.body.liveSourceData || [];
const equipmentData = req.body.equipmentData || [];

    // Required field validation
if (
  !normalizedData.event_name ||
  !normalizedData.event_date ||
  !normalizedData.channel ||
  !normalizedData.broadcast_type
) {
  return res.status(400).send({
    error: "'eventName', 'date', 'channel', and 'broadcastType' are required",
  });
}

    // Create event in DB
    const eventid = await event.addEvent(normalizedData, city_id);

    // Add electric sources
    if (electricData.length > 0) {
      await electric.addElectricSources(eventid, electricData,city_id);
    }

    // Add live sources
    if (liveSourceData.length > 0) {
      await live.addLiveSources(eventid, liveSourceData,city_id);
    }

    // Add equipments
    if (equipmentData.length > 0) {
      await equipment.addEquipments(eventid, equipmentData,city_id);
    }

    // Add days
    if (Array.isArray(days) && days.length > 0) {
      for (const d of days) {
        await dayModel.createEventDay({ event_id: eventid, ...d },city_id);
      }
    }

    return res
      .status(201)
      .send({ message: "Event created successfully", event_id: eventid });
  } catch (error) {
    console.error("create-event error:", error);
    return res
      .status(500)
      .send({ error: "Error creating event", details: error.message });
  }
});


export default create_eventRoute