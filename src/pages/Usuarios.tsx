import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logoInamhi from '../assets/lgo.png';
import "../styles/Tecnico.css";

// --- TIPOS ---
interface Ticket {
    id: number | string;
    tech?: string | null;
    status?: string;
    type?: string;
    desc?: string;
    prio?: string;
    name?: string;
    area?: string;
    description?: string;
    [key: string]: any;
}

// --- COMPONENTE KPI ---
const StatusCard = ({ title, icon, count, colorClass }: { title: string; icon: string; count: number; colorClass: string }) => (
    <div className={`kpi-card ${colorClass}`}>
        <div className="kpi-icon-wrapper">{icon}</div>
        <div className="kpi-info">
            <span className="kpi-count">{count}</span>
            <span className="kpi-title">{title}</span>
        </div>
    </div>
);

export default function TechnicianDashboard() {
    const navigate = useNavigate();
    const [seccion, setSeccion] = useState("mis-pendientes");
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);

    // 1. OBTENER EL NOMBRE DEL TÉCNICO LOGUEADO
    const currentUser = localStorage.getItem('userName') || "Desconocido";

    // --- CARGAR DATOS DE LA API ---
    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            // RECUERDA: Si usas esto en red, cambia localhost por tu IP (ej. 192.168.1.X)
            const response = await fetch('http://10.0.153.73:3001/api/tickets');
            if (response.ok) {
                const data = await response.json();
                const formattedTickets = data.map((t: Ticket) => ({
                    ...t,
                    prio: "Media",
                    desc: t.type
                }));
                setTickets(formattedTickets);
            }
        } catch (error) {
            console.error("Error cargando tickets:", error);
        } finally {
            setLoading(false);
        }
    };

    // --- LÓGICA DE FILTRADO (AQUÍ ESTÁ EL CAMBIO) ---
    const ticketsFiltrados = tickets.filter(t => {
        // Normalizamos los textos para evitar errores de mayúsculas/minúsculas/espacios
        const techName = (t.tech || "").toLowerCase().trim();
        const currentName = currentUser.toLowerCase().trim();
        const status = (t.status || "").toLowerCase();

        // 1. BOLSA: Tickets sin técnico Y QUE NO ESTÉN RESUELTOS
        if (seccion === "bolsa") {
            const isUnassigned = !t.tech || t.tech === "Sin Asignar" || t.tech === "Por Asignar";
            const isNotResolved = status !== "resuelto";
            return isUnassigned && isNotResolved;
        }

        // 2. MIS PENDIENTES: Asignados a MÍ y NO resueltos
        if (seccion === "mis-pendientes") {
            return techName === currentName && status !== "resuelto";
        }

        // 3. HISTORIAL: Asignados a MÍ y SI resueltos
        if (seccion === "historial") {
            // CAMBIO REALIZADO:
            // Comprobamos que el técnico del ticket sea IGUAL al usuario actual
            // Y que el estado sea 'resuelto'.
            return techName === currentName && status === "resuelto";
        }

        return false;
    });

    // --- ACCIONES CONECTADAS A LA API ---

    // Acción: Auto-asignarse un ticket de la bolsa
    const tomarTicket = async (id: Ticket['id']) => {
        try {
            const response = await fetch(`http://10.0.153.73:3001/api/tickets/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tech: currentUser, // Aquí se guarda el nombre de quien lo tomó
                    status: 'En Proceso'
                }),
            });

            if (response.ok) {
                await fetchTickets();
                setSeccion("mis-pendientes");
            } else {
                alert("Error al tomar el ticket");
            }
        } catch (error) {
            console.error(error);
        }
    };

    // Acción: Finalizar ticket
    const finalizarTicket = async (id: Ticket['id']) => {
        if (window.confirm("¿Marcar ticket como resuelto?")) {
            try {
                const response = await fetch(`http://10.0.153.73:3001/api/tickets/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        status: 'Resuelto'
                    }),
                });

                if (response.ok) {
                    await fetchTickets();
                }
            } catch (error) {
                console.error(error);
            }
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    // Calculamos contadores
    const countMyPending = tickets.filter(t => (t.tech || "").toLowerCase() === currentUser.toLowerCase() && t.status !== "Resuelto").length;

    const countPool = tickets.filter(t =>
        (!t.tech || t.tech === "Sin Asignar" || t.tech === "Por Asignar") &&
        (t.status || "").toLowerCase() !== "resuelto"
    ).length;

    return (
        <div className="admin-layout">
            <div className="admin-bg-stars"></div>
            <div className="admin-bg-glow"></div>

            <aside className="glass-sidebar">
                <div className="sidebar-header">
                    <img src={logoInamhi} alt="Logo INAMHI" className="sidebar-logo" />
                </div>

                <nav className="sidebar-nav">
                    <div className="nav-group">
                        <span className="nav-label">Mi Espacio</span>

                        <button
                            className={`nav-item ${seccion === 'mis-pendientes' ? 'active' : ''}`}
                            onClick={() => setSeccion('mis-pendientes')}
                        >
                            <span className="icon">🚀</span> En Curso
                            <span className="badge-pill">{countMyPending}</span>
                        </button>

                        <button
                            className={`nav-item ${seccion === 'bolsa' ? 'active' : ''}`}
                            onClick={() => setSeccion('bolsa')}
                        >
                            <span className="icon">📥</span> Bolsa de Tickets
                            <span className="badge-pill warning">{countPool}</span>
                        </button>

                        <button
                            className={`nav-item ${seccion === 'historial' ? 'active' : ''}`}
                            onClick={() => setSeccion('historial')}
                        >
                            <span className="icon">✅</span> Historial
                        </button>
                    </div>

                    <div className="nav-group">
                        <span className="nav-label">Sistema</span>
                        <button className="nav-item logout" onClick={handleLogout}>
                            <span className="icon">🚪</span> Salir
                        </button>
                    </div>
                </nav>

                <div className="sidebar-footer">
                    <div className="user-mini-profile">
                        <div className="user-avatar">{currentUser.charAt(0).toUpperCase()}</div>
                        <div className="user-info">
                            <span className="name">{currentUser}</span>
                            <span className="role">Técnico</span>
                        </div>
                    </div>
                </div>
            </aside>

            <main className="admin-content">
                <header className="content-header">
                    <div className="header-titles">
                        <h1>Panel Técnico</h1>
                        <p>
                            {seccion === 'bolsa' && "Tickets disponibles para tomar."}
                            {seccion === 'mis-pendientes' && "Tus asignaciones activas."}
                            {seccion === 'historial' && "Tickets resueltos por ti."} {/* Texto actualizado */}
                        </p>
                    </div>
                    <div className="date-badge">{new Date().toLocaleDateString()}</div>
                </header>

                <div className="kpi-mini-grid">
                    <StatusCard title="Mis Pendientes" count={countMyPending} icon="🔥" colorClass="warning" />
                    <StatusCard title="Total Bolsa" count={countPool} icon="📢" colorClass="info" />
                </div>

                <div className="tickets-grid-container">
                    {loading ? (
                        <p style={{ color: 'white', textAlign: 'center' }}>Cargando tickets...</p>
                    ) : ticketsFiltrados.length > 0 ? (
                        ticketsFiltrados.map((t) => (
                            <div key={t.id} className={`glass-ticket-card priority-media`}>
                                <div className="ticket-header">
                                    <span className="ticket-id">#{t.id}</span>
                                    <span className={`status-badge ${t.status === 'Resuelto' ? 'done' : 'pending'}`}>{t.status}</span>
                                </div>

                                <div className="ticket-body">
                                    <h3>{t.type}</h3>
                                    <p className="desc">"{t.name}" - {t.area}</p>
                                    <h3>Descripcion del Problema</h3>
                                    <p className="desc">"{t.description}"</p>

                                    <div className="ticket-meta">
                                        <div className="meta-item">
                                            <span className="label">Solicitante:</span> {t.name}
                                        </div>
                                        <div className="meta-item">
                                            <span className="label">Área:</span> {t.area}
                                        </div>
                                    </div>
                                </div>

                                <div className="ticket-footer">
                                    {seccion === 'bolsa' && (
                                        <button className="btn-neon full-width" onClick={() => tomarTicket(t.id)}>
                                            ✋ Tomar Ticket
                                        </button>
                                    )}
                                    {seccion === 'mis-pendientes' && (
                                        <>
                                            <button className="btn-neon-green" onClick={() => finalizarTicket(t.id)}>✅ Finalizar</button>
                                        </>
                                    )}
                                    {seccion === 'historial' && (
                                        <button className="btn-glass full-width" disabled>Archivado por mí</button>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-state-glass">
                            <span className="empty-icon">📂</span>
                            <p>No hay tickets registrados en esta sección.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}