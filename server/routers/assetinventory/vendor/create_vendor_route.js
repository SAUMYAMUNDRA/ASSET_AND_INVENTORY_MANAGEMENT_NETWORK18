import express from "express";
import * as vendor from "../../../models/eventvendor_model.js";
import { isAdmin } from "../../../middlewares/isadmin.js";
import { isLoggedIn } from "../../../middlewares/isloggedin.js";
import { isAuthorized } from "../../../middlewares/isAuthorized.js";
const createvendorRoute = express.Router();

createvendorRoute.post("/create-vendor", isLoggedIn,isAuthorized(25), async (req, res) => {
  try {
    const city_id=req.user.city_id;
    
    const { vendorName } = req.body;  
    if (!vendorName) {
      return res.status(400).send({ error: "Vendor name is required" });
    }
    console.log("vendor name route",vendorName);
    
    const newId = await vendor.createEventVendor(vendorName,city_id); 
    return res.status(201).send({ message: "Vendor created", id: newId });
  } catch (error) {
    console.error("create vendor error:", error);
    return res.status(500).send({ error: "Error creating vendor" });
  }
});
createvendorRoute.get("/get-vendors", isLoggedIn,isAuthorized(26),async (req, res) => {
  try {
     const city_id=req.user.city_id;
    const vendors = await vendor.getAllEventVendors(city_id);
    return res.status(200).send(vendors);
  } catch (error) {
    console.error("fetch vendors error:", error);
    return res.status(500).send({ error: "Error fetching vendors" });
  }
});

createvendorRoute.delete("/delete-vendor/:id", isLoggedIn,isAuthorized(27), async (req, res) => {
  try {
    const { id } = req.params;
    const success = await vendor.deleteEventVendor(id);

    if (!success) {
      return res.status(404).send({ error: "Vendor not found" });
    }

    return res.status(200).send({ message: "Vendor deleted successfully" });
  } catch (error) {
    console.error("delete vendor error:", error);
    return res.status(500).send({ error: "Error deleting vendor" });
  }
});
export default createvendorRoute;
