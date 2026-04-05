import express from "express";
import jwt from "jsonwebtoken";
import * as city from "../../models/city_model.js";

const editspecialadminRoute = express.Router();

// Middleware to check special admin token and email
const verifySpecialAdmin = (req, res, next) => {
  const token = req.cookies?.spadmintoken;

  if (!token) {
    return res.status(401).send({ error: "No admin token found" });
  }

  try {
    const decoded = jwt.verify(token, process.env.SESSION_SECRET_SP);

    // Optionally, you can also check email against env
    if (decoded.email !== process.env.ADMIN_EMAIL || decoded.role !== "specialAdmin") {
      return res.status(403).send({ error: "Not authorized as special admin" });
    }

    req.admin = decoded; // attach decoded info if needed
    next();
  } catch (err) {
    // Clear invalid token
    res.clearCookie("spadmintoken");
    return res.status(401).send({ error: "Invalid or expired admin token" });
  }
};

editspecialadminRoute.post("/edit-admindetails", verifySpecialAdmin, async (req, res) => {
  try {
    const {
      originalCityname,
      cityname,
      studio_display = false,
      asset_inventory = false,
      event_report = false
    } = req.body;

    if (!originalCityname) {
      return res.status(400).send({ error: "Original city name is required" });
    }

    // 1️⃣ Check if the new city name already exists (if it's changed)
    if (cityname && cityname !== originalCityname) {
      const duplicate = await city.getCityByName(cityname);
      if (duplicate.length > 0) {
        return res.status(400).send({ error: "City name already exists" });
      }

      // Update city name
      const updatedName = await city.updateCityByName(originalCityname, { city_name: cityname });
      if (!updatedName) {
        return res.status(500).send({ error: "Failed to update city name" });
      }
    }

    // 2️⃣ Update permissions
    const updatedPermissions = await city.updateCityPermissionsByName(cityname || originalCityname, {
      studio_display,
      asset_inventory,
      event_report
    });

    if (!updatedPermissions) {
      return res.status(500).send({ error: "Failed to update city permissions" });
    }

    return res.status(200).send({ message: "Admin edited successfully" });
  } catch (error) {
    console.error("Admin edition error:", error);
    return res
      .status(500)
      .send({ error: "Error editing admin", details: error.message });
  }
});

export default editspecialadminRoute;
