const mysql = require('mysql2/promise');
require('dotenv').config();

const AREAS_CORRECTAS = [
    { id: 1, nombre: "COORDINACIÓN DE LA GESTIÓN INSTITUCIONAL SEDE GUAYAQUIL" },
    { id: 2, nombre: "COORDINACIÓN DE LA GESTIÓN INSTITUCIONAL SEDE LOJA" },
    { id: 3, nombre: "COORDINACIÓN DE LA GESTIÓN INSTITUCIONAL SEDE QUITO" },
    { id: 4, nombre: "COORDINACIÓN DE LA GESTIÓN INSTITUCIONAL SEDE RIOBAMBA" },
    { id: 5, nombre: "DIRECCIÓN ADMINISTRATIVA FINANCIERA" },
    { id: 6, nombre: "DIRECCIÓN DE ADMINISTRACIÓN DE RECURSOS HUMANOS" },
    { id: 7, nombre: "DIRECCIÓN DE ASESORÍA JURÍDICA" },
    { id: 8, nombre: "DIRECCIÓN DE COMUNICACIÓN SOCIAL" },
    { id: 9, nombre: "DIRECCIÓN DE ESTUDIOS, INVESTIGACIÓN Y DESARROLLO HIDROMETEOROLÓGICO" },
    { id: 10, nombre: "DIRECCIÓN DE INFORMACIÓN HIDROMETEOROLÓGICA" },
    { id: 11, nombre: "DIRECCIÓN DE LA RED DE OBSERVACIÓN HIDROMETEOROLÓGICA" },
    { id: 12, nombre: "DIRECCIÓN DE LABORATORIOS DE CALIDAD DE AGUAS Y SEDIMENTOS" },
    { id: 13, nombre: "DIRECCIÓN DE PLANIFICACIÓN" },
    { id: 14, nombre: "DIRECCIÓN DE PRONÓSTICOS Y ALERTAS HIDROMETEOROLÓGICAS" },
    { id: 15, nombre: "DIRECCIÓN EJECUTIVA" },
    { id: 16, nombre: "DIRECCIÓN REGIONAL TÉCNICA HIDROMETEOROLÓGICA - MANABI" },
    { id: 17, nombre: "DIRECCIÓN REGIONAL TÉCNICA HIDROMETEOROLÓGICA - NAPO" },
    { id: 18, nombre: "DIRECCIÓN REGIONAL TÉCNICA HIDROMETEOROLÓGICA - PASTAZA" },
    { id: 19, nombre: "DIRECCIÓN REGIONAL TÉCNICA HIDROMETEOROLÓGICA ESMERALDAS - MIRA" },
    { id: 20, nombre: "DIRECCIÓN REGIONAL TÉCNICA HIDROMETEOROLÓGICA GUAYAS - GALAPAGOS" },
    { id: 21, nombre: "DIRECCIÓN REGIONAL TÉCNICA HIDROMETEOROLÓGICA MORONA SANTIAGO" }
];

async function fixDB() {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'diseno_prueba',
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
