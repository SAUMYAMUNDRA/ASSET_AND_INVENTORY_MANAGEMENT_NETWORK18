import express from 'express';
import { isLoggedIn } from '../../../middlewares/isloggedin.js';  
import { getAllRbac } from '../../../models/rbac_model.js';
import { isAuthorized } from '../../../middlewares/isAuthorized.js';

const getrbac_route = express.Router();
const createrbac_route=express.Router();
getrbac_route.get('/get-rbac',  async (req, res) => {
  try {
    const rbac = await getAllRbac();

    return res.status(200).send({
      message: "Fetched all rbac successfully",
      rbac
    });
  } catch (error) {
    console.error("Error fetching rbac:", error);
    return res.status(400).send({
      error: "Cannot fetch all rbac"
    });
  }
});


createrbac_route.post("/create-rbac",async (req, res) => {
  try {
     const { fullname, email, password, role, city_id, permissions } = req.body;

    if (!route || !name || !category || !subcategory) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const result = await createRbac({ route, name, category, subcategory });

    return res.status(201).json({
      message: "RBAC entry created successfully",
      rbacId: result.insertId,
    });
  } catch (error) {
    console.error("Error creating RBAC:", error);
    return res.status(500).json({ error: "Cannot create RBAC" });
  }
});


export default getrbac_route;
