import express from 'express';
import { getUserByEmail, getUserById } from '../../models/user_model.js'; // Adjust the path as needed
import { isLoggedIn } from '../../middlewares/isloggedin.js'; // Adjust the path as needed
import { access } from 'fs';

const currentuser_route = express.Router();

// GET route to return the current logged-in user
currentuser_route.get('/current-user', isLoggedIn, async (req, res) => {
    try {
        // isLoggedIn middleware should have populated req.user with user_id
        const user_id = req.user.email;

        if (!user_id) {
            // This case should ideally be caught by isLoggedIn, but good for robustness
            return res.status(401).send({ error: "User not authenticated or user_id missing." });
        }

        const user = await getUserByEmail(user_id);

        if (!user) {
            return res.status(404).send({ error: "User not found in DB." });
        }

        // Return the essential user data
      return res.status(200).send({
  user: {
    city_id: user.city_id,
    city_name: user.city_name,
    name: user.fullname,
    email: user.email,
    studio_display: !!user.studio_display,
    asset_inventory: !!user.asset_inventory,
    event_report: !!user.event_report,
    permissions: user.permissions,
    access_name:user.access_name
  }
});
    } catch (error) {
        console.error('Error fetching current user:', error);
        return res.status(500).send({ error: "Error fetching current user details.", details: error.message });
    }
});

export default currentuser_route;