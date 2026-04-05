import express from 'express'
import * as refresh from "../../../models/refresh_token_model.js"
import { isAdmin } from '../../../middlewares/isadmin.js'; 
import { isLoggedIn } from '../../../middlewares/isloggedin.js';
const logoutuser_route=express.Router();
logoutuser_route.post("/logout-user", isLoggedIn, async (req, res) => {
  try {
   

    const { user_id } = req.body;
    if (!user_id) return res.status(400).json({ error: "User ID required" });

    // Remove all refresh tokens of the target user
    const deletedCount = await refresh.deleteTokensByUserId(user_id);

    res.status(200).json({
      message: `User ${user_id} logged out successfully`,
      deletedCount,
    });
  } catch (error) {
    console.error("Error in admin logout:", error);
    res.status(500).json({ error: "Error logging out user" });
  }
});
export default logoutuser_route
