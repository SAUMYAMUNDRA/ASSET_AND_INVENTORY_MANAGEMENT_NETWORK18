// models/gatepassEquipment_model.js
import dbConnection from "../db/dbConnection.js";


export const addGatePassEquipment = async (equip_id, gatepass_id, status = "active") => {
  const sql = `
    INSERT INTO gate_pass_equipments (equip_id, gatepass_id, status)
    VALUES (?, ?, ?)
  `;
  const [result] = await dbConnection.query(sql, [equip_id, gatepass_id, status]);
  return result.insertId;
};

export const getEquipmentsByGatePass = async (gatepass_id) => {
  const sql = `
    SELECT gpe.*, ai.material, ai.make, ai.model, ai.serial_no 
    FROM gate_pass_equipments gpe
    JOIN asset_inventory ai ON gpe.equip_id = ai.id
    WHERE gpe.gatepass_id = ?
  `;
  const [rows] = await dbConnection.query(sql, [gatepass_id]);
  return rows;
};

export const updateEquipmentsStatus = async (equipIds) => {
  if (!equipIds || equipIds.length === 0) return;

  const sql = `
    UPDATE asset_inventory 
    SET status = 'Available' 
    WHERE id IN (?)
  `;

  await dbConnection.query(sql, [equipIds]);
};

// ✅ Update equipment status (active → closed, etc.)
export const updateGatePassEquipmentStatus = async (id, status) => {
  const sql = `
    UPDATE gate_pass_equipments
    SET status = ?
    WHERE id = ?
  `;
  const [result] = await dbConnection.query(sql, [status, id]);
  return result.affectedRows > 0;
};



export const updateGatePassEquipmentStatusearlyreturn = async (gatepass_id, equip_id, status) => {
  const sql = `
    UPDATE gate_pass_equipments
    SET status = ?
    WHERE gatepass_id = ? AND equip_id = ?
  `;
  const [result] = await dbConnection.query(sql, [status, gatepass_id, equip_id]);
  return result.affectedRows > 0;
};
// ✅ Delete a gate pass equipment entry
export const deleteGatePassEquipment = async (id) => {
  const sql = `DELETE FROM gate_pass_equipments WHERE id = ?`;
  const [result] = await dbConnection.query(sql, [id]);
  return result.affectedRows > 0;
};


export const deleteGatePassEquipmentbyequipid = async (id) => {
  const sql = `DELETE FROM gate_pass_equipments WHERE equip_id = ?`;
  const [result] = await dbConnection.query(sql, [id]);
  return result.affectedRows > 0;
};


// ✅ Optional: Get all active equipments
export const getActiveEquipments = async () => {
  const sql = `
    SELECT gpe.*, ai.material, ai.make, ai.model, ai.serial_no, gp.event_name, gp.event_date
    FROM gate_pass_equipments gpe
    JOIN asset_inventory ai ON gpe.equip_id = ai.id
    JOIN gate_pass gp ON gpe.gatepass_id = gp.id
    WHERE gpe.status = 'active'
  `;
  const [rows] = await dbConnection.query(sql);
  return rows;
};
