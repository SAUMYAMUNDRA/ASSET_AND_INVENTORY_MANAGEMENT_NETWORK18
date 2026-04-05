import express from "express";
import jwt from "jsonwebtoken";
import * as city from "../../models/city_model.js";

const verifyspecialadminRoute = express.Router();

verifyspecialadminRoute.post("/verify", async (req, res) => {
  try {
    const { email, password } = req.body;
    res.clearCookie("spadmintoken");

    if (!email || !password) {
      return res.status(400).send({ error: "Email and Password are required" });
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (email === adminEmail && password === adminPassword) {
      // Create token valid for 15 minutes
      const token = jwt.sign(
        { role: "specialAdmin", email },
        process.env.SESSION_SECRET_SP,
        { expiresIn: "15m" } // 15 minutes
      );

      // Set token as HttpOnly cookie with 15 minutes expiry
      res.cookie("spadmintoken", token, {
        httpOnly: true,
        secure: false, // set to true in production with HTTPS
        sameSite: "Strict",
        maxAge: 15 * 60 * 1000, // 15 minutes in milliseconds
      });

      return res.status(200).send({ message: "Admin verified successfully" });
    } else {
      // Clear cookie if invalid credentials
      return res.status(401).send({ error: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Admin verification error:", error);
    return res.status(500).send({ error: "Error verifying admin", details: error.message });
  }
});

export default verifyspecialadminRoute;
