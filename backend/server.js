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
    charset: 'utf8mb4' // <--- NUEVO: Asegura que las tildes se guarden y lean bien
});

db.connect(err => {
    if (err) {
        console.error('Error conectando a la BD:', err);
        return;
    }
    console.log('Conectado a MySQL exitosamente.');
});

// 2. ENDPOINT PARA CREAR TICKET (MEJORADO CON TRIM)
app.post('/api/tickets', (req, res) => {
    const {
        fullName, area, position, email, phone,
        reqType, otherDetail, description, observations
    } = req.body;

    // Validación básica
    if (!fullName || !area || !reqType || !description) {
        return res.status(400).send({ message: 'Faltan campos obligatorios' });
    }

    // LOG PARA VERIFICAR QUE LLEGA AL CREAR
    console.log(`Intentando crear ticket. Area: "${area}", Tipo: "${reqType}"`);

    // NUEVO SQL: Usamos TRIM() para ignorar espacios invisibles al inicio o final
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
        area,    // Se comparará usando TRIM
        reqType, // Se comparará usando TRIM
        otherDetail || null,
        description,
        observations || null
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send({ message: 'Error al guardar en base de datos', error: err });
        }

        const newTicketId = `SSTI-${new Date().getFullYear()}-${String(result.insertId).padStart(4, '0')}`;
        res.status(200).send({
            message: 'Ticket creado correctamente',
            ticketId: newTicketId
        });
    });
});

// 3. ENDPOINT PARA BUSCAR TICKET (CON DEBUGGING)
app.get('/api/tickets/search', (req, res) => {
    const term = req.query.term;
    if (!term) {
        return res.status(400).send({ message: 'Término de búsqueda requerido' });
    }

    const sql = `
        SELECT 
            t.*, 
            a.nombre_area as area_nombre, 
            tr.nombre_tipo as tipo_nombre
        FROM tickets_soporte t
        LEFT JOIN catalogo_areas a ON t.id_area = a.id_area
        LEFT JOIN catalogo_tipos tr ON t.id_tipo_requerimiento = tr.id_tipo
        WHERE 
            t.nombre_completo LIKE ? 
            OR CONCAT('SSTI-', YEAR(t.fecha_creacion), '-', LPAD(t.id_ticket, 4, '0')) = ?
    `;

    const searchTermLike = `%${term}%`;

    db.query(sql, [searchTermLike, term], (err, results) => {
        if (err) {
            console.error("Error en búsqueda:", err);
            return res.status(500).send({ message: 'Error en el servidor' });
        }

        if (results.length === 0) {
            return res.status(404).send({ message: 'No se encontró el ticket' });
        }

        const ticket = results[0]; 
        
        // LOG DEPURACIÓN: Ver qué devuelve la base de datos realmente
        console.log("Datos encontrados:", {
            id: ticket.id_ticket,
            area_id: ticket.id_area,
            area_nombre: ticket.area_nombre,
            tipo_id: ticket.id_tipo_requerimiento,
            tipo_nombre: ticket.tipo_nombre
        });

        const formattedTicket = {
            id: `SSTI-${new Date(ticket.fecha_creacion).getFullYear()}-${String(ticket.id_ticket).padStart(4, '0')}`,
            date: new Date(ticket.fecha_creacion).toLocaleDateString('es-EC'),
            name: ticket.nombre_completo,
            
            area: ticket.area_nombre 
                  ? ticket.area_nombre 
                  : (ticket.id_area ? `Error JOIN (ID: ${ticket.id_area})` : 'Sin Área asignada (NULL)'),
            
            type: ticket.tipo_nombre 
                  ? ticket.tipo_nombre 
                  : (ticket.id_tipo_requerimiento ? `Error JOIN (ID: ${ticket.id_tipo_requerimiento})` : 'Sin Tipo asignado (NULL)'),
            
            status: ticket.estado,
            tech: ticket.tecnico_asignado || 'Sin Asignar',
            description: ticket.descripcion_problema || ticket.descripcion || 'Sin descripción detallada' 
        };

        res.json(formattedTicket);
    });
});

