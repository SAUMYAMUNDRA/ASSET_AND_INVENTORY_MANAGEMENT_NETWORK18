import express from "express";
import { updateStudioDisplayAdditionalNotes,getStudioDisplayAdditionalNotes } from "../../models/studiodisplays_model.js";
import {isLoggedIn} from '../../middlewares/isloggedin.js'
import {isAuthorized} from '../../middlewares/isAuthorized.js'
const router = express.Router();

// GET additional notes
router.get("/get-additional",isLoggedIn,isAuthorized(15), async (req, res) => {
  try {
    const rows  = await getStudioDisplayAdditionalNotes();
    res.json(rows || { studio_display_additional_notes: "" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch additional notes" });
  }
});

// POST update additional notes
router.post("/edit-additional",isLoggedIn,isAuthorized(38), async (req, res) => {
  try {
    const { studio_display_additional_notes } = req.body;
    await updateStudioDisplayAdditionalNotes(studio_display_additional_notes);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update additional notes" });
  }
});

export default router;
