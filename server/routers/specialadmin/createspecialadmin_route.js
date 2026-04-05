import express from "express";
import jwt from "jsonwebtoken";
import * as city from "../../models/city_model.js";
import * as user from "../../models/user_model.js";
import * as rbac from "../../models/rbac_model.js";

const createspecialadminRoute = express.Router();

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
    res.clearCookie("spadmintoken");
    return res.status(401).send({ error: "Invalid or expired admin token" });
  }
};


createspecialadminRoute.post("/create-admin", verifySpecialAdmin, async (req, res) => {
  try {
    const {
      cityname: city_name,
      adminname: name,
      adminemail: email,
      adminpassword: password,
    } = req.body;

    // 1️⃣ Check if admin email already exists
    const existingUser = await user.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).send({ error: "Admin email already exists" });
    }

    // 2️⃣ Get all rbac IDs (this becomes permissions for the new admin)
    const allPermissions = await rbac.getAllRbacIds();

    // 3️⃣ Create city with permission flags (you can keep your old logic if needed)
    const cid = await city.createCity(
      city_name,
      true,  // studio_display
      true,  // asset_inventory
      true   // event_report
    );

    // 4️⃣ Create admin user with all permissions
    const insertId = await user.createUser(
      name,
      email,
      password,
      "admin",
      cid,
      allPermissions
    );

    return res.status(201).send({ message: "Admin created successfully" });
  } catch (error) {
    console.error("Admin creation error:", error);
    return res
      .status(500)
      .send({ error: "Error creating admin", details: error.message });
  }
});
export default createspecialadminRoute;
