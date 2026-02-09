const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors()); // Permite que React se conecte
app.use(bodyParser.json());

// 1. CONFIGURACIÓN DE LA BASE DE DATOS
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',      // Tu usuario de MySQL
    password: '0993643838Jc',      // Tu contraseña de MySQL
    database: 'diseno_prueba', // El nombre de tu base de datos
    charset: 'utf8mb4' // Asegura que las tildes se guarden y lean bien
});

db.connect(err => {
    if (err) {
        console.error('Error conectando a la BD:', err);
        return;
    }
    console.log('Conectado a MySQL exitosamente.');
});

// =========================================================================
//  GESTIÓN DE TICKETS
// =========================================================================

// 2. CREAR TICKET
app.post('/api/tickets', (req, res) => {
    const {
        fullName, area, position, email, phone,
        reqType, otherDetail, description, observations
    } = req.body;

    if (!fullName || !area || !reqType || !description) {
        return res.status(400).send({ message: 'Faltan campos obligatorios' });
    }

    const sql = `
        INSERT INTO tickets_soporte (
            nombre_completo, cargo, correo_institucional, telefono_extension, 
            id_area, id_tipo_requerimiento, detalle_otro_requerimiento, 
            descripcion_problema, observaciones_adicionales, tecnico_asignado
        ) VALUES (
            ?, ?, ?, ?, 
            (SELECT id_area FROM catalogo_areas WHERE TRIM(nombre_area) = TRIM(?) LIMIT 1),
            (SELECT id_tipo FROM catalogo_tipos WHERE TRIM(nombre_tipo) = TRIM(?) LIMIT 1),
            ?, ?, ?, NULL
        )
    `;

    const values = [
        fullName, position, email, phone,
        area, reqType, otherDetail || null, description, observations || null
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send({ message: 'Error al guardar en base de datos', error: err });
        }
        // CAMBIO AQUÍ: Formato largo con -ST al final
        const newTicketId = `INAMHI-DAF-UTICS-${new Date().getFullYear()}-${String(result.insertId).padStart(4, '0')}-ST`;
        res.status(200).send({ message: 'Ticket creado correctamente', ticketId: newTicketId });
    });
});

// 3. BUSCAR TICKET
app.get('/api/tickets/search', (req, res) => {
    const term = req.query.term;
    if (!term) return res.status(400).send({ message: 'Término de búsqueda requerido' });

    // CAMBIO AQUÍ: SQL CONCAT actualizado para buscar el formato largo con -ST
    const sql = `
        SELECT t.*, a.nombre_area as area_nombre, tr.nombre_tipo as tipo_nombre
        FROM tickets_soporte t
        LEFT JOIN catalogo_areas a ON t.id_area = a.id_area
        LEFT JOIN catalogo_tipos tr ON t.id_tipo_requerimiento = tr.id_tipo
        WHERE t.nombre_completo LIKE ? 
        OR CONCAT('INAMHI-DAF-UTICS-', YEAR(t.fecha_creacion), '-', LPAD(t.id_ticket, 4, '0'), '-ST') = ?
    `;

    const searchTermLike = `%${term}%`;

    db.query(sql, [searchTermLike, term], (err, results) => {
        if (err) {
            console.error("Error en búsqueda:", err);
            return res.status(500).send({ message: 'Error en el servidor' });
        }
        if (results.length === 0) return res.status(404).send({ message: 'No se encontró el ticket' });

        const ticket = results[0]; 
        const formattedTicket = {
            // CAMBIO AQUÍ: Formato de respuesta JSON
            id: `INAMHI-DAF-UTICS-${new Date(ticket.fecha_creacion).getFullYear()}-${String(ticket.id_ticket).padStart(4, '0')}-ST`,
            date: new Date(ticket.fecha_creacion).toLocaleDateString('es-EC'),
            name: ticket.nombre_completo,
            area: ticket.area_nombre || (ticket.id_area ? `Error JOIN` : 'Sin Área'),
            type: ticket.tipo_nombre || (ticket.id_tipo_requerimiento ? `Error JOIN` : 'Sin Tipo'),
            status: ticket.estado,
            tech: ticket.tecnico_asignado || 'Sin Asignar',
            description: ticket.descripcion_problema || 'Sin descripción' 
        };
        res.json(formattedTicket);
    });
});

// 4. OBTENER HISTORIAL (GET)
app.get('/api/tickets', (req, res) => {
    const sql = `
    SELECT t.id_ticket, t.nombre_completo, c_area.nombre_area AS area,
        c_tipo.nombre_tipo AS tipo, t.estado, t.fecha_creacion,
        t.tecnico_asignado, t.descripcion_problema
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
                // CAMBIO AQUÍ: Formato de respuesta en la lista
                id: `INAMHI-DAF-UTICS-${year}-${String(ticket.id_ticket).padStart(4, '0')}-ST`,
                date: dateObj.toLocaleDateString('es-EC'),
                name: ticket.nombre_completo,
                area: ticket.area || 'Área Desconocida',
                type: ticket.tipo || 'Tipo Desconocido',
                status: ticket.estado,
                tech: techName,
                description: ticket.descripcion_problema
            };
        });
        res.json(history);
    });
});

// 5. ACTUALIZAR TICKET (PUT)
app.put('/api/tickets/:id', (req, res) => {
    const { id } = req.params; 
    const { tech, status } = req.body;
    
    // CAMBIO IMPORTANTE: Lógica para extraer el ID numérico
    // Como el ID termina en "-ST", el número es el penúltimo elemento, no el último.
    const idParts = id.split('-');
    const realId = parseInt(idParts[idParts.length - 2]); 

    if (isNaN(realId)) return res.status(400).send({ message: 'ID de ticket inválido' });

    let sql = "";
    let values = [];

    if (tech === undefined) {
        sql = "UPDATE tickets_soporte SET estado = ? WHERE id_ticket = ?";
        values = [status, realId];
    } else {
        const techToSave = tech === 'Sin Asignar' ? null : tech;
        sql = "UPDATE tickets_soporte SET estado = ?, tecnico_asignado = ? WHERE id_ticket = ?";
        values = [status, techToSave, realId];
    }

    db.query(sql, values, (err, result) => {
        if (err) return res.status(500).send({ message: 'Error interno' });
        if (result.affectedRows === 0) return res.status(404).send({ message: 'Ticket no encontrado' });
        res.status(200).send({ message: 'Ticket actualizado correctamente' });
    });
});

// 5.1 ELIMINAR TICKET (DELETE)
app.delete('/api/tickets/:id', (req, res) => {
    const { id } = req.params;
    
    // CAMBIO IMPORTANTE: Lógica para extraer el ID numérico
    // Como el ID termina en "-ST", el número es el penúltimo elemento.
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

    // Si envían password, actualizamos todo
    if (password && password.trim() !== "") {
        const sql = "UPDATE usuarios SET nombre_completo = ?, email = ?, rol = ?, password = ? WHERE id = ?";
        db.query(sql, [nombre, email, rol, password, id], (err, result) => {
            if (err) return res.status(500).send({ message: 'Error al actualizar' });
            res.send({ message: 'Usuario actualizado con contraseña' });
        });
    } else {
        // Si NO envían password, mantenemos la anterior
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

            // Lógica de permisos
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

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
