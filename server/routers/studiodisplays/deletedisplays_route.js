import express from "express";
import * as studiodisplay from "../../models/studiodisplays_model.js";
import {isLoggedIn} from '../../middlewares/isloggedin.js'
import {isAuthorized} from '../../middlewares/isAuthorized.js'

const deletedisplay_route = express.Router();

deletedisplay_route.get("/delete-display/:id", isLoggedIn,isAuthorized(13), async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).send({ error: "Display ID is required" });
    }

    const success = await studiodisplay.deleteStudioDisplay(id);

    if (!success) {
      return res.status(404).send({ error: "Studio display not found" });
    }

    return res.status(200).send({ message: "Studio display deleted successfully" });
  } catch (error) {
    console.error("delete-display error:", error);
    return res.status(500).send({
      error: "Error deleting studio display",
      details: error.message,
    });
  }
});

export default deletedisplay_route;
