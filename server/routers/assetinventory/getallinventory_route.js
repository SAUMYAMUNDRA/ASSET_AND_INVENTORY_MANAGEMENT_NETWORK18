import express from "express";
import * as inventory from "../../models/assetinventory_model.js";
import {isLoggedIn} from '../../middlewares/isloggedin.js'
import { isAuthorized } from "../../middlewares/isAuthorized.js";

const getallinventories_route = express.Router();

getallinventories_route.get("/get-inventory", isLoggedIn,isAuthorized(17), async (req, res) => {
  try {
 
    const inventories= await inventory.getAllAssets()
  
    console.log("inventories:",inventories);
    
   
    return res.status(200).send({
      message: "Fetched all inventories successfully",
      inventories,
    });
  } catch (error) {
    console.error("get-inventry error:", error);
    return res.status(500).send({
      error: "Error fetching inventoreis",
      details: error.message,
    });
  }
});

export default getallinventories_route;
