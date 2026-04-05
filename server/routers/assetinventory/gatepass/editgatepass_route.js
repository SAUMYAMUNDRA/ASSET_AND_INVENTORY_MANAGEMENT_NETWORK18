import express from "express";
import { isLoggedIn } from "../../../middlewares/isloggedin.js";
import { updateAssetStatus } from "../../../models/assetinventory_model.js";
import * as gatepass_equip from "../../../models/gatepass_equipments_model.js";
import { isAuthorized } from "../../../middlewares/isAuthorized.js";

const editGatepassRoute = express.Router();

editGatepassRoute.put("/edit-gatepass/:id", isLoggedIn,isAuthorized(22), async (req, res) => {
  try {
    const gatepass_id = req.params.id;
    const { equipment } = req.body;

    if (!Array.isArray(equipment) || equipment.length === 0) {
      return res.status(400).send({ error: "Equipment array is required" });
    }

    // ✅ Add only new equipment links
    for (const equipId of equipment) {
      await gatepass_equip.addGatePassEquipment(equipId, gatepass_id, "active");
      await updateAssetStatus(equipId, "Unavailable");
    }

    return res.status(200).send({ message: "New equipments added to gatepass", gatepass_id });
  } catch (error) {
    console.error("edit gatepass error:", error);
    return res.status(500).send({ error: "Error editing gatepass", details: error.message });
  }
});

export default editGatepassRoute;
