import dbConnection from "../db/dbConnection.js";

/**
 * Allowed fields for days_events insert/update
 */
const allowedFields = [
  "event_id",
  "date",
  "checking_done",
  "feed_test_location",
  "feed_test_date",
  "feed_test_time",
  "event_start_time",
  "event_end_time",
  "event_duration",
  "comments",
  "signature",
  "signatureDate"
];

// Mapping from frontend camelCase → DB snake_case
const camelToSnakeMap = {
  checkingDone: "checking_done",
  feedTestLocation: "feed_test_location",
  feedTestDate: "feed_test_date",
  feedTestTime: "feed_test_time",
  eventStartTime: "event_start_time",
  eventEndTime: "event_end_time",
  eventDuration: "event_duration",
  signatureDate: "signatureDate" // keep as is if DB column is camelCase
};

/**
 * Create a new Event Day record
 */
export const createEventDay = async (day,city_id) => {
  // Keep only keys that map to allowed DB fields
  const keys = Object.keys(day).filter(
    (k) => allowedFields.includes(camelToSnakeMap[k] || k)
  );

  if (keys.length === 0) throw new Error("No valid fields provided for insert.");

  // Map camelCase → DB column names
  const dbColumns = keys.map((k) => camelToSnakeMap[k] || k);

  const placeholders = keys.map(() => "?").join(", ");
  const sql = `INSERT INTO days_events (${dbColumns.join(", ")}) VALUES (${placeholders})`;

  const values = keys.map((k) => day[k] === "" ? null : day[k]); // normalize "" → null

  const [result] = await dbConnection.query(sql, values);
  return result.insertId;
};


/**
 * Get Event Day by id
 */
export const getEventDayById = async (id) => {
  const [rows] = await dbConnection.query(
    `SELECT * FROM days_events WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
};

/**
 * Get all Event Days
 */
export const getAllEventDays = async () => {
  const [rows] = await dbConnection.query(
    `SELECT * FROM days_events`
  );
  return rows;
};

/**
 * Get all Event Days by Event ID
 */
export const getEventDaysByEventId = async (event_id) => {
  const [rows] = await dbConnection.query(
    `SELECT * FROM days_events WHERE event_id = ?`,
    [event_id]
  );
  return rows;
};

/**
 * Delete Event Day by id
 */
export const deleteEventDay = async (id) => {
  const [result] = await dbConnection.query(
    `DELETE FROM days_events WHERE id = ?`,
    [id]
  );
  return result.affectedRows > 0;
};

/**
 * Update Event Day record
 */
export const updateEventDayById = async (id, data) => {
  const keys = Object.keys(data).filter(k => allowedFields.includes(k));
  if (keys.length === 0) throw new Error("No valid fields provided to update.");

  const setClause = keys.map(k => `${k} = ?`).join(", ");
  const values = [...keys.map(k => data[k]), id];

  const sql = `UPDATE days_events SET ${setClause} WHERE id = ?`;
  const [result] = await dbConnection.query(sql, values);

  return result.affectedRows > 0;
};
