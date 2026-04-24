const mysql = require('mysql2/promise');

const AREAS_CORRECTAS = [
    { id: 1, nombre: "TECNOLOGÍAS DE LA INFORMACIÓN Y COMUNICACIÓN" },
    { id: 2, nombre: "DIRECCIÓN DE INFORMACIÓN HIDROMETEOROLÓGICA" },
    { id: 3, nombre: "DIRECCIÓN DE ADMINISTRACIÓN DE RECURSOS HUMANOS" },
    { id: 4, nombre: "DIRECCIÓN ADMINISTRATIVA FINANCIERA" },
    { id: 5, nombre: "DIRECCIÓN EJECUTIVA" },
    { id: 6, nombre: "DIRECCIÓN DE ASESORÍA JURÍDICA" },
    { id: 7, nombre: "DIRECCIÓN DE COMUNICACIÓN SOCIAL" },
    { id: 8, nombre: "DIRECCIÓN DE PLANIFICACIÓN" },
    { id: 9, nombre: "DIRECCIÓN DE PRONÓSTICOS Y ALERTAS" },
    { id: 10, nombre: "DIRECCIÓN DE ESTUDIOS, INVESTIGACIÓN Y DESARROLLO HIDROMETEOROLÓGICO" },
    { id: 11, nombre: "DIRECCIÓN DE LA RED NACIONAL DE OBSERVACIÓN HIDROMETEOROLÓGICA" },
    { id: 12, nombre: "LABORATORIO NACIONAL DE CALIDAD DE AGUA Y SEDIMENTOS" }
];

async function fixDB() {
    const db = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '0993643838Jc',
        database: 'diseno_prueba',
        charset: 'utf8mb4'
    });

    try {
        console.log("Desactivando Foreign Key Checks...");
        await db.query("SET FOREIGN_KEY_CHECKS = 0;");

        console.log("Limpiando tabla catalogo_areas...");
        await db.query("TRUNCATE TABLE catalogo_areas;");

        console.log("Insertando áreas correctas...");
        for (const area of AREAS_CORRECTAS) {
            await db.query("INSERT INTO catalogo_areas (id_area, nombre_area) VALUES (?, ?);", [area.id, area.nombre]);
        }

        console.log("Activando Foreign Key Checks...");
        await db.query("SET FOREIGN_KEY_CHECKS = 1;");

        console.log("¡Base de datos arreglada exitosamente!");
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await db.end();
    }
}

fixDB();
