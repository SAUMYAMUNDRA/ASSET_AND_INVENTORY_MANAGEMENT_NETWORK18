import dbConnection from "../db/dbConnection.js";


/**
 * Get All Rbac
 */
export const getAllRbac = async () => {
    const [rows] = await dbConnection.query(
        `SELECT * FROM rbac`
    );
    return rows;
};
export const getAllRbacIds = async () => {
  const [rows] = await dbConnection.query(
    `SELECT id FROM rbac`
  );
  // returns an array of ids instead of array of objects
  return rows.map(row => row.id);
};