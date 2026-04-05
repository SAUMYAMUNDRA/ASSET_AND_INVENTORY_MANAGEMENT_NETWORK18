import express from "express";
import { updateStudioDisplayById } from "../../models/studiodisplays_model.js";

import { isLoggedIn } from "../../middlewares/isloggedin.js";
import { isAuthorized } from "../../middlewares/isAuthorized.js";

const editdisplays_route = express.Router();

editdisplays_route.put("/edit-display/:id/:username", isLoggedIn,isAuthorized(14), async (req, res) => {
    try {
        const { id, username } = req.params;
        const updateData = req.body;
        const curr_username=req.user.user_id;
        if (!id) {
            return res.status(400).send({ error: "Display ID is required" });
        }

        if (!updateData || Object.keys(updateData).length === 0) {
            return res.status(400).send({ error: "No data provided to update" });
        }

        const success = await updateStudioDisplayById(id, updateData,curr_username);
		console.log(updateData);

        if (!success) {
            return res.status(404).send({ error: "Studio display not found" });
        }

        return res.status(200).send({ message: "Studio display updated successfully" });
    } catch (error) {
        return res.status(500).send({
            error: "Error updating studio display",
            details: error.message,
        });
    }
});



editdisplays_route.put("/update-specific-fields/:id/:username", isLoggedIn,isAuthorized(39), async (req, res) => {
    try {
        const { id, username } = req.params;
        const updateData = req.body;
        const curr_username=req.user.user_id;
        if (!id) {
            return res.status(400).send({ error: "Display ID is required" });
        }

        if (!updateData || Object.keys(updateData).length === 0) {
            return res.status(400).send({ error: "No data provided to update" });
        }

        const success = await updateStudioDisplayById(id, updateData,curr_username);
		console.log(updateData);

        if (!success) {
            return res.status(404).send({ error: "Studio display not found" });
        }

        return res.status(200).send({ message: "Studio display updated successfully" });
    } catch (error) {
        return res.status(500).send({
            error: "Error updating studio display",
            details: error.message,
        });
    }
});

export default editdisplays_route;