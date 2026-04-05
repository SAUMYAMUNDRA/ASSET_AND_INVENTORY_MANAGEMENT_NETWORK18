import dbConnection from "../db/dbConnection.js";
/**
 * Adds a new event to the database.
 * @param {string} event_name - The name of the event.
 * @param {Date} event_date - The date of the event.
 * @param {string} channel - The channel broadcasting the event.
 * @param {string} broadcast_type - The type of broadcast (e.g., Live, Recorded).
 * @param {string|null} location_hotel_name - The name of the hotel/location.
 * @param {string|null} state_city - The state and city of the event.
 * @param {'BNC'|'TRIAX'|null} setup_type - The setup type for the broadcast.
 * @param {string|null} camera - The camera used for the event.
 * @param {string|null} jimmy_jib - Information about jimmy jib usage.
 * @param {string|null} show_type - The type of show.
 * @returns {Promise<number>} The ID of the newly inserted event.
 */
export const addEvent = async (data, city_id) => {
  const sql = `
    INSERT INTO events (
      event_name,
      event_date,
      channel,
      broadcast_type,
      location_hotel_name,
      state_city,
      setup_type,
      camera,
      jimmy_jib,
      show_type,
      event_engineer,
      show_producer,
      show_dop,
      online_editor,
      electrical,
      sound_engineer,
      production_control,
      setup_date,    
      setup_start_time, 
      setup_end_time,    
      checking_done,
      created_by,
      city_id
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)
  `;

  const [result] = await dbConnection.query(sql, [
    data.event_name,
    data.event_date,
    data.channel,
    data.broadcast_type,
    data.location_hotel_name,
    data.state_city,
    data.setup_type,
    data.camera,
    data.jimmy_jib,
    data.show_type,
    data.event_engineer,
    data.show_producer,
    data.show_dop,
    data.online_editor,
    data.electrical,
    data.sound_engineer,
    data.production_control,
    data.setup_date,
    data.setup_start_time,
    data.setup_end_time,
    data.checking_done,
    data.created_by,
    city_id
  ]);

  return result.insertId;
};


/**
 * Retrieves an event by its ID.
 * @param {number} id - The ID of the event.
 * @returns {Promise<Object|null>} The event object if found, otherwise null.
 */
export const getEventById = async (id) => {
  // 1️⃣ Fetch main event
  const [eventRows] = await dbConnection.query(
    "SELECT * FROM events WHERE id = ?",
    [id]
  );
  const eventData = eventRows.length > 0 ? eventRows[0] : null;
  if (!eventData) return null;

  // 2️⃣ Fetch related equipment
  const [equipmentRows] = await dbConnection.query(
    "SELECT * FROM equipment_events WHERE event_id = ?",
    [id]
  );

  // 3️⃣ Fetch related live sources
  const [liveSourceRows] = await dbConnection.query(
    "SELECT * FROM live_source_event WHERE event_id = ?",
    [id]
  );

  // 4️⃣ Fetch related electrical power sources
  const [electricRows] = await dbConnection.query(
    "SELECT * FROM electrical_power_source_event WHERE event_id = ?",
    [id]
  );
  
  const [daysRows] = await dbConnection.query(
    "SELECT * FROM days_events WHERE event_id = ?",
    [id]
  );
  // 5️⃣ Combine all data
  return {
    ...eventData,
    equipment: equipmentRows,
    liveSource: liveSourceRows,
    power: electricRows,
	days: daysRows
  };
};

/**
 * Retrieves all events from the database.
 * @returns {Promise<Array<Object>>} An array of event objects.
 */
export const getAllEventsGlobalPaginated = async (offset, limit) => {
  const query = `
    SELECT 
      id,
      setup_date,
      channel,
      event_name,
      show_producer,
      location_hotel_name,
      show_type,
      setup_type,
      camera
    FROM events 
    ORDER BY setup_date DESC, id DESC
    LIMIT ? OFFSET ?
  `;
  
  const [rows] = await dbConnection.query(query, [limit, offset]);
  return rows;
};



export const getAllEvents = async (city_id) => {
  const sql = `
    SELECT * 
    FROM events 
    WHERE city_id = ? 
    ORDER BY event_date DESC, created_at DESC 
    LIMIT 200
  `;
  const [rows] = await dbConnection.query(sql, [city_id]);
  return rows;
};


export const getallEvents = async () => {
  const [rows] = await dbConnection.query(
    `SELECT * FROM events`
  );
  return rows; 
};

export const globalGetEventCount = async () => {
  const sql = `
    SELECT COUNT(*) AS totalEvents
    FROM events
  `;
  const [rows] = await dbConnection.query(sql);
  return rows[0].totalEvents;
};



export const globalGetLiveEventCount = async () => {
  const sql = `
    SELECT COUNT(*) AS liveEvents
    FROM events
    WHERE broadcast_type = 'live'
  `;
  const [rows] = await dbConnection.query(sql);
  return rows[0].liveEvents; // returns just the number
};

// db/eventreport.js
export const globalGetProducerCount = async () => {
  const sql = `
    SELECT COUNT(DISTINCT show_producer) AS totalProducers
    FROM events
    WHERE show_producer IS NOT NULL AND show_producer <> ''
  `;
  const [rows] = await dbConnection.query(sql);
  return rows[0].totalProducers;
};


export const globalGetCityCount = async () => {
  const sql = `
    SELECT COUNT(DISTINCT city_id) AS totalCities
    FROM events
    WHERE city_id IS NOT NULL AND city_id <> ''
  `;
  const [rows] = await dbConnection.query(sql);
  return rows[0].totalCities;
};
/**
 * Updates an existing event's details.
 * @param {number} id - The ID of the event to update.
 * @param {Object} updateData - An object containing the fields to update (e.g., {event_name: 'New Name', channel: 'New Channel'}).
 * @returns {Promise<boolean>} True if the event was updated, false otherwise.
 */
export const updateEvent = async (id, updateData) => {
  // Construct the SET clause dynamically based on updateData
  const setClauses = [];
  const values = [];
  for (const key in updateData) {
    if (Object.hasOwnProperty.call(updateData, key)) {
      setClauses.push(`${key} = ?`);
      values.push(updateData[key]);
    }
  }

  if (setClauses.length === 0) {
    console.warn("No update data provided for event:", id);
    return false; // No fields to update
  }

  const sql = `
    UPDATE events
    SET ${setClauses.join(', ')}
    WHERE id = ?
  `;
  values.push(id); // Add ID to the end for the WHERE clause

  const [result] = await dbConnection.query(sql, values);
  return result.affectedRows > 0;
};

/**
 * Deletes an event from the database.
 * @param {number} id - The ID of the event to delete.
 * @returns {Promise<boolean>} True if the event was deleted, false otherwise.
 */
export const deleteEvent = async (id) => {
  const sql = `DELETE FROM events WHERE id = ?`;
  const [result] = await dbConnection.query(sql, [id]);
  return result.affectedRows > 0;
};



