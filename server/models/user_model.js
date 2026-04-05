import dbConnection from "../db/dbConnection.js";

/**
 * Create User
 */
export const createUser = async (name, email, password, role, city_id = null, permissions = []) => {
	
    const permissionsJSON = JSON.stringify(permissions);
    const [result] = await dbConnection.query(
        `INSERT INTO users (fullname, email, password, role, city_id, permissions) VALUES (?, ?, ?, ?, ?, ?)`,
        [name, email, password, role, city_id, permissionsJSON]
    );
    return result.insertId; 
};
/**
 * Get User by ID
 */
export const getUserById = async (id) => {
    const [rows] = await dbConnection.query(
        `SELECT * FROM users WHERE user_id = ?`,
        [id]
    );
    return rows[0] || null;
};

/**
 * Get All Users
 */
export const getAllUsers = async () => {
    const [rows] = await dbConnection.query(
        `SELECT * FROM users`
    );
    return rows;
};

/**
 * Get User by Email
 */
export const getUserByEmail = async (email) => {
    const [rows] = await dbConnection.query(
        `SELECT 
            u.user_id, 
            u.fullname, 
            u.email, 
            u.role, 
            u.password, 
            u.city_id, 
            u.permissions,
            c.city_name,
            c.studio_display,
            c.asset_inventory,
            c.event_report,
            GROUP_CONCAT(r.access_name) AS access_name
        FROM users u
        LEFT JOIN city c ON u.city_id = c.id
        LEFT JOIN rbac r ON FIND_IN_SET(r.id, REPLACE(REPLACE(u.permissions, '[', ''), ']', '')) > 0
        WHERE u.email = ?
        GROUP BY u.user_id`,
        [email]
    );

    if (!rows[0]) return null;

    // Convert comma-separated string into array
    rows[0].access_name = rows[0].access_name
        ? rows[0].access_name.split(',')
        : [];

    return rows[0];
};


/**
 * Delete User
 */
export const deleteUser = async (id) => {
    const [result] = await dbConnection.query(
        `DELETE FROM users WHERE user_id = ?`,
        [id]
    );
    return result.affectedRows > 0;
};

/**
 * Update Role
 */
export const updateUserRole = async (id, role) => {
    const [result] = await dbConnection.query(
        `UPDATE users SET role = ? WHERE user_id = ?`,
        [role, id]
    );
    return result.affectedRows > 0;
};

/**
 * Update Fullname
 */
export const updateUserFullname = async (id, fullname) => {
    const [result] = await dbConnection.query(
        `UPDATE users SET fullname = ? WHERE user_id = ?`,
        [fullname, id]
    );
    return result.affectedRows > 0;
};

/**
 * Update Email
 */
export const updateUserEmail = async (id, email) => {
    const [result] = await dbConnection.query(
        `UPDATE users SET email = ? WHERE user_id = ?`,
        [email, id]
    );
    return result.affectedRows > 0;
};

/**
 * Update Password
 */
export const updateUserPassword = async (id, password) => {
    const [result] = await dbConnection.query(
        `UPDATE users SET password = ? WHERE user_id = ?`,
        [password, id]
    );
    return result.affectedRows > 0;
};

/**
 * Update City
 */
export const updateUserCity = async (id, city_id) => {
    const [result] = await dbConnection.query(
        `UPDATE users SET city_id = ? WHERE user_id = ?`,
        [city_id, id]
    );
    return result.affectedRows > 0;
};

export const addUserPermissions = async (userId, permissions) => {
    const permissionsJSON = JSON.stringify(permissions); // store array as JSON
    const [result] = await dbConnection.query(
        `UPDATE users SET permissions = ? WHERE user_id = ?`,
        [permissionsJSON, userId]
    );
    return result.affectedRows > 0;
};
