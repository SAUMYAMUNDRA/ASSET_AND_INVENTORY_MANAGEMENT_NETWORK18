import express from "express";
import * as gatepass from "../../../models/gatepass_model.js";
import { isAdmin } from "../../../middlewares/isadmin.js";
import { isLoggedIn } from "../../../middlewares/isloggedin.js";
import { isAuthorized } from "../../../middlewares/isAuthorized.js";
const getGatePassRoute = express.Router();

/** 
 * @route 
 * @desc 
 * @access 
 */
getGatePassRoute.get("/gatepass", isLoggedIn,isAuthorized(21), async (req, res) => {
  try {
    const passes = await gatepass.getAllGatePasses();
    const totalIssued = passes.length;
    const returned = passes.filter(p => p.status === "Returned").length;
    const active = passes.filter(p => p.status === "Active").length;
    const overdue = passes.filter(p => p.status === "Overdue").length;

    return res.status(200).send({
      totalIssued,
      returned,
      active,
      overdue,
      rows: passes   // 👈 matches frontend
    });
  } catch (error) {
    console.error("getGatePass error:", error);
    return res
      .status(500)
      .send({ error: "Error fetching gate passes", details: error.message });
  }
});


getGatePassRoute.get("/gatepassbyempid", isLoggedIn, async (req, res) => {
  try {
    const userid=req.user.user_id;
    console.log("user id is:",userid);
    
    const passes = await gatepass.getGatePassByEmployeeId(userid);

    // compute stats
    const totalIssued = passes.length;
    const returned = passes.filter(p => p.status === "Returned").length;
    const active = passes.filter(p => p.status === "Active").length;
    const overdue = passes.filter(p => p.status === "Overdue").length;

    return res.status(200).send({
      totalIssued,
      returned,
      active,
      overdue,
      rows: passes   
    });
  } catch (error) {
    console.error("getGatePass error:", error);
    return res
      .status(500)
      .send({ error: "Error fetching gate passes", details: error.message });
  }
});

export default getGatePassRoute;
