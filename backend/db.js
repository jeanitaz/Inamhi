const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '0993643838Jc',
    database: process.env.DB_NAME || 'diseno_prueba',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Promisify for async/await usage
const promisePool = pool.promise();

// Test connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Error conectando a la base de datos:', err.code, err.message);
    } else {
        console.log('✅ Conectado a la base de datos MySQL');
        connection.release();
    }
});

module.exports = promisePool;
