import express from "express";
import * as studiodisplay from "../../models/studiodisplays_model.js";
import {isLoggedIn} from '../../middlewares/isloggedin.js'
import {isAuthorized} from '../../middlewares/isAuthorized.js'

const getalldisplays_route = express.Router();

getalldisplays_route.get("/get-displays", isLoggedIn,isAuthorized(12), async (req, res) => {
  try {
    const cityId=req.user.city_id;

    const displays = await studiodisplay.getAllStudioDisplays(cityId);
    
    return res.status(200).send({
      message: "Fetched all studio displays successfully",
      displays,
    });
  } catch (error) {
    console.error("get-displays error:", error);
    return res.status(500).send({
      error: "Error fetching studio displays",
      details: error.message,
    });
  }
});

export default getalldisplays_route;
