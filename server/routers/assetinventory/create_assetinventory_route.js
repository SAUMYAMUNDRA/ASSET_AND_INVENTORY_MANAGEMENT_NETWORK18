import express from "express";
import * as assetInventory from "../../models/assetinventory_model.js";
import { isAdmin } from "../../middlewares/isadmin.js";
import { isLoggedIn } from "../../middlewares/isloggedin.js";
import { isAuthorized } from "../../middlewares/isAuthorized.js";

const createAssetInventoryRoute = express.Router();

createAssetInventoryRoute.post(
  "/create-assetinventory",
  isLoggedIn,
  isAuthorized(16),
  async (req, res) => {
    try {
      const {
        material,
        status,    
        location,
        make,
        model,
        serial,      
        asset_tag,   
      } = req.body;

      // Require mandatory fields
      if (!material || !status || !asset_tag) {
        return res
          .status(400)
          .send({ error: "'material', 'status' and 'asset_tag' are required" });
      }

      // Build payload for DB
      const payload = {
        material,
        status,                    
        location: location || "",
        make: make || "",
        model: model || "",
        serial_no: serial || "",   
        asset_tag: asset_tag || "",
      };

      // Optional: Check for duplicate asset_tag
      const existing = await assetInventory.getAssetByTag(asset_tag);
      if (existing) {
        return res
          .status(409)
          .send({ error: "Asset with this tag already exists" });
      }

      console.log("payload is", payload);

      // Insert
      const insertId = await assetInventory.createAsset(payload);
      const created = await assetInventory.getAssetById(insertId);

      return res.status(201).send({ message: "Asset created", asset: created });
    } catch (error) {
      console.error("create-asset error:", error);
      return res
        .status(500)
        .send({ error: "Error creating asset", details: error.message });
    }
  }
);

export default createAssetInventoryRoute;