// 4. ENDPOINT PARA OBTENER HISTORIAL
app.get('/api/tickets', (req, res) => {
    const sql = `
    SELECT 
        t.id_ticket, 
        t.nombre_completo, 
        c_area.nombre_area AS area,
        c_tipo.nombre_tipo AS tipo, 
        t.estado, 
        t.fecha_creacion,
        t.tecnico_asignado,
        t.descripcion_problema  // <--- ¡AGREGA ESTO!
    FROM tickets_soporte t
    LEFT JOIN catalogo_areas c_area ON t.id_area = c_area.id_area
    LEFT JOIN catalogo_tipos c_tipo ON t.id_tipo_requerimiento = c_tipo.id_tipo
    ORDER BY t.fecha_creacion DESC
`;
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send({ message: 'Error al obtener historial' });
        }

        const history = results.map(ticket => {
            const dateObj = new Date(ticket.fecha_creacion);
            const year = dateObj.getFullYear();
            
            const techName = (ticket.tecnico_asignado && ticket.tecnico_asignado !== '') 
                             ? ticket.tecnico_asignado 
                             : 'Sin Asignar';

            return {
                id: `SSTI-${year}-${String(ticket.id_ticket).padStart(4, '0')}`,
                date: dateObj.toLocaleDateString('es-EC'),
                name: ticket.nombre_completo,
                area: ticket.area || 'Área Desconocida',
                type: ticket.tipo || 'Tipo Desconocido',
                status: ticket.estado,
                tech: techName,
                description: ticket.descripcion_problema // <--- Asegúrate que esto esté mapeado
            };
        });

        res.json(history);
    });
});

// 5. ENDPOINT PARA ACTUALIZAR TICKET (PUT)
app.put('/api/tickets/:id', (req, res) => {
    const { id } = req.params; 
    const { tech, status } = req.body;

    const idParts = id.split('-');
    const realId = parseInt(idParts.pop()); 

    if (isNaN(realId)) {
        return res.status(400).send({ message: 'ID de ticket inválido' });
    }

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
        if (err) {
            console.error("Error al actualizar:", err);
            return res.status(500).send({ message: 'Error interno del servidor' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).send({ message: 'Ticket no encontrado' });
        }

        res.status(200).send({ message: 'Ticket actualizado correctamente' });
    });
});

// 6. ENDPOINT PARA CREAR USUARIOS
app.post('/api/usuarios', (req, res) => {
    const { nombre, email, password, rol } = req.body;

    if (!nombre || !email || !password || !rol) {
        return res.status(400).send({ message: 'Faltan campos obligatorios' });
    }

    const rolesPermitidos = ['Pasante', 'Tecnico'];
    if (!rolesPermitidos.includes(rol)) {
        return res.status(400).send({ message: 'Rol no válido.' });
    }

    const sql = `INSERT INTO usuarios (nombre_completo, email, password, rol) VALUES (?, ?, ?, ?)`;
    const values = [nombre, email, password, rol];

    db.query(sql, values, (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).send({ message: 'El correo electrónico ya está registrado.' });
            }
            return res.status(500).send({ message: 'Error al registrar usuario', error: err });
        }
        res.status(200).send({ message: 'Usuario creado exitosamente', userId: result.insertId });
    });
});

// 7. ENDPOINT DE LOGIN
app.post('/api/login', (req, res) => {
    const { email, password, rol } = req.body;

    if (!email || !password || !rol) {
        return res.status(400).send({ message: 'Credenciales incompletas' });
    }

    const sql = "SELECT * FROM usuarios WHERE email = ? AND password = ?";
    
    db.query(sql, [email, password], (err, results) => {
        if (err) {
            return res.status(500).send({ message: 'Error de servidor' });
        }

        if (results.length > 0) {
            const user = results[0];
            let accesoPermitido = false;

            if (rol === 'Administrador') {
                if (user.rol === 'Administrador') accesoPermitido = true;
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

// 8. ENDPOINT PARA LISTAR TÉCNICOS
app.get('/api/tecnicos-list', (req, res) => {
    const sql = "SELECT nombre_completo FROM usuarios WHERE rol IN ('Tecnico', 'Pasante')";
    
    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).send({ message: 'Error al obtener técnicos' });
        }
        res.json(results);
    });
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});