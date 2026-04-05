import express from 'express';
import { isAdmin } from '../../../middlewares/isadmin.js';  
import { getAllUsers } from '../../../models/user_model.js';
import { isLoggedIn } from '../../../middlewares/isloggedin.js';
import { isAuthorized } from '../../../middlewares/isAuthorized.js';

const getallusers_route = express.Router();

getallusers_route.post('/list-users', isLoggedIn,isAuthorized(1), async (req, res) => {
  try {
    const users = await getAllUsers();

    return res.status(200).send({
      message: "Fetched all users successfully",
      users
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(400).send({
      error: "Cannot fetch all users"
    });
  }
});

export default getallusers_route;
