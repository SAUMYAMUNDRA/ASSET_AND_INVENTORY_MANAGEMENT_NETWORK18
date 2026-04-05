// db.js
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

let dbConnection;

try {
    dbConnection = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || '',
        database: process.env.DB_NAME || 'network18',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    console.log('✅ Database connection pool created successfully');
} catch (error) {
    console.error('❌ Error creating database connection pool:', error);
    process.exit(1);
}


export default dbConnection;
