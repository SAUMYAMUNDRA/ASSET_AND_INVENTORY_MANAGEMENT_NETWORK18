import express from "express";
import * as gatepass from "../../../models/gatepass_model.js";
import { isLoggedIn } from "../../../middlewares/isloggedin.js";
import {updateAssetStatus} from '../../../models/assetinventory_model.js'
import * as gatepass_equip from "../../../models/gatepass_equipments_model.js"
import { isAuthorized } from "../../../middlewares/isAuthorized.js";
const creategatepassRoute = express.Router();

creategatepassRoute.post("/create-gatepass",isLoggedIn,isAuthorized(20), async (req, res) => {
  try {
    const {
      issued_to,
      employee_id,
      event_name,
      event_date,
      expected_return_date,
      equipment 
    } = req.body;

    if (!Array.isArray(equipment) || equipment.length === 0) {
      return res.status(400).send({ error: "Equipment array is required" });
    }
    
    const payload = {
      issued_to,
      issued_by: req.user.user_id,
      employee_id,
      event_name,
      event_date,
      expected_return_date
    };

    const insertId = await gatepass.createGatePass(payload);

    // loop through equipment IDs and insert them
    for (const equipId of equipment) {
      await gatepass_equip.addGatePassEquipment(equipId, insertId, "active");
      await updateAssetStatus(equipId,"Unavailable");
    }

    return res.status(201).send({ message: "gate_pass created", gatepass_id: insertId });
  } catch (error) {
    console.error("gatepass error:", error);
    return res.status(500).send({ error: "Error creating gatepass", details: error.message });
  }
});

export default creategatepassRoute;
