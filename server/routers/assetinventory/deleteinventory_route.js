import express from "express";
import * as inventory from "../../models/assetinventory_model.js";
import { isAdmin } from "../../middlewares/isadmin.js";
import { isLoggedIn } from "../../middlewares/isloggedin.js";
import { isAuthorized } from "../../middlewares/isAuthorized.js";

const deleteinventory_route = express.Router();

deleteinventory_route.delete("/delete-inventory/:id", isLoggedIn, isAuthorized(18),async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).send({ error: "Inventory ID is required" });
    }

    const success = await inventory.deleteAsset(id);

    if (!success) {
      return res.status(404).send({ error: " Inventory not found" });
    }

    return res.status(200).send({ message: " Inventory deleted successfully" });
  } catch (error) {
    console.error("delete-Inventory error:", error);
    return res.status(500).send({
      error: "Error deleting Inventory",
      details: error.message,
    });
  }
});

export default deleteinventory_route;
