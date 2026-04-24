const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '0993643838Jc',
    database: 'diseno_prueba',
    charset: 'utf8mb4'
});

db.query('SELECT * FROM tickets_soporte ORDER BY id_ticket DESC LIMIT 5', (err, results) => {
    if (err) console.error(err);
    else console.log(results);
    process.exit();
});
