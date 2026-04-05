import dbConnection from "../db/dbConnection.js";

/**
 * Create a new Eventreminder Reminder record
 */
export const createEventreminder = async (event) => {
  const allowedFields = [
    "event_date",
    "event_time",
    "channel_name",
    "producer_name",
    "program_name",
    "show_type",
    "location",
    "reminder_days",
    "setup_type",
    "camera_setup",
    
  ];

  const keys = Object.keys(event).filter((k) => allowedFields.includes(k));
  if (keys.length === 0) throw new Error("No valid fields provided for insert.");

  const placeholders = keys.map(() => "?").join(", ");
  const sql = `INSERT INTO event_reminder (${keys.join(", ")}) VALUES (${placeholders})`;
  const values = keys.map((k) => event[k]);

  const [result] = await dbConnection.query(sql, values);
  return result.insertId;
};

/**
 * Get Eventreminderreminder by ID
 */
export const getEventreminderById = async (id) => {
  const [rows] = await dbConnection.query(
    `SELECT * FROM event_reminder WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
};

/**
 * Get all Eventreminder
 */
export const getAllEventreminder = async () => {
  const [rows] = await dbConnection.query(
    `SELECT * FROM event_reminder ORDER BY created_at DESC`
  );
  return rows;
};

/**
 * Get Eventreminder by Channel
 */
export const getEventreminderByChannel = async (channel) => {
  const [rows] = await dbConnection.query(
    `SELECT * FROM event_reminder WHERE channel_name = ? ORDER BY created_at DESC`,
    [channel]
  );
  return rows;
};

/**
 * Update Eventreminder by ID
 */
export const updateEventreminderById = async (id, data) => {
  const allowedFields = [
    "event_date",
    "event_time",
    "channel_name",
    "producer_name",
    "program_name",
    "show_type",
    "location",
    "reminder_days",
    "setup_type",
    "camera_setup",
  ];

  const keys = Object.keys(data).filter((k) => allowedFields.includes(k));
  if (keys.length === 0) throw new Error("No valid fields provided to update.");

  const setClause = keys.map((k) => `${k} = ?`).join(", ");
  const values = [...keys.map((k) => data[k]), id];

  const sql = `UPDATE event_reminder SET ${setClause} WHERE id = ?`;
  const [result] = await dbConnection.query(sql, values);

  return result.affectedRows > 0;
};

/**
 * Delete Eventreminder by ID
 */
export const deleteEventreminder = async (id) => {
  const [result] = await dbConnection.query(
    `DELETE FROM event_reminder WHERE id = ?`,
    [id]
  );
  return result.affectedRows > 0;
};
