import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import * as authModel from '../../models/user_model.js';
import * as refreshTokenModel from '../../models/refresh_token_model.js'; 

const login_route = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

login_route.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

   

    if (!email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const user = await authModel.getUserByEmail(email);
 
    if (!user) {
      return res.status(401).json({ error: "Invalid Credentials." });
    }

    if (password !== user.password) {
      return res.status(401).json({ error: "Invalid Credentials." });
    }

    const device_id = crypto.randomBytes(24).toString("hex");
    const ref_token = crypto.randomBytes(24).toString("hex");

    const expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
	await refreshTokenModel.insertToken(
	  user.user_id,
	  device_id,
	  ref_token,
	  expires_at
	);
    
    const token = jwt.sign(
      {
        user_id: user.user_id,
        city_id:user.city_id,
        city_name:user.city_name,
        email: user.email,
        role: user.role,
        fullname: user.fullname,
        permissions: user.permissions,
        access_name:user.access_name,
        device_id,
		ref_token,

      },
      JWT_SECRET,
      { expiresIn: "30m" }
    );

    // ✅ Send JWT in cookie
    res.cookie("authToken", token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 30*24*60 * 60 * 1000 
    });

    res.status(200).json({
      message: "Login successful",
      
    });

  } catch (error) {
    console.error("Error logging in:", error);
    return res.status(500).json({ error: "Error logging in" });
  }
});

export default login_route;