import dbConnection from "../db/dbConnection.js";


export const addElectricSources = async (event_id,electricData,city_id) => {
  if (!event_id || !Array.isArray(electricData) || electricData.length === 0) {
    throw new Error("Invalid electric data input");
  }

  const values = electricData.map((item) => [
    event_id,
    item.source,
    item.available,
    item.kva || null,
    item.value || null,
    item.note || null,
    item.status || null,
    city_id
  ]);

  const sql = `
    INSERT INTO electrical_power_source_event
    (event_id,source, available, kva, value, note, status,city_id)
    VALUES ?
  `;

  const [result] = await dbConnection.query(sql, [values]);
  return result.affectedRows;
};


export const getElectricSourcesByEvent = async (event_id) => {
  const sql = `SELECT * FROM live_source_event WHERE event_id = ?`;
  const [rows] = await dbConnection.query(sql, [event_id]);
  return rows;
};


export const updateElectricSource = async (sno, updateData) => {
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


export const deleteElectricSource = async (sno) => {
  const sql = `DELETE FROM live_source_event WHERE sno = ?`;
  const [result] = await dbConnection.query(sql, [sno]);
  return result.affectedRows > 0;
};
