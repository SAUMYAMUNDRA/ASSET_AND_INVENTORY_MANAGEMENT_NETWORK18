import express from "express";
import { isLoggedIn } from "../../middlewares/isloggedin.js";
// Make sure to import your model functions correctly
import * as inventory from "../../models/assetinventory_model.js"; 

import * as gateequip from "../../models/gatepass_equipments_model.js"
import { isAuthorized } from "../../middlewares/isAuthorized.js";
const editinventory_Route = express.Router();

// This route now correctly handles editing an asset's information.
editinventory_Route.put("/edit-inventory/:id", isLoggedIn, async (req, res) => {
    try {
        const { id } = req.params;
        const assetData = req.body; 
        const user=req.user.user_id;
        console.log("user id is",user);
        
        if (!id) {
            return res.status(400).send({ error: "Inventory ID is required" });
        }

      
        const success = await inventory.updateAssetById(id,user, assetData);

        if (!success) {
            return res.status(404).send({ error: "Inventory item not found or no changes were made" });
        }

        return res.status(200).send({ message: "Inventory item edited successfully" });

    } catch (error) {
        console.error("edit-inventory error:", error);
        return res.status(500).send({
            error: "Error editing inventory item",
            details: error.message,
        });
    }
});

editinventory_Route.put("/to-maintenance/:id", isLoggedIn,isAuthorized(43), async (req, res) => {
    try {
        const { id } = req.params;
        const assetData = req.body; 
        const user=req.user.user_id;
        console.log("user id is",user);
        
        if (!id) {
            return res.status(400).send({ error: "Inventory ID is required" });
        }

      
        const success = await inventory.updateAssetById(id,user, assetData);

        if (!success) {
            return res.status(404).send({ error: "Inventory item not found or no changes were made" });
        }

        return res.status(200).send({ message: "Inventory item edited successfully" });

    } catch (error) {
        console.error("edit-inventory error:", error);
        return res.status(500).send({
            error: "Error editing inventory item",
            details: error.message,
        });
    }
});





editinventory_Route.put("/makeassetavailable/:id", isLoggedIn,isAuthorized(19), async (req, res) => {
  try {
    const { id } = req.params;  // this is equip_id
    const { gateid } = req.body; // this is gatepass_id

    if (!id || !gateid) {
      return res.status(400).send({ error: "Both Inventory ID and GatePass ID are required" });
    }

    console.log("gateid:", gateid);
    console.log("equipid:", id);

    // 1. Update inventory table
    const success = await inventory.updateAssetStatus(id, "Available");

    // 2. Update gate_pass_equipments table
    const success2 = await gateequip.updateGatePassEquipmentStatusearlyreturn(
      gateid,
      id,
      "early_returned"
    );

    if (!success || !success2) {
      return res
        .status(404)
        .send({ error: "Asset not found in inventory or gate pass, or no changes made" });
    }

    return res.status(200).send({ message: "Asset successfully marked as returned" });
  } catch (error) {
    console.error("makeassetavailable error:", error);
    return res.status(500).send({
      error: "Error updating asset return",
      details: error.message,
    });
  }
});



// The route has been renamed for clarity.
export default editinventory_Route;
