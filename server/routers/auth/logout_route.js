import express from "express";
import { isLoggedIn } from "../../middlewares/isloggedin.js";
import * as refreshTokenModel from "../../models/refresh_token_model.js";

const logout_route = express.Router();

logout_route.post("/logout", isLoggedIn, async (req, res) => {
  try {
    // Clear cookie
    res.clearCookie("authToken", {
      httpOnly: true,
      secure: false,
      sameSite: "strict"
    });

    const { logout_type } = req.body; 

    if (!req.user?.user_id) {
      return res.status(400).json({ error: "Invalid user session" });
    }

    if (logout_type === "all") {
      // Remove all refresh tokens for this user
      const deletedCount = await refreshTokenModel.deleteTokensByUserId(req.user.user_id);
      console.log(`Deleted ${deletedCount} tokens for user ${req.user.user_id}`);
    } else {
      // Remove only current device's token
      if (!req.user.device_id) {
        return res.status(400).json({ error: "Device ID not found for single logout" });
      }
      await refreshTokenModel.deleteTokenByDeviceId(req.user.user_id, req.user.device_id);
    }

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ error: "Error during logout" });
  }
});

export default logout_route;
