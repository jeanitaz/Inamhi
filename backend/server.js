require('dotenv').config(); // NUEVO: Carga variables de entorno

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
// NUEVO: Importamos multer, path y fs
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors()); // Permite que React se conecte
app.use(bodyParser.json());

// NUEVO: Hacemos que la carpeta 'uploads' sea pública para que React pueda ver las imágenes/PDFs
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// NUEVO: Crear la carpeta uploads automáticamente si no existe
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// 1. CONFIGURACIÓN DE LA BASE DE DATOS
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '0993643838Jc',
    database: process.env.DB_NAME || 'diseno_prueba',
    charset: 'utf8mb4' // Asegura que las tildes se guarden y lean bien
});

db.connect(err => {
    if (err) {
        console.error('Error conectando a la BD:', err);
        return;
    }
    console.log('Conectado a MySQL exitosamente.');

    // NUEVO: Crear la tabla de valoraciones de técnicos automáticamente si no existe
    const createTableSql = `
        CREATE TABLE IF NOT EXISTS valoraciones_tecnicos (
            id_valoracion INT AUTO_INCREMENT PRIMARY KEY,
            id_ticket INT UNIQUE NOT NULL,
            tecnico_nombre VARCHAR(100) NOT NULL,
            puntuacion INT NOT NULL,
            comentario TEXT,
            fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (id_ticket) REFERENCES tickets_soporte(id_ticket) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;
    db.query(createTableSql, (err) => {
        if (err) {
            console.error('Error al crear la tabla valoraciones_tecnicos:', err);
        } else {
            console.log('Tabla valoraciones_tecnicos verificada/creada correctamente.');
        }
    });

    // Agregar columna fecha_resolucion si no existe
    db.query("SHOW COLUMNS FROM tickets_soporte LIKE 'fecha_resolucion'", (err, results) => {
        if (!err && results.length === 0) {
            db.query("ALTER TABLE tickets_soporte ADD COLUMN fecha_resolucion TIMESTAMP NULL DEFAULT NULL", (err2) => {
                if (err2) {
                    console.error("Error al agregar columna fecha_resolucion a tickets_soporte:", err2);
                } else {
                    console.log("Columna fecha_resolucion agregada con éxito.");
                }
            });
        }
    });

    // Agregar columna tiempo_estimado si no existe
    db.query("SHOW COLUMNS FROM tickets_soporte LIKE 'tiempo_estimado'", (err, results) => {
        if (!err && results.length === 0) {
            db.query("ALTER TABLE tickets_soporte ADD COLUMN tiempo_estimado VARCHAR(50) DEFAULT NULL", (err2) => {
                if (err2) {
                    console.error("Error al agregar columna tiempo_estimado a tickets_soporte:", err2);
                } else {
                    console.log("Columna tiempo_estimado agregada con éxito.");
                }
            });
        }
    });
});

// =========================================================================
//  CONFIGURACIÓN DE MULTER (Para guardar archivos)
// =========================================================================
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Los archivos irán a la carpeta uploads
    },
    filename: (req, file, cb) => {
        // Renombramos el archivo para que no haya duplicados: fecha_actual-nombre_original
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });


// =========================================================================
//  GESTIÓN DE TICKETS
// =========================================================================

// 2. CREAR TICKET (ACTUALIZADO CON MULTER)
app.post('/tickets', upload.single('evidence'), (req, res) => {
    const {
        fullName, area, position, email, phone,
        reqType, otherDetail, description, observations
    } = req.body;

    if (!fullName || !area || !reqType || !description) {
        return res.status(400).send({ message: 'Faltan campos obligatorios' });
    }

    // NUEVO: Verificamos si vino un archivo y guardamos su nombre
    const archivoEvidencia = req.file ? req.file.filename : null;

    const sql = `
        INSERT INTO tickets_soporte (
            nombre_completo, cargo, correo_institucional, telefono_extension, 
            id_area, id_tipo_requerimiento, detalle_otro_requerimiento, 
            descripcion_problema, observaciones_adicionales, tecnico_asignado,
            archivo_evidencia 
        ) VALUES (
            ?, ?, ?, ?, 
            ?, ?, 
            ?, ?, ?, NULL, ?
        )
    `;

    // Añadimos archivoEvidencia al final del array de valores
    const values = [
        fullName, position, email, phone,
        area, reqType, otherDetail || null, description, observations || null,
        archivoEvidencia
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send({ message: 'Error al guardar en base de datos', error: err });
        }
        const newTicketId = `INAMHI-DAF-UTICS-${new Date().getFullYear()}-${String(result.insertId).padStart(4, '0')}-ST`;
        res.status(200).send({ message: 'Ticket creado correctamente', ticketId: newTicketId });
    });
});

// 3. BUSCAR TICKET (ACTUALIZADO PARA DEVOLVER EL ARCHIVO)
app.get('/search', (req, res) => {
    const term = req.query.term;
    if (!term) return res.status(400).send({ message: 'Término de búsqueda requerido' });

    const sql = `
        SELECT t.*, a.nombre_area as area_nombre, tr.nombre_tipo as tipo_nombre
        FROM tickets_soporte t
        LEFT JOIN catalogo_areas a ON t.id_area = a.id_area
        LEFT JOIN catalogo_tipos tr ON t.id_tipo_requerimiento = tr.id_tipo
        WHERE t.nombre_completo LIKE ? 
        OR CONCAT('INAMHI-DAF-UTICS-', YEAR(t.fecha_creacion), '-', LPAD(t.id_ticket, 4, '0'), '-ST') = ?
        ORDER BY t.fecha_creacion DESC
    `;

    const searchTermLike = `%${term}%`;

    db.query(sql, [searchTermLike, term], (err, results) => {
        if (err) {
            console.error("Error en búsqueda:", err);
            return res.status(500).send({ message: 'Error en el servidor' });
        }
        if (results.length === 0) return res.status(404).send({ message: 'No se encontraron tickets' });

        const formattedTickets = results.map(ticket => ({
            id: `INAMHI-DAF-UTICS-${new Date(ticket.fecha_creacion).getFullYear()}-${String(ticket.id_ticket).padStart(4, '0')}-ST`,
            date: new Date(ticket.fecha_creacion).toLocaleDateString('es-EC'),
            name: ticket.nombre_completo,
            cargo: ticket.cargo,
            email: ticket.correo_institucional,
            phone: ticket.telefono_extension || 'No registrado',
            area: ticket.area_nombre || (ticket.id_area ? `Error JOIN` : 'Sin Área'),
            type: ticket.tipo_nombre || (ticket.id_tipo_requerimiento ? `Error JOIN` : 'Sin Tipo'),
            otherDetail: ticket.detalle_otro_requerimiento,
            status: ticket.estado,
            tech: ticket.tecnico_asignado || 'Sin Asignar',
            description: ticket.descripcion_problema || 'Sin descripción',
            observations: ticket.observaciones_adicionales || 'Ninguna',
            evidence: ticket.archivo_evidencia,
            id_area: ticket.id_area,
            estimated_time: ticket.tiempo_estimado || 'No establecido'
        }));
        
        res.json(formattedTickets);
    });
});

// 4. OBTENER HISTORIAL (ACTUALIZADO PARA DEVOLVER EL ARCHIVO)
app.get('', (req, res) => {
    const sql = `
    SELECT t.id_ticket, t.id_area, t.nombre_completo, c_area.nombre_area AS area,
        c_tipo.nombre_tipo AS tipo, t.estado, t.fecha_creacion,
        t.tecnico_asignado, t.descripcion_problema, t.archivo_evidencia, t.tiempo_estimado
    FROM tickets_soporte t
    LEFT JOIN catalogo_areas c_area ON t.id_area = c_area.id_area
    LEFT JOIN catalogo_tipos c_tipo ON t.id_tipo_requerimiento = c_tipo.id_tipo
    ORDER BY t.fecha_creacion DESC
    `;

    db.query(sql, (err, results) => {
        if (err) return res.status(500).send({ message: 'Error al obtener historial' });

        const history = results.map(ticket => {
            const dateObj = new Date(ticket.fecha_creacion);
            const year = dateObj.getFullYear();
            const techName = (ticket.tecnico_asignado && ticket.tecnico_asignado !== '') ? ticket.tecnico_asignado : 'Sin Asignar';

            return {
                id: `INAMHI-DAF-UTICS-${year}-${String(ticket.id_ticket).padStart(4, '0')}-ST`,
                date: dateObj.toLocaleDateString('es-EC'),
                name: ticket.nombre_completo,
                area: ticket.area || 'Área Desconocida',
                type: ticket.tipo || 'Tipo Desconocido',
                status: ticket.estado,
                tech: techName,
                description: ticket.descripcion_problema,
                evidence: ticket.archivo_evidencia,
                id_area: ticket.id_area,
                tiempo_estimado: ticket.tiempo_estimado || 'No establecido',
                estimated_time: ticket.tiempo_estimado || 'No establecido'
            };
        });
        res.json(history);
    });
});

// 5. ACTUALIZAR TICKET (PUT)
app.put('/:id', (req, res) => {
    const { id } = req.params;
    const { tech, status, tiempo_estimado } = req.body;

    const idParts = id.split('-');
    const realId = parseInt(idParts[idParts.length - 2]);

    if (isNaN(realId)) return res.status(400).send({ message: 'ID de ticket inválido' });

    let sql = "UPDATE tickets_soporte SET estado = ?";
    let values = [status];

    if (tech !== undefined) {
        const techToSave = tech === 'Sin Asignar' ? null : tech;
        sql += ", tecnico_asignado = ?";
        values.push(techToSave);
    }

    if (tiempo_estimado !== undefined) {
        const estTimeToSave = tiempo_estimado === 'No establecido' ? null : tiempo_estimado;
        sql += ", tiempo_estimado = ?";
        values.push(estTimeToSave);
    }

    if (status === 'Resuelto') {
        sql += ", fecha_resolucion = CURRENT_TIMESTAMP";
    } else {
        sql += ", fecha_resolucion = NULL";
    }

    sql += " WHERE id_ticket = ?";
    values.push(realId);

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Error al actualizar ticket:", err);
            return res.status(500).send({ message: 'Error interno' });
        }
        if (result.affectedRows === 0) return res.status(404).send({ message: 'Ticket no encontrado' });
        res.status(200).send({ message: 'Ticket actualizado correctamente' });
    });
});

// 5.1 ELIMINAR TICKET (DELETE)
app.delete('/:id', (req, res) => {
    const { id } = req.params;

    const idParts = id.split('-');
    const realId = parseInt(idParts[idParts.length - 2]);

    if (isNaN(realId)) return res.status(400).send({ message: 'ID inválido' });

    const sql = "DELETE FROM tickets_soporte WHERE id_ticket = ?";
    db.query(sql, [realId], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send({ message: 'Error al eliminar ticket' });
        }
        res.status(200).send({ message: 'Ticket eliminado' });
    });
});

// =========================================================================
//  GESTIÓN DE USUARIOS
// =========================================================================

// 6. CREAR USUARIO (POST)
app.post('/api/usuarios', (req, res) => {
    const { nombre, email, password, rol } = req.body;

    if (!nombre || !email || !password || !rol) {
        return res.status(400).send({ message: 'Faltan campos obligatorios' });
    }

    const rolesPermitidos = ['Pasante', 'Tecnico', 'Admin', 'Administrador'];
    if (!rolesPermitidos.includes(rol)) {
        return res.status(400).send({ message: 'Rol no válido.' });
    }

    const sql = `INSERT INTO usuarios (nombre_completo, email, password, rol) VALUES (?, ?, ?, ?)`;
    const values = [nombre, email, password, rol];

    db.query(sql, values, (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') return res.status(409).send({ message: 'El correo ya existe.' });
            return res.status(500).send({ message: 'Error al registrar usuario', error: err });
        }
        res.status(200).send({ message: 'Usuario creado exitosamente', userId: result.insertId });
    });
});

// 6.1. LISTAR USUARIOS (GET)
app.get('/api/usuarios', (req, res) => {
    const sql = "SELECT id, nombre_completo AS nombre, email, rol, password FROM usuarios";

    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send({ message: 'Error al obtener usuarios' });
        }
        res.json(results);
    });
});

// 6.2. EDITAR USUARIO (PUT)
app.put('/api/usuarios/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, email, rol, password } = req.body;

    if (password && password.trim() !== "") {
        const sql = "UPDATE usuarios SET nombre_completo = ?, email = ?, rol = ?, password = ? WHERE id = ?";
        db.query(sql, [nombre, email, rol, password, id], (err, result) => {
            if (err) return res.status(500).send({ message: 'Error al actualizar' });
            res.send({ message: 'Usuario actualizado con contraseña' });
        });
    } else {
        const sql = "UPDATE usuarios SET nombre_completo = ?, email = ?, rol = ? WHERE id = ?";
        db.query(sql, [nombre, email, rol, id], (err, result) => {
            if (err) return res.status(500).send({ message: 'Error al actualizar' });
            res.send({ message: 'Usuario actualizado sin cambiar contraseña' });
        });
    }
});

// 6.3. ELIMINAR USUARIO (DELETE)
app.delete('/api/usuarios/:id', (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM usuarios WHERE id = ?";

    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).send({ message: 'Error al eliminar usuario' });
        res.send({ message: 'Usuario eliminado correctamente' });
    });
});

// =========================================================================

// 7. LOGIN
app.post('/api/login', (req, res) => {
    const { email, password, rol } = req.body;

    if (!email || !password || !rol) return res.status(400).send({ message: 'Credenciales incompletas' });

    const sql = "SELECT * FROM usuarios WHERE email = ? AND password = ?";

    db.query(sql, [email, password], (err, results) => {
        if (err) return res.status(500).send({ message: 'Error de servidor' });

        if (results.length > 0) {
            const user = results[0];
            let accesoPermitido = false;

            if (rol === 'Administrador' || rol === 'Admin') {
                if (user.rol === 'Administrador' || user.rol === 'Admin') accesoPermitido = true;
            }
            else if (rol === 'Tecnico') {
                if (user.rol === 'Tecnico' || user.rol === 'Pasante') accesoPermitido = true;
            }

            if (accesoPermitido) {
                res.status(200).send({
                    message: 'Login exitoso',
                    user: {
                        id: user.id,
                        name: user.nombre_completo,
                        role: user.rol,
                        email: user.email
                    }
                });
            } else {
                res.status(403).send({ message: `Tu usuario no tiene permisos de ${rol}.` });
            }
        } else {
            res.status(401).send({ message: 'Credenciales incorrectas' });
        }
    });
});

// 8. LISTAR TÉCNICOS (Para Dropdown)
app.get('/api/tecnicos-list', (req, res) => {
    const sql = "SELECT nombre_completo FROM usuarios WHERE rol IN ('Tecnico', 'Pasante')";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).send({ message: 'Error al obtener técnicos' });
        res.json(results);
    });
});

// =========================================================================
//  SISTEMA DE VALORACIONES Y RANKING
// =========================================================================

// 9. REGISTRAR VALORACIÓN (POST)
app.post('/api/valoraciones', (req, res) => {
    const { id_ticket_formatted, tecnico_nombre, puntuacion, comentario } = req.body;

    if (!id_ticket_formatted || !tecnico_nombre || !puntuacion) {
        return res.status(400).send({ message: 'Faltan campos obligatorios' });
    }

    // Extraer el id_ticket numérico del formato (Ej: INAMHI-DAF-UTICS-2026-0001-ST)
    const idParts = id_ticket_formatted.split('-');
    const realId = parseInt(idParts[idParts.length - 2]);

    if (isNaN(realId)) {
        return res.status(400).send({ message: 'ID de ticket inválido' });
    }

    const sql = `
        INSERT INTO valoraciones_tecnicos (id_ticket, tecnico_nombre, puntuacion, comentario)
        VALUES (?, ?, ?, ?)
    `;

    db.query(sql, [realId, tecnico_nombre, puntuacion, comentario || null], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).send({ message: 'Este ticket ya ha sido calificado.' });
            }
            console.error(err);
            return res.status(500).send({ message: 'Error al registrar la valoración', error: err });
        }
        res.status(200).send({ message: 'Valoración registrada exitosamente', id: result.insertId });
    });
});

// Función para auto-calificar tickets con más de 24 horas resueltos sin calificar
const autoCalificarTickets = (callback) => {
    const sql = `
        INSERT IGNORE INTO valoraciones_tecnicos (id_ticket, tecnico_nombre, puntuacion, comentario)
        SELECT 
            t.id_ticket, 
            t.tecnico_asignado, 
            5, 
            'Calificación automática (24h transcurridas sin valoración)'
        FROM tickets_soporte t
        LEFT JOIN valoraciones_tecnicos v ON t.id_ticket = v.id_ticket
        WHERE t.estado = 'Resuelto' 
          AND t.tecnico_asignado IS NOT NULL 
          AND t.tecnico_asignado != 'Sin Asignar' 
          AND v.id_ticket IS NULL
          AND TIMESTAMPDIFF(HOUR, IFNULL(t.fecha_resolucion, t.fecha_creacion), CURRENT_TIMESTAMP) >= 24
    `;
    db.query(sql, (err) => {
        if (err) console.error("Error al auto-calificar tickets:", err);
        if (callback) callback();
    });
};

// 10. OBTENER VALORACIÓN DE UN TICKET ESPECÍFICO (GET)
app.get('/api/valoraciones/ticket/:id', (req, res) => {
    const { id } = req.params;

    // Extraer id real
    const idParts = id.split('-');
    const realId = parseInt(idParts[idParts.length - 2]);

    if (isNaN(realId)) {
        return res.status(400).send({ message: 'ID de ticket inválido' });
    }

    autoCalificarTickets(() => {
        const sql = "SELECT * FROM valoraciones_tecnicos WHERE id_ticket = ?";
        db.query(sql, [realId], (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).send({ message: 'Error en el servidor' });
            }
            if (results.length === 0) {
                return res.status(404).send({ message: 'El ticket no tiene valoración' });
            }
            res.json(results[0]);
        });
    });
});

// Funciones auxiliares para filtrado de fechas
function formatLocalDatetime(date) {
    const pad = num => String(num).padStart(2, '0');
    const yyyy = date.getFullYear();
    const mm = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());
    const hh = pad(date.getHours());
    const min = pad(date.getMinutes());
    const ss = pad(date.getSeconds());
    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}

function getDateRange(filterType, customStart, customEnd) {
    let start = null;
    let end = null;
    const now = new Date();

    if (filterType === 'day') {
        const d = new Date(now);
        d.setHours(0, 0, 0, 0);
        start = formatLocalDatetime(d);
        const d2 = new Date(now);
        d2.setHours(23, 59, 59, 999);
        end = formatLocalDatetime(d2);
    } else if (filterType === 'week') {
        // Últimos 7 días
        const d = new Date(now);
        d.setDate(d.getDate() - 7);
        d.setHours(0, 0, 0, 0);
        start = formatLocalDatetime(d);
        const d2 = new Date(now);
        d2.setHours(23, 59, 59, 999);
        end = formatLocalDatetime(d2);
    } else if (filterType === 'month') {
        // Últimos 30 días
        const d = new Date(now);
        d.setDate(d.getDate() - 30);
        d.setHours(0, 0, 0, 0);
        start = formatLocalDatetime(d);
        const d2 = new Date(now);
        d2.setHours(23, 59, 59, 999);
        end = formatLocalDatetime(d2);
    } else if (filterType === 'year') {
        // Últimos 365 días
        const d = new Date(now);
        d.setDate(d.getDate() - 365);
        d.setHours(0, 0, 0, 0);
        start = formatLocalDatetime(d);
        const d2 = new Date(now);
        d2.setHours(23, 59, 59, 999);
        end = formatLocalDatetime(d2);
    } else if (filterType === 'custom') {
        if (customStart) {
            const d = new Date(customStart);
            d.setHours(0, 0, 0, 0);
            start = formatLocalDatetime(d);
        }
        if (customEnd) {
            const d2 = new Date(customEnd);
            d2.setHours(23, 59, 59, 999);
            end = formatLocalDatetime(d2);
        }
    }
    return { start, end };
}

// 11. OBTENER RANKING DE TÉCNICOS Y PASANTES (GET)
app.get('/api/valoraciones/ranking', (req, res) => {
    autoCalificarTickets(() => {
        const { filterType, startDate, endDate } = req.query;
        const { start, end } = getDateRange(filterType, startDate, endDate);

        let sql = `
            SELECT 
                u.nombre_completo AS name, 
                u.rol AS role,
                IFNULL(AVG(v.puntuacion), 0) AS averageRating, 
                COUNT(v.id_valoracion) AS ratedTicketsCount,
                (
                    SELECT COUNT(*) 
                    FROM tickets_soporte t 
                    WHERE t.tecnico_asignado = u.nombre_completo 
                      AND t.estado = 'Resuelto'
                      ${start ? 'AND t.fecha_resolucion >= ?' : ''}
                      ${end ? 'AND t.fecha_resolucion <= ?' : ''}
                ) AS resolvedTicketsCount
            FROM usuarios u
            LEFT JOIN valoraciones_tecnicos v ON u.nombre_completo = v.tecnico_nombre
              ${start ? 'AND v.fecha_creacion >= ?' : ''}
              ${end ? 'AND v.fecha_creacion <= ?' : ''}
            WHERE u.rol IN ('Tecnico', 'Pasante')
            GROUP BY u.id, u.nombre_completo, u.rol
            ORDER BY averageRating DESC, resolvedTicketsCount DESC
        `;

        const params = [];
        if (start) params.push(start);
        if (end) params.push(end);
        if (start) params.push(start);
        if (end) params.push(end);

        db.query(sql, params, (err, results) => {
            if (err) {
                console.error("Error al obtener ranking:", err);
                return res.status(500).send({ message: 'Error al obtener el ranking' });
            }
            res.json(results);
        });
    });
});

// 12. OBTENER RECIENTES COMENTARIOS/FEEDBACK (GET)
app.get('/api/valoraciones/comentarios', (req, res) => {
    autoCalificarTickets(() => {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { filterType, startDate, endDate } = req.query;
        const { start, end } = getDateRange(filterType, startDate, endDate);

        let countSql = `SELECT COUNT(*) as total FROM valoraciones_tecnicos v WHERE 1=1`;
        const countParams = [];
        if (start) {
            countSql += ` AND v.fecha_creacion >= ?`;
            countParams.push(start);
        }
        if (end) {
            countSql += ` AND v.fecha_creacion <= ?`;
            countParams.push(end);
        }
        
        db.query(countSql, countParams, (countErr, countResults) => {
            if (countErr) {
                console.error("Error al contar comentarios:", countErr);
                return res.status(500).send({ message: 'Error al contar comentarios' });
            }
            
            const total = countResults[0] ? countResults[0].total : 0;

            let sql = `
                SELECT 
                    v.id_valoracion,
                    CONCAT('INAMHI-DAF-UTICS-', YEAR(t.fecha_creacion), '-', LPAD(t.id_ticket, 4, '0'), '-ST') AS ticket_id,
                    v.tecnico_nombre,
                    v.puntuacion,
                    v.comentario,
                    v.fecha_creacion,
                    t.nombre_completo AS solicitante_nombre
                FROM valoraciones_tecnicos v
                LEFT JOIN tickets_soporte t ON v.id_ticket = t.id_ticket
                WHERE 1=1
            `;

            const params = [];
            if (start) {
                sql += ` AND v.fecha_creacion >= ?`;
                params.push(start);
            }
            if (end) {
                sql += ` AND v.fecha_creacion <= ?`;
                params.push(end);
            }

            sql += ` ORDER BY v.fecha_creacion DESC LIMIT ? OFFSET ?`;
            params.push(limit, offset);

            db.query(sql, params, (err, results) => {
                if (err) {
                    console.error("Error al obtener comentarios:", err);
                    return res.status(500).send({ message: 'Error al obtener comentarios' });
                }
                res.json({
                    comments: results,
                    total: total,
                    page: page,
                    limit: limit,
                    totalPages: Math.ceil(total / limit)
                });
            });
        });
    });
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});