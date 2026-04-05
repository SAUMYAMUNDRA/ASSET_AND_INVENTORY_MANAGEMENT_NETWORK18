import dbConnection from "../db/dbConnection.js";

/**
 * Create City
 */
export const createCity = async (
  city_name,
  studio_display = false,
  asset_inventory = false,
  event_report = false
) => {
  if (!city_name) {
    throw new Error("City name is required.");
  }

  const sql = `
    INSERT INTO city (city_name, studio_display, asset_inventory, event_report)
    VALUES (?, ?, ?, ?)
  `;
  const [result] = await dbConnection.query(sql, [
    city_name,
    studio_display ? 1 : 0,
    asset_inventory ? 1 : 0,
    event_report ? 1 : 0,
  ]);

  return result.insertId;
};

/**
 * Get City by id
 */
export const updateCityPermissionsByName = async (city_name, permissions) => {
  if (!city_name) {
    throw new Error("City name is required to update permissions.");
  }

  const { studio_display = false, asset_inventory = false, event_report = false } = permissions;

  const sql = `
    UPDATE city
    SET studio_display = ?, 
        asset_inventory = ?, 
        event_report = ?
    WHERE city_name = ?
  `;

  const [result] = await dbConnection.query(sql, [
    studio_display ? 1 : 0,
    asset_inventory ? 1 : 0,
    event_report ? 1 : 0,
    city_name,
  ]);

  return result.affectedRows > 0;
};



export const getCityById = async (id) => {
  const [rows] = await dbConnection.query(`SELECT * FROM city WHERE id = ?`, [
    id,
  ]);
  return rows[0] || null;
};

/**
 * Get all Cities
 */
export const getAllCities = async () => {
  const [rows] = await dbConnection.query(`SELECT * FROM city ORDER BY id DESC`);
  return rows;
};

/**
 * Get City by name
 */
export const getCityByName = async (city_name) => {
  const [rows] = await dbConnection.query(
    `SELECT * FROM city WHERE city_name = ?`,
    [city_name]
  );
  return rows;
};

/**
 * Update City by id
 */
export const updateCityById = async (id, data) => {
  if (!data.city_name) {
    throw new Error("City name is required to update.");
  }

  const sql = `
    UPDATE city 
    SET city_name = ?, 
        studio_display = ?, 
        asset_inventory = ?, 
        event_report = ?
    WHERE id = ?
  `;

  const [result] = await dbConnection.query(sql, [
    data.city_name,
    data.studio_display ? 1 : 0,
    data.asset_inventory ? 1 : 0,
    data.event_report ? 1 : 0,
    id,
  ]);

  return result.affectedRows > 0;
};




export const updateCityByName = async (originalName, data) => {
  if (!originalName) {
    throw new Error("Original city name is required to update.");
  }
  if (!data.city_name) {
    throw new Error("New city name is required to update.");
  }

  const sql = `
    UPDATE city 
    SET city_name = ?, 
        studio_display = ?, 
        asset_inventory = ?, 
        event_report = ?
    WHERE city_name = ?
  `;

  const [result] = await dbConnection.query(sql, [
    data.city_name,
    data.studio_display ? 1 : 0,
    data.asset_inventory ? 1 : 0,
    data.event_report ? 1 : 0,
    originalName,
  ]);

  return result.affectedRows > 0;
};
/**
 * Delete City by id
 */
export const deleteCity = async (id) => {
  const [result] = await dbConnection.query(`DELETE FROM city WHERE id = ?`, [
    id,
  ]);
  return result.affectedRows > 0;
};
