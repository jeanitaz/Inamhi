const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '0993643838Jc',
    database: 'diseno_prueba'
});

connection.connect(err => {
    if (err) {
        console.error('Error connecting:', err);
        return;
    }
    console.log('Connected to DB');

    connection.query('SELECT * FROM tickets_soporte', (err, results) => {
        if (err) {
            console.error('Error querying:', err);
        } else {
            console.log('Tickets found:', results.length);
            console.log(results);
        }
        connection.end();
    });
});
