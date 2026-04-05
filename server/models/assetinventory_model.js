import dbConnection from "../db/dbConnection.js";

/**
 * Create a new Asset Inventory record
 */
export const createAsset = async (asset) => {
  const allowedFields = [
    "material",
    "status",
    "location",
    "make",
    "model",
    "serial_no",
    "asset_tag", 
  ];

  const keys = Object.keys(asset).filter(k => allowedFields.includes(k));
  if (keys.length === 0) throw new Error("No valid fields provided for insert.");

  const placeholders = keys.map(() => "?").join(", ");
  const sql = `INSERT INTO asset_inventory (${keys.join(", ")}) VALUES (${placeholders})`;
  const values = keys.map(k => asset[k]);

  const [result] = await dbConnection.query(sql, values);
  return result.insertId;
};

/**
 * Get Asset by id
 */
export const getAssetById = async (id) => {
  const [rows] = await dbConnection.query(
    `SELECT * FROM asset_inventory WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
};

export const getAssetByGatePassId = async (gatepassId) => {
  // Step 1: Get equip_id list from gate_pass_equipments
  const [equipments] = await dbConnection.query(
    `SELECT equip_id FROM gate_pass_equipments WHERE gatepass_id = ? AND status != 'early_returned'`,
    [gatepassId]
  );

  if (equipments.length === 0) return [];

  // Step 2: Extract equip_id array
  const equipIds = equipments.map((e) => e.equip_id);

  // Step 3: Fetch all assets matching equipIds
  const [assets] = await dbConnection.query(
    `SELECT * FROM asset_inventory WHERE id IN (?)`,
    [equipIds]
  );
  console.log("ASSET", assets);

  return assets;
};

/**
 * Get all Assets
 */
export const getAllAssets = async () => {
  const [rows] = await dbConnection.query(
    `SELECT * FROM asset_inventory ORDER BY material ASC`
  );
  return rows;
};

/**
 * Get assets by status (Available / Unavailable)
 */
export const getAssetsByStatus = async (status) => {
  const [rows] = await dbConnection.query(
    `SELECT * FROM asset_inventory WHERE status = ?`,
    [status]
  );
  return rows;
};

/**
 * Get Asset by serial_no
 */
export const getAssetBySerial = async (serial_no) => {
  const [rows] = await dbConnection.query(
    `SELECT * FROM asset_inventory WHERE serial_no = ?`,
    [serial_no]
  );
  return rows[0] || null;
};

/**
 * Delete Asset by id
 */
export const deleteAsset = async (id) => {
  const [result] = await dbConnection.query(
    `DELETE FROM asset_inventory WHERE id = ?`,
    [id]
  );
  return result.affectedRows > 0;
};

/**
 * Update Asset record
 */
export const updateAssetById = async (id, user, data) => {
  const allowedFields = [
    "material", "status", "location", "make", "model", "serial_no"
  ];

  const keys = Object.keys(data).filter(k => allowedFields.includes(k));
  if (keys.length === 0) throw new Error("No valid fields provided to update.");

  const setClause = keys.map(k => `${k} = ?`).join(", ");
  const values = [...keys.map(k => data[k]), id];

  // 1️⃣ Update main table
  const sql = `UPDATE asset_inventory SET ${setClause} WHERE id = ?`;
  const [result] = await dbConnection.query(sql, values);

  if (result.affectedRows > 0) {
    // 2️⃣ Fetch the updated record to insert into edited_asset_inventory
    const [rows] = await dbConnection.query(
      `SELECT id, material, status, location, make, model, serial_no 
       FROM asset_inventory WHERE id = ?`,
      [id]
    );

    if (rows.length > 0) {
      const asset = rows[0];

      // 3️⃣ Insert into edited_asset_inventory
      const insertSql = `
        INSERT INTO edited_asset_inventory 
          (material, status, location, make, model, serial_no, edited_by, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
      `;

      await dbConnection.query(insertSql, [
        asset.material,
        asset.status,
        asset.location,
        asset.make,
        asset.model,
        asset.serial_no,
        user
      ]);
    }
  }

  return result.affectedRows > 0;
};

/**
 * Update Asset Status
 */
export const updateAssetStatus = async (id, status) => {
  const [result] = await dbConnection.query(
    `UPDATE asset_inventory SET status = ? WHERE id = ?`,
    [status, id]
  );
  return result.affectedRows > 0;
};
