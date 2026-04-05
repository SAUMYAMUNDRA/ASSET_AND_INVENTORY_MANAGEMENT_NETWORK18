import dbConnection from "../db/dbConnection.js";

/**
 * Create a new studio display record.
 * Accepts an object with relevant fields (only those provided will be inserted).
 * Returns the inserted id.
 */

export const createStudioDisplay = async (studioDisplay) => {
  const allowedFields = [
    "floor","studio","barco_model","cube_a","cube_b","cube_c","cube_d",
    "led_size_85_75_inch","led_size_65_55_inch","controller","lvc_sr_no","novastar_sr_no",
    "lvc_nds_status","wme_net_status","convertor","led_tv_85_75_input","led_tv_65_55_input",
    "hdmi_input","lvc_input","pixel_input","time","status","remarks","city_id"
  ];

  const keys = Object.keys(studioDisplay).filter(k => allowedFields.includes(k));
  if (keys.length === 0) throw new Error("No valid fields provided for insert.");

  const placeholders = keys.map(_ => "?").join(", ");
  const sql = `INSERT INTO studio_displays (${keys.join(", ")}) VALUES (${placeholders})`;
  const values = keys.map(k => studioDisplay[k]);

  const [result] = await dbConnection.query(sql, values);
  return result.insertId;
};


export const getStudioDisplayById = async (id) => {
  const [rows] = await dbConnection.query(
    `SELECT * FROM studio_displays WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
};


export const getAllStudioDisplays = async (cityId) => {
  const [rows] = await dbConnection.query(
    `SELECT * FROM studio_displays WHERE city_id=?`,[cityId]
  );
  return rows;
};


export const getStudioDisplaysByStudio = async (studio) => {
  const [rows] = await dbConnection.query(
    `SELECT * FROM studio_displays WHERE studio = ?`,
    [studio]
  );
  return rows;
};


export const deleteStudioDisplay = async (id) => {
  const [result] = await dbConnection.query(
    `DELETE FROM studio_displays WHERE id = ?`,
    [id]
  );
  return result.affectedRows > 0;
};
export const updateStudioDisplayById = async (id, data, updated_by_name) => {
    const allowedFields = [
        "floor", "studio", "barco_model", "cube_a", "cube_b", "cube_c", "cube_d",
        "led_size_85_75_inch", "led_size_65_55_inch", "controller", "lvc_sr_no", "novastar_sr_no",
        "lvc_nds_status", "wme_net_status", "convertor", "led_tv_85_75_input", "led_tv_65_55_input",
        "hdmi_input", "lvc_input", "pixel_input", "time", "status", "remarks","city_id"
    ];

    const keys = Object.keys(data).filter(k => allowedFields.includes(k));
    if (keys.length === 0) throw new Error("No valid fields provided to update.");

    const setClause = keys.map(k => `${k} = ?`).join(", ");
    const values = [...keys.map(k => data[k]), id];

    // Update the main table
    const updateSql = `UPDATE studio_displays SET ${setClause} WHERE id = ?`;
    const [updateResult] = await dbConnection.query(updateSql, values);

    if (updateResult.affectedRows > 0) {
        // Prepare columns and placeholders for the insert query
        const insertColumns = ["studio_id", ...keys, "updated_by"];
        const insertPlaceholders = insertColumns.map(() => "?").join(", ");

        const insertSql = `
            INSERT INTO edited_studio_displays (${insertColumns.join(", ")})
            VALUES (${insertPlaceholders})
        `;

        // Prepare values array for the insert query
        const insertValues = [id, ...keys.map(k => data[k]), updated_by_name];

        await dbConnection.query(insertSql, insertValues);
    }

    return updateResult.affectedRows > 0;
};

export const getStudioDisplayAdditionalNotes = async () => {
  const [rows] = await dbConnection.query(
    `SELECT studio_display_additional_notes FROM website_info LIMIT 1`
  );
  console.log(rows)
  return rows[0] || null;
};

/**
 * Update or insert the studio display additional notes.
 * Returns true if update was successful.
 */
export const updateStudioDisplayAdditionalNotes = async (notes) => {
  // Assuming website_info always has exactly 1 row
  const [result] = await dbConnection.query(
    `UPDATE website_info SET studio_display_additional_notes = ? LIMIT 1`,
    [notes]
  );
  return result.affectedRows > 0;
};

export const updateStudioDisplayStatus = async (id, status) => {
  const [result] = await dbConnection.query(
    `UPDATE studio_displays SET status = ? WHERE id = ?`,
    [status, id]
  );
  return result.affectedRows > 0;
};

export const updateStudioDisplayRemarks = async (id, remarks) => {
  const [result] = await dbConnection.query(
    `UPDATE studio_displays SET remarks = ? WHERE id = ?`,
    [remarks, id]
  );
  return result.affectedRows > 0;
};

export const updateStudioDisplayTime = async (id, time) => {
  // time should be a string acceptable by MySQL TIME (e.g. '09:00:00' or '09:00')
  const [result] = await dbConnection.query(
    `UPDATE studio_displays SET time = ? WHERE id = ?`,
    [time, id]
  );
  return result.affectedRows > 0;
};
