import dbConnection from "../db/dbConnection.js";

/**
 * Create a new Event Vendor record
 */
export const createEventVendor = async (vendor_name, city_id) => {
  if (!vendor_name) {
    throw new Error("Vendor name is required.");
  }
  if (!city_id) {
    throw new Error("City ID is required.");
  }

  const sql = `INSERT INTO event_vendor_name (vendor_name, city_id) VALUES (?, ?)`;
  const [result] = await dbConnection.query(sql, [vendor_name, city_id]);

  return result.insertId;
};

/**
 * Get Event Vendor by id
 */
export const getEventVendorById = async (id) => {
  const [rows] = await dbConnection.query(
    `SELECT * FROM event_vendor_name WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
};

/**
 * Get all Event Vendors
 */
export const getAllEventVendors = async (city_id) => {
  if (!city_id) {
    throw new Error("City ID is required.");
  }

  const sql = `SELECT * FROM event_vendor_name WHERE city_id = ? ORDER BY id DESC`;
  const [rows] = await dbConnection.query(sql, [city_id]);

  return rows;
};


/**
 * Get Event Vendor by name
 */
export const getEventVendorByName = async (vendor_name) => {
  const [rows] = await dbConnection.query(
    `SELECT * FROM event_vendor_name WHERE vendor_name = ?`,
    [vendor_name]
  );
  return rows[0] || null;
};

/**
 * Update Event Vendor by id
 */
export const updateEventVendorById = async (id, data) => {
  if (!data.vendor_name) {
    throw new Error("Vendor name is required to update.");
  }

  const sql = `UPDATE event_vendor_name SET vendor_name = ? WHERE id = ?`;
  const [result] = await dbConnection.query(sql, [data.vendor_name, id]);

  return result.affectedRows > 0;
};

/**
 * Delete Event Vendor by id
 */
export const deleteEventVendor = async (id) => {
  const [result] = await dbConnection.query(
    `DELETE FROM event_vendor_name WHERE id = ?`,
    [id]
  );
  return result.affectedRows > 0;
};
