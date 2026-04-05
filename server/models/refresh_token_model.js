import dbConnection from "../db/dbConnection.js";

// Insert new refresh token (status defaults to 'active' in DB)
export const insertToken = async (user_id, device_id, ref_token, expires_at) => {
  const [result] = await dbConnection.query(
    `INSERT INTO refresh_tokens (user_id, device_id, ref_token, expires_at) 
     VALUES (?, ?, ?, ?)`,
    [user_id, device_id, ref_token, expires_at]
  );
  return result.insertId;
};

// Update refresh token (only if still active)
export const updateToken = async (user_id, device_id, ref_token) => {
  const [result] = await dbConnection.query(
    `UPDATE refresh_tokens
     SET ref_token = ?
     WHERE user_id = ? AND device_id = ? AND status = 'active'`,
    [ref_token, user_id, device_id]
  );
  return result.affectedRows;
};

// Get refresh token (only active ones)
export const getTokenByDeviceId = async (user_id, device_id) => {
  const [rows] = await dbConnection.query(
    `SELECT * FROM refresh_tokens 
     WHERE device_id = ? AND user_id = ? AND status = 'active'
     LIMIT 1`,
    [device_id, user_id]
  );
  return rows[0];
};

// Soft delete by device (mark as inactive)
export const deleteTokenByDeviceId = async (user_id, device_id) => {
  const [result] = await dbConnection.query(
    `UPDATE refresh_tokens 
     SET status = 'inactive'
     WHERE device_id = ? AND user_id = ? AND status = 'active'`,
    [device_id, user_id]
  );
  return result.affectedRows > 0;
};

// Soft delete all tokens for a user (mark as inactive)
export const deleteTokensByUserId = async (user_id) => {
  const [result] = await dbConnection.query(
    `UPDATE refresh_tokens 
     SET status = 'inactive'
     WHERE user_id = ? AND status = 'active'`,
    [user_id]
  );
  return result.affectedRows;
};
