import dbConnection from "../db/dbConnection.js";

/**
 * Create a new Event Channel record
 */
export const createEventChannel = async (channel_name,city_id,channel_type) => {
  if (!channel_name) {
    throw new Error("Channel name is required.");
  }

  const sql = `INSERT INTO channels_events (channel_name,city_id,channel_type) VALUES (?,?,?)`;
  const [result] = await dbConnection.query(sql, [channel_name,city_id,channel_type]);

  return result.insertId;
};



export const getAllChannels = async () => {
  const [rows] = await dbConnection.query(
    `SELECT * FROM channels_events`
  );
  return rows; 
};
export const getAllEvents = async () => {
  const [rows] = await dbConnection.query(
    `SELECT * FROM events`
  );
  return rows; 
};
/**
 * Get Event Channel by id
 */
export const getEventChannelById = async (id) => {
  const [rows] = await dbConnection.query(
    `SELECT * FROM channels_events WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
};

/**
 * Get all Event Channels
 */
export const getAllEventChannels = async (city_id) => {
  if (!city_id) {
    throw new Error("City ID is required.");
  }

  const sql = `SELECT * FROM channels_events WHERE city_id = ? ORDER BY id DESC`;
  const [rows] = await dbConnection.query(sql, [city_id]);

  return rows;
};



export const getAllGlobalEventChannels = async () => {
  const sql = `SELECT COUNT(*) AS total FROM channels_events`;
  const [rows] = await dbConnection.query(sql);

  // rows[0].total will have the count
  return rows[0].total;
};

/**
 * Get Event Channel by name
 */
export const getEventChannelByName = async (channel_name) => {
  const [rows] = await dbConnection.query(
    `SELECT * FROM channels_events WHERE channel_name = ?`,
    [channel_name]
  );
  return rows; // return rows directly
};

/**
 * Update Event Channel by id
 */
export const updateEventChannelById = async (id, data) => {
  if (!data.channel_name) {
    throw new Error("Channel name is required to update.");
  }

  const sql = `UPDATE channels_events SET channel_name = ? WHERE id = ?`;
  const [result] = await dbConnection.query(sql, [data.channel_name, id]);

  return result.affectedRows > 0;
};

/**
 * Delete Event Channel by id
 */
export const deleteEventChannel = async (id) => {
  const [result] = await dbConnection.query(
    `DELETE FROM channels_events WHERE id = ?`,
    [id]
  );
  return result.affectedRows > 0;
};
