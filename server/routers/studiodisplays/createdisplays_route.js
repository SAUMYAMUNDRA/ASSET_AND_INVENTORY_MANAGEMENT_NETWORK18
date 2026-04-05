import express from "express";
import * as studiodisplay from "../../models/studiodisplays_model.js";
import {isLoggedIn} from '../../middlewares/isloggedin.js'
import {isAuthorized} from '../../middlewares/isAuthorized.js'

const createDisplayRoute = express.Router();

createDisplayRoute.post("/create-display", isLoggedIn,isAuthorized(11), async (req, res) => {
  try {
    const allowedFields = [
      "floor","studio","barco_model","cube_a","cube_b","cube_c","cube_d",
      "led_size_85_75_inch","led_size_65_55_inch","controller","lvc_sr_no","novastar_sr_no",
      "lvc_nds_status","wme_net_status","convertor","led_tv_85_75_input","led_tv_65_55_input",
      "hdmi_input","lvc_input","pixel_input","time","status","remarks"
      
    ];

    // require at least these minimal fields
    const { studio, floor } = req.body;
    if (!studio || !floor) {
      return res.status(400).send({ error: "'studio' and 'floor' are required" });
    }

    // Build payload from allowed fields
    const payload = {};
    for (const key of Object.keys(req.body)) {
      if (allowedFields.includes(key)) payload[key] = req.body[key];
    }

    // Always enforce city_id from JWT, not client input
    payload.city_id = req.user.city_id;

    if (Object.keys(payload).length === 1) { // only city_id present
      return res.status(400).send({ error: "No valid fields provided to create a studio display." });
    }

    // Optional duplicate-check
    const existing = await studiodisplay.getStudioDisplaysByStudio(studio);
    if (existing && existing.some(r =>
      String(r.floor).toLowerCase() === String(floor).toLowerCase() &&
      String(r.city_id) === String(payload.city_id)
    )) {
      return res.status(409).send({ error: "A display with the same studio and floor already exists in this city." });
    }

    // Create and return
    const insertId = await studiodisplay.createStudioDisplay(payload);
    const created = await studiodisplay.getStudioDisplayById(insertId);

    return res.status(201).send({ message: "Studio display created", display: created });
  } catch (error) {
    console.error("create-display error:", error);
    return res.status(500).send({ error: "Error creating studio display", details: error.message });
  }
});

export default createDisplayRoute;
