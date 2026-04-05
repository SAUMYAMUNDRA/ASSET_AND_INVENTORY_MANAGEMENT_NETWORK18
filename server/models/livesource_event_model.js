import dbConnection from "../db/dbConnection.js";

/**
 * Adds multiple live sources for an event.
 * @param {number} event_id - The ID of the event.
 * @param {Array<Object>} liveSourceData - Array of live source objects.
 * @returns {Promise<number>} Number of inserted rows.
 */
export const addLiveSources = async (event_id, liveSourceData,city_id) => {
  if (!event_id || !Array.isArray(liveSourceData) || liveSourceData.length === 0) {
    throw new Error("Invalid live source data input");
  }

  const values = liveSourceData.map((item) => [
    event_id,
    item.name,
    item.available,
    item.type || null,
    item.bandwidth || null,
    item.note || null,
    item.status || null,
    city_id
  ]);

  const sql = `
    INSERT INTO live_source_event
    (event_id, name, available, type, bandwidth, note, status,city_id)
    VALUES ?
  `;

  const [result] = await dbConnection.query(sql, [values]);
  return result.affectedRows;
};

/**
 * Get all live sources for a given event.
 * @param {number} event_id - The ID of the event.
 * @returns {Promise<Array<Object>>} List of live sources.
 */
export const getLiveSourcesByEvent = async (event_id) => {
  const sql = `SELECT * FROM live_source_event WHERE event_id = ?`;
  const [rows] = await dbConnection.query(sql, [event_id]);
  return rows;
};

/**
 * Update a live source row by ID.
 * @param {number} sno - The row's primary key.
 * @param {Object} updateData - Fields to update.
 * @returns {Promise<boolean>} True if updated, false otherwise.
 */
export const updateLiveSource = async (sno, updateData) => {
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
    UPDATE live_source_event
    SET ${setClauses.join(", ")}
    WHERE sno = ?
  `;
  values.push(sno);

  const [result] = await dbConnection.query(sql, values);
  return result.affectedRows > 0;
};

/**
 * Delete a live source row by ID.
 * @param {number} sno - The row's primary key.
 * @returns {Promise<boolean>} True if deleted, false otherwise.
 */
export const deleteLiveSource = async (sno) => {
  const sql = `DELETE FROM live_source_event WHERE sno = ?`;
  const [result] = await dbConnection.query(sql, [sno]);
  return result.affectedRows > 0;
};
