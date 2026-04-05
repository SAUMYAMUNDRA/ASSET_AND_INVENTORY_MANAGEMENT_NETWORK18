import express from "express";
import * as showtype from "../../../models/eventshow_model.js";
import { isAdmin } from "../../../middlewares/isadmin.js";
import { isLoggedIn } from "../../../middlewares/isloggedin.js";
import { isAuthorized } from "../../../middlewares/isAuthorized.js";
const createshowRoute = express.Router();

createshowRoute.post("/create-show-type", isLoggedIn,isAuthorized(31), async (req, res) => {
  try {
    const city_id=req.user.city_id;
    const { channelName } = req.body;  
    if (!channelName) {
      return res.status(400).send({ error: "Show Type is required" });
    }
    
    const newId = await showtype.createShow(channelName,city_id); 
    return res.status(201).send({ message: "Show created", id: newId });
  } catch (error) {
    console.error("create vendor error:", error);
    return res.status(500).send({ error: "Error creating Show Type" });
  }
});
createshowRoute.get("/get-show-types",isLoggedIn,isAuthorized(32), async (req, res) => {
  try {
      const city_id=req.user.city_id;

    const vendors = await showtype.getAllShowTypes(city_id);
    return res.status(200).send(vendors);
  } catch (error) {
    console.error("fetch vendors error:", error);
    return res.status(500).send({ error: "Error fetching vendors" });
  }
});

createshowRoute.delete("/delete-show-type/:id", isLoggedIn,isAuthorized(33), async (req, res) => {
  try {
    const { id } = req.params;
    const success = await showtype.deleteShowType(id);

    if (!success) {
      return res.status(404).send({ error: "Show Type not found" });
    }

    return res.status(200).send({ message: "Show Type deleted successfully" });
  } catch (error) {
    console.error("delete show error:", error);
    return res.status(500).send({ error: "Error deleting show type" });
  }
});
export default createshowRoute;
