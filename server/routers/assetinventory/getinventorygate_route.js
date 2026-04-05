import express from "express";
import * as assetInventory from "../../models/assetinventory_model.js";
import { isAdmin } from "../../middlewares/isadmin.js";
import { isLoggedIn } from "../../middlewares/isloggedin.js";

const gatePassRoute = express.Router();

gatePassRoute.post("/get-assetbygatepass", isLoggedIn, async (req, res) => {
  try {
    const {
      gatepassid
    } = req.body;

    // Require mandatory fields
    if (!gatepassid) {
      return res.status(400).send({ error: "Error occured." });
    }


  


    const assets = await assetInventory.getAssetByGatePassId(gatepassid);

    return res.status(201).send({ message: "Asset fetched",assets});
  } catch (error) {
	  console.log(error);
    return res.status(500).send({ error: "Error fetching asset", details: error.message });
  }
});

export default gatePassRoute;
