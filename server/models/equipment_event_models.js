import dbConnection from "../db/dbConnection.js";

// Add multiple equipments for an event
export const addEquipments = async (event_id, equipmentData) => {
  if (!event_id || !Array.isArray(equipmentData) || equipmentData.length === 0) {
    throw new Error("Invalid equipment data input");
  }

  const values = equipmentData.map((item,city_id) => [
    event_id,
    item.equipment,
    item.modelNo || null,
    item.qty || 1,
    item.installationTime || null,
    item.doneTime || null,
    item.vendorName || null, // null means in-house
    item.remarks || null,
    item.status || null,
    city_id
  ]);

  const sql = `
    INSERT INTO equipment_events
    (event_id, equipment, model_no, qty, installation_time, done_time, vendor_name, remarks, status,city_id)
    VALUES ?
  `;

  const [result] = await dbConnection.query(sql, [values]);
  return result.affectedRows;
};

// Get all equipments for an event
export const getEquipmentsByEvent = async (event_id) => {
  const sql = `SELECT * FROM equipment_events WHERE event_id = ?`;
  const [rows] = await dbConnection.query(sql, [event_id]);
  return rows;
};

// Update a single equipment entry
export const updateEquipment = async (id, updateData) => {
  const setClauses = [];
  const values = [];
  for (const key in updateData) {
    if (Object.hasOwnProperty.call(updateData, key)) {
      setClauses.push(`${key} = ?`);
      values.push(updateData[key]);
    }
  }

  if (setClauses.length === 0) {
    return false; // nothing to update
  }

  const sql = `
    UPDATE equipment_events
    SET ${setClauses.join(", ")}
    WHERE id = ?
  `;
  values.push(id);

  const [result] = await dbConnection.query(sql, values);
  return result.affectedRows > 0;
};

// Delete a single equipment entry
export const deleteEquipment = async (id) => {
  const sql = `DELETE FROM equipment_events WHERE id = ?`;
  const [result] = await dbConnection.query(sql, [id]);
  return result.affectedRows > 0;
};
