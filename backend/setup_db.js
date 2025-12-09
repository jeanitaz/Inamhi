const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
    try {
        // Conectar sin base de datos primero para poder crearla si no existe
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            multipleStatements: true // Importante para ejecutar el script completo
        });

        console.log('🔌 Conectado a MySQL...');

        const sqlPath = path.join(__dirname, 'database.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('⚙️  Ejecutando script de base de datos...');
        await connection.query(sql);

        console.log('✅ Base de datos y tablas creadas exitosamente!');
        console.log('✅ Datos de prueba insertados.');

        await connection.end();
    } catch (error) {
        console.error('❌ Error configurando la base de datos:', error);
    }
}

setupDatabase();
