import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logoInamhi from '../assets/lgo.png';
import "../styles/Tecnico.css";

// --- ICONOS ---
const EyeIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>;
const UserIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const MapPinIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
const CheckCircleIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const LogoutIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;
const FireIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"></path></svg>;
const InboxIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path></svg>;
const ArchiveIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect><line x1="10" y1="12" x2="14" y2="12"></line></svg>;

// --- NUEVOS ICONOS ---
const CalendarIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const MailIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>;
const PhoneIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>;

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
    date?: string;
    email?: string;  // <-- Añadido
    phone?: string;  // <-- Añadido
    evidence?: string;
    [key: string]: any;
}

const StatusCard = ({ title, icon, count, colorClass }: { title: string; icon: React.ReactNode; count: number; colorClass: string }) => (
    <div className={`modern-kpi-card ${colorClass}`}>
        <div className="kpi-content">
            <span className="kpi-title">{title}</span>
            <span className="kpi-count">{count}</span>
        </div>
        <div className="kpi-icon-box">{icon}</div>
    </div>
);

export default function TechnicianDashboard() {
    const navigate = useNavigate();
    const [seccion, setSeccion] = useState("mis-pendientes");
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [ticketToResolve, setTicketToResolve] = useState<Ticket['id'] | null>(null);
    const [isResolving, setIsResolving] = useState(false);

    const currentUser = localStorage.getItem('userName') || "Desconocido";

    useEffect(() => { fetchTickets(); }, []);

    const fetchTickets = async () => {
        try {
            const response = await fetch('http://10.0.153.73:3001');
            if (response.ok) {
                const data = await response.json();
                setTickets(data.map((t: Ticket) => ({ ...t, prio: "Media", desc: t.type })));
            }
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    const ticketsFiltrados = tickets.filter(t => {
        const techName = (t.tech || "").toLowerCase().trim();
        const currentName = currentUser.toLowerCase().trim();
        const status = (t.status || "").toLowerCase();

        if (seccion === "bolsa") return (!t.tech || t.tech === "Sin Asignar" || t.tech === "Por Asignar") && status !== "resuelto";
        if (seccion === "mis-pendientes") return techName === currentName && status !== "resuelto";
        if (seccion === "historial") return techName === currentName && status === "resuelto";
        return false;
    });

    const tomarTicket = async (id: Ticket['id']) => {
        try {
            const response = await fetch(`http://10.0.153.73:3001/${id}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tech: currentUser, status: 'En Proceso' }),
            });
            if (response.ok) {
                await fetchTickets();
                setSeccion("mis-pendientes");
                setSelectedTicket(null);
            }
        } catch (error) { console.error(error); }
    };

    const confirmFinalizarTicket = async () => {
        if (!ticketToResolve) return;
        setIsResolving(true);
        try {
            const response = await fetch(`http://10.0.153.73:3001/${ticketToResolve}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'Resuelto' }),
            });
            if (response.ok) {
                await fetchTickets();
                setSelectedTicket(null);
                setTicketToResolve(null);
            }
        } catch (error) { console.error(error); } finally { setIsResolving(false); }
    };

    const handleLogout = () => { localStorage.clear(); navigate('/login'); };

    const countMyPending = tickets.filter(t => (t.tech || "").toLowerCase() === currentUser.toLowerCase() && (t.status || "").toLowerCase() !== "resuelto").length;
    const countPool = tickets.filter(t => (!t.tech || t.tech === "Sin Asignar" || t.tech === "Por Asignar") && (t.status || "").toLowerCase() !== "resuelto").length;

    return (
        <div className="tech-dashboard-layout">
            {/* SIDEBAR */}
            <aside className="tech-sidebar">
                <div className="sidebar-brand">
                    <img src={logoInamhi} alt="INAMHI" />
                </div>

                <div className="sidebar-menu">
                    <span className="menu-label">MI ESPACIO</span>
                    <button className={`menu-item ${seccion === 'mis-pendientes' ? 'active' : ''}`} onClick={() => setSeccion('mis-pendientes')}>
                        <FireIcon /> En Curso
                        {countMyPending > 0 && <span className="badge-count blue">{countMyPending}</span>}
                    </button>
                    <button className={`menu-item ${seccion === 'bolsa' ? 'active' : ''}`} onClick={() => setSeccion('bolsa')}>
                        <InboxIcon /> Bolsa de Tickets
                        {countPool > 0 && <span className="badge-count amber">{countPool}</span>}
                    </button>
                    <button className={`menu-item ${seccion === 'historial' ? 'active' : ''}`} onClick={() => setSeccion('historial')}>
                        <ArchiveIcon /> Historial
                    </button>
                </div>

                <div className="sidebar-bottom">
                    <span className="menu-label">SISTEMA</span>
                    <button className="menu-item logout-btn" onClick={handleLogout}>
                        <LogoutIcon /> Salir
                    </button>

                    <div className="user-profile-box">
                        <div className="avatar">{currentUser.charAt(0).toUpperCase()}</div>
                        <div className="user-info">
                            <span className="name">{currentUser}</span>
                            <span className="role">Técnico</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="tech-main-content">
                <header className="main-header">
                    <div>
                        <h1>Panel Técnico</h1>
                        <p>
                            {seccion === 'bolsa' && "Tickets sin asignar listos para tomar."}
                            {seccion === 'mis-pendientes' && "Tickets en los que estás trabajando actualmente."}
                            {seccion === 'historial' && "Historial de tickets que has resuelto."}
                        </p>
                    </div>
                    <div className="date-pill">{new Date().toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}</div>
                </header>

                <div className="kpi-row">
                    <StatusCard title="Mis Pendientes" count={countMyPending} icon={<FireIcon />} colorClass="kpi-blue" />
                    <StatusCard title="Total en Bolsa" count={countPool} icon={<InboxIcon />} colorClass="kpi-amber" />
                </div>

                <div className="tickets-grid">
                    {loading ? (
                        <div className="loader-box"><span className="spinner"></span>Cargando...</div>
                    ) : ticketsFiltrados.length > 0 ? (
                        ticketsFiltrados.map((t) => (
                            <div key={t.id} className="ticket-card" onClick={() => setSelectedTicket(t)}>

                                <div className="tc-header">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span className="tc-id">#{t.id.toString().slice(-4)}</span>
                                        {/* FECHA AÑADIDA EN LA TARJETA */}
                                        <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <CalendarIcon /> {t.date || 'Sin fecha'}
                                        </span>
                                    </div>
                                    <span className={`tc-status ${t.status === 'Resuelto' ? 'status-green' : 'status-yellow'}`}>
                                        {t.status}
                                    </span>
                                </div>

                                <h3 className="tc-title">{t.type}</h3>

                                <div className="tc-user">
                                    <div className="tc-avatar">{t.name ? t.name.charAt(0).toUpperCase() : '?'}</div>
                                    <div className="tc-user-text">
                                        <span className="tc-name"><UserIcon /> {t.name}</span>
                                        <span className="tc-area"><MapPinIcon /> {t.area}</span>
                                    </div>
                                </div>

                                <div className="tc-desc-box">
                                    {t.description || "Sin descripción proporcionada."}
                                </div>

                                {seccion === 'mis-pendientes' && (
                                    <div className="tc-footer">
                                        <button className="btn-resolve" onClick={(e) => { e.stopPropagation(); setTicketToResolve(t.id); }}>
                                            Finalizar Ticket
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="empty-state">
                            <ArchiveIcon />
                            <p>No hay tickets en esta sección.</p>
                        </div>
                    )}
                </div>

                {/* MODAL DE DETALLES */}
                {selectedTicket && (
                    <div className="modal-backdrop" onClick={() => setSelectedTicket(null)}>
                        <div className="modal-panel animate-slide-in" onClick={(e) => e.stopPropagation()}>
                            <button className="btn-close-modal" onClick={() => setSelectedTicket(null)}>✕</button>

                            <div className="mp-left">
                                <div className="mp-tags">
                                    <span className={`tc-status ${selectedTicket.status === 'Resuelto' ? 'status-green' : 'status-yellow'}`}>{selectedTicket.status}</span>
                                    <span className="mp-id">ID: {selectedTicket.id}</span>
                                </div>
                                <h2 className="mp-title">{selectedTicket.type}</h2>

                                <div className="mp-section">
                                    <label>DESCRIPCIÓN DEL PROBLEMA</label>
                                    <p className="mp-desc">{selectedTicket.description || 'Sin descripción detallada.'}</p>
                                </div>

                                <div className="mp-section">
                                    <label>EVIDENCIA ADJUNTA</label>
                                    {selectedTicket.evidence ? (
                                        <a href={`http://10.0.153.73:3001/uploads/${selectedTicket.evidence}`} target="_blank" rel="noopener noreferrer" className="mp-evidence-link">
                                            <EyeIcon /> Ver documento / imagen adjunta
                                        </a>
                                    ) : (
                                        <p className="mp-no-evidence">No se adjuntaron archivos.</p>
                                    )}
                                </div>
                            </div>

                            <div className="mp-right">
                                <div className="mp-meta-list">
                                    <div className="mp-meta-item">
                                        <label><UserIcon /> Solicitante</label>
                                        <span>{selectedTicket.name || 'Desconocido'}</span>
                                    </div>
                                    <div className="mp-meta-item">
                                        <label><MapPinIcon /> Área</label>
                                        <span>{selectedTicket.area || 'No especificada'}</span>
                                    </div>
                                    {/* --- NUEVOS CAMPOS AÑADIDOS AL MODAL --- */}
                                    <div className="mp-meta-item">
                                        <label><CalendarIcon /> Fecha del reporte</label>
                                        <span>{selectedTicket.date || 'No registrada'}</span>
                                    </div>
                                    <div className="mp-meta-item">
                                        <label><MailIcon /> Correo Electrónico</label>
                                        <span style={{ wordBreak: 'break-all' }}>{selectedTicket.email || 'No proporcionado'}</span>
                                    </div>
                                    <div className="mp-meta-item">
                                        <label><PhoneIcon /> Teléfono</label>
                                        <span>{selectedTicket.phone || 'No proporcionado'}</span>
                                    </div>
                                </div>

                                <div className="mp-actions">
                                    {seccion === 'bolsa' ? (
                                        <button className="btn-primary-large" onClick={() => tomarTicket(selectedTicket.id)}>Tomar Ticket</button>
                                    ) : seccion === 'mis-pendientes' ? (
                                        <button className="btn-success-large" onClick={() => setTicketToResolve(selectedTicket.id)}>Marcar como Resuelto</button>
                                    ) : (
                                        <button className="btn-outline-large" onClick={() => setSelectedTicket(null)}>Cerrar Detalles</button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL CONFIRMACIÓN REDUCIDO */}
                {ticketToResolve && (
                    <div className="modal-backdrop" style={{ zIndex: 9999 }}>
                        <div className="confirm-modal animate-pop">
                            <div className="cm-icon"><CheckCircleIcon /></div>
                            <div className="cm-content">
                                <h3>¿Finalizar Ticket?</h3>
                                <p>Estás a punto de marcar el ticket como resuelto. Esta acción no se puede deshacer.</p>
                                <div className="cm-buttons">
                                    <button className="btn-cancel" disabled={isResolving} onClick={() => setTicketToResolve(null)}>Cancelar</button>
                                    <button className="btn-confirm" disabled={isResolving} onClick={confirmFinalizarTicket}>
                                        {isResolving ? 'Guardando...' : 'Sí, finalizar'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}