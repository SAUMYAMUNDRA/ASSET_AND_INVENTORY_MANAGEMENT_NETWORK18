import express from "express";
import { isLoggedIn } from "../../../middlewares/isloggedin.js";
import * as gate from "../../../models/gatepass_model.js";
import * as equipments from "../../../models/gatepass_equipments_model.js";
import { isAuthorized } from "../../../middlewares/isAuthorized.js";

const updategatepassstatusRoute = express.Router();

updategatepassstatusRoute.put(
  "/updattegatepassstatus/:id",
  isLoggedIn,isAuthorized(23),
  async (req, res) => {
    try {
      const { id } = req.params;
      const status ="pending";

      if (!id) {
        return res.status(400).send({ error: "Gate pass row ID is required" });
      }
	  if (status === "active" || status === "returned") {
		if (req.user.role != "admin"){
			 return res.status(401).send({ error: "Not Authorized" });

		}
	  }		  
      // update gate pass status
      const success = await gate.updateGatePassStatus(id, status);

      if (!success) {
        return res
          .status(404)
          .send({ error: "Failed to update status of gate pass" });
      }

		// If returned → fetch equipments and update their status
		if (status === "returned") {
		  const equipmentsList = await equipments.getEquipmentsByGatePass(id);

		  if (equipmentsList.length > 0) {
			const equipIds = equipmentsList
			  .filter(eq => eq.status !== "early_returned")  
			  .map(eq => eq.equip_id);

			if (equipIds.length > 0) {
			  await equipments.updateEquipmentsStatus(equipIds);
			}
		  }
		}

      return res
        .status(200)
        .send({ message: "Gate Pass status updated successfully" });
    } catch (error) {
      console.error("edit-gatepass error:", error);
      return res.status(500).send({
        error: "Error updating gate pass",
        details: error.message,
      });
    }
  }
);





updategatepassstatusRoute.put(
  "/gatepassreturn_adminapprove/:id",
  isLoggedIn,isAuthorized(41),
  async (req, res) => {
    try {
      const { id } = req.params;
      const  status ="returned"

      if (!id) {
        return res.status(400).send({ error: "Gate pass row ID is required" });
      }
	  if (status === "active" || status === "returned") {
		if (req.user.role != "admin"){
			 return res.status(401).send({ error: "Not Authorized" });

		}
	  }		  
      // update gate pass status
      const success = await gate.updateGatePassStatus(id, status);

      if (!success) {
        return res
          .status(404)
          .send({ error: "Failed to update status of gate pass" });
      }

		// If returned → fetch equipments and update their status
		if (status === "returned") {
		  const equipmentsList = await equipments.getEquipmentsByGatePass(id);

		  if (equipmentsList.length > 0) {
			const equipIds = equipmentsList
			  .filter(eq => eq.status !== "early_returned")  
			  .map(eq => eq.equip_id);

			if (equipIds.length > 0) {
			  await equipments.updateEquipmentsStatus(equipIds);
			}
		  }
		}

      return res
        .status(200)
        .send({ message: "Gate Pass status updated successfully" });
    } catch (error) {
      console.error("edit-gatepass error:", error);
      return res.status(500).send({
        error: "Error updating gate pass",
        details: error.message,
      });
    }
  }
);



updategatepassstatusRoute.put(
  "/gatepassreturn_admindisapprove/:id",
  isLoggedIn,isAuthorized(41),
  async (req, res) => {
    try {
      const { id } = req.params;
      const status="active"

      if (!id) {
        return res.status(400).send({ error: "Gate pass row ID is required" });
      }
	  if (status === "active" || status === "returned") {
		if (req.user.role != "admin"){
			 return res.status(401).send({ error: "Not Authorized" });

		}
	  }		  
      // update gate pass status
      const success = await gate.updateGatePassStatus(id, status);

      if (!success) {
        return res
          .status(404)
          .send({ error: "Failed to update status of gate pass" });
      }

		// If returned → fetch equipments and update their status
		if (status === "returned") {
		  const equipmentsList = await equipments.getEquipmentsByGatePass(id);

		  if (equipmentsList.length > 0) {
			const equipIds = equipmentsList
			  .filter(eq => eq.status !== "early_returned")  
			  .map(eq => eq.equip_id);

			if (equipIds.length > 0) {
			  await equipments.updateEquipmentsStatus(equipIds);
			}
		  }
		}

      return res
        .status(200)
        .send({ message: "Gate Pass status updated successfully" });
    } catch (error) {
      console.error("edit-gatepass error:", error);
      return res.status(500).send({
        error: "Error updating gate pass",
        details: error.message,
      });
    }
  }
);

export default updategatepassstatusRoute;
