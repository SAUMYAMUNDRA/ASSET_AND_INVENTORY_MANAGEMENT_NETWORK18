import dbConnection from "../db/dbConnection.js";

export const createShow = async (vendor_name,city_id) => {
  if (!vendor_name) {
    throw new Error("Vendor name is required.");
  }

  const sql = `INSERT INTO event_show_types (show_type,city_id) VALUES (?,?)`;
  const [result] = await dbConnection.query(sql, [vendor_name,city_id]);

  return result.insertId;
};


export const getAllShowTypes = async (city_id) => {
  if (!city_id) {
    throw new Error("City ID is required.");
  }

  const sql = `SELECT * FROM event_show_types WHERE city_id = ? ORDER BY id DESC`;
  const [rows] = await dbConnection.query(sql, [city_id]);

  return rows;
};






export const deleteShowType = async (id) => {
  const [result] = await dbConnection.query(
    `DELETE FROM event_show_types WHERE id = ?`,
    [id]
  );
  return result.affectedRows > 0;
};
