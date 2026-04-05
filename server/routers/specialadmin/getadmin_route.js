import express from "express";
import jwt from "jsonwebtoken";
import * as city from "../../models/city_model.js";
import * as user from "../../models/user_model.js";

const getadminRoute = express.Router();

// Middleware to verify special admin
const verifySpecialAdmin = (req, res, next) => {
  const token = req.cookies?.spadmintoken;

  if (!token) {
    return res.status(401).send({ error: "No admin token found" });
  }

  try {
    const decoded = jwt.verify(token, process.env.SESSION_SECRET_SP);

    if (decoded.email !== process.env.ADMIN_EMAIL || decoded.role !== "specialAdmin") {
      return res.status(403).send({ error: "Not authorized as special admin" });
    }

    req.admin = decoded;
    next();
  } catch (err) {
	  console.log(err);
    res.clearCookie("spadmintoken");
    return res.status(401).send({ error: "Invalid or expired admin token" });
  }
};

getadminRoute.get("/get-admin", verifySpecialAdmin, async (req, res) => {
  try {
    // Fetch all users with role === "admin"
    let admins = await user.getAllUsers({ role: "admin" });

    // Fetch all cities
    const cities = await city.getAllCities();

    // Map city_id to city details
    const cityMap = {};
    cities.forEach(c => {
      cityMap[c.id] = {
        cityname: c.city_name,
        studio_display: !!c.studio_display,
        asset_inventory: !!c.asset_inventory,
        event_report: !!c.event_report,
      };
    });

    admins = admins.map((admin) => {
      const cityDetails = cityMap[admin.city_id] || {
        id: null,
        cityname: "Unknown",
        studio_display: false,
        asset_inventory: false,
        event_report: false,
      };

      return {
        id: cityDetails.id,
        adminname: admin.fullname || admin.name,
        adminemail: admin.adminemail || admin.email,
        permissions: admin.permissions || [],
        ...cityDetails,
      };
    });

    return res.status(200).send({ admins });
  } catch (error) {
    console.error("Error fetching admin data:", error);
    return res
      .status(500)
      .send({ error: "Error fetching admin data", details: error.message });
  }
});

export default getadminRoute;
