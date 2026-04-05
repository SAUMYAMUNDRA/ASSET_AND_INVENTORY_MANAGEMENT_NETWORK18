import dbConnection from "../db/dbConnection.js";


export const createGatePass = async (gatepass) => {
  const allowedFields = [
    "issued_to",
    "issued_by",
    "employee_id",
    "event_name",
    "event_date",
    "expected_return_date",
  ];

  const keys = Object.keys(gatepass).filter((k) => allowedFields.includes(k));
  if (keys.length === 0)
    throw new Error("No valid fields provided for insert.");

  const placeholders = keys.map(() => "?").join(", ");
  const sql = `INSERT INTO gate_pass (${keys.join(", ")}) VALUES (${placeholders})`;
  const values = keys.map((k) => gatepass[k]);

  const [result] = await dbConnection.query(sql, values);
  return result.insertId;
};

/**
 * Get Gate Pass by ID
 */
export const getGatePassCountByStatus = async () => {
  const [rows] = await dbConnection.query(`
    SELECT 
      COUNT(*) as totalIssued,
      SUM(CASE WHEN status = 'returned' THEN 1 ELSE 0 END) as returned,
      SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
      SUM(CASE WHEN status = 'overdue' THEN 1 ELSE 0 END) as overdue
    FROM gate_pass
  `);
  return rows[0];
};


export const getGatePassById = async (id) => {
  const [rows] = await dbConnection.query(
    `SELECT * FROM gate_pass WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
};

/**
 * Get all Gate Passes
 */
export const getAllGatePasses = async () => {
  const [rows] = await dbConnection.query(`SELECT *
FROM gate_pass
ORDER BY 
  CASE status
    WHEN 'pending' THEN 1
    WHEN 'active' THEN 2
    WHEN 'returned' THEN 3
    ELSE 4
  END
LIMIT 200;
`);
  return rows;
};

/**
 * Update Gate Pass Status
 */
export const updateGatePassStatus = async (id, status) => {
  console.log(status);
  const [result] = await dbConnection.query(
    `UPDATE gate_pass
     SET 
       status = ?,
       return_date = CASE 
         WHEN ? = 'pending' THEN NOW() + INTERVAL 5 HOUR + INTERVAL 30 MINUTE
         WHEN ? = 'active' THEN NULL
         ELSE return_date -- if 'returned', do nothing
       END
     WHERE id = ?`,
    [status, status, status, id]
  );
  return result.affectedRows > 0;
};


export const getGatePassByEmployeeId = async (employeeId) => {
  const [rows] = await dbConnection.query(
    `SELECT * FROM gate_pass WHERE Issued_by = ?`,
    [employeeId]
  );
  return rows;
};



export const deleteGatePass = async (id) => {
  const [result] = await dbConnection.query(
    `DELETE FROM gate_pass WHERE id = ?`,
    [id]
  );
  return result.affectedRows > 0;
};
