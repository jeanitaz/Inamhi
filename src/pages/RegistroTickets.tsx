import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/RegistroTickects.css';
import logoInamhi from '../assets/lgo.png';

// --- ICONOS ---
const SearchIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>);
const BackIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></svg>);

// 1. INTERFAZ ACTUALIZADA CON TODOS LOS CAMPOS
interface Ticket {
    id: string;
    status: string;
    name: string;
    cargo: string;
    email: string;
    phone: string;
    area: string;
    date: string;
    type: string;
    otherDetail: string | null;
    tech: string;
    description: string;
    observations: string;
    id_area?: number;
}

const AREAS_INSTITUCIONALES = [
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

const getAreaFromBackendString = (backendName: string, id_area?: number) => {
    if (id_area) {
        const exactArea = AREAS_INSTITUCIONALES.find(a => a.id.toString() === id_area.toString());
        if (exactArea) return exactArea.nombre;
    }

    if (!backendName) return 'Sin Área';
    const upperName = backendName.toUpperCase();

    const exactMatch = AREAS_INSTITUCIONALES.find(a => a.nombre.toUpperCase() === upperName);
    if (exactMatch) return exactMatch.nombre;

    if (upperName.includes("HIDROLOGÍA")) return "DIRECCIÓN DE INFORMACIÓN HIDROMETEOROLÓGICA";
    if (upperName.includes("JURÍDICA")) return "DIRECCIÓN DE ASESORÍA JURÍDICA";
    if (upperName.includes("COMUNICACIÓN")) return "DIRECCIÓN DE COMUNICACIÓN SOCIAL";
    if (upperName.includes("EJECUTIVA") || upperName.includes("TÉCNICA")) return "DIRECCIÓN EJECUTIVA";
    if (upperName.includes("ADMINISTRATIVA") || upperName.includes("FINANCIERA")) return "DIRECCIÓN ADMINISTRATIVA FINANCIERA";
    if (upperName.includes("RECURSOS HUMANOS")) return "DIRECCIÓN DE ADMINISTRACIÓN DE RECURSOS HUMANOS";
    if (upperName.includes("TECNOLOGÍAS") || upperName.includes("INFORMACIÓN Y COMUNICACIÓN")) return "TECNOLOGÍAS DE LA INFORMACIÓN Y COMUNICACIÓN";
    if (upperName.includes("PLANIFICACIÓN")) return "DIRECCIÓN DE PLANIFICACIÓN";
    if (upperName.includes("PRONÓSTICOS")) return "DIRECCIÓN DE PRONÓSTICOS Y ALERTAS";
    if (upperName.includes("ESTUDIOS")) return "DIRECCIÓN DE ESTUDIOS, INVESTIGACIÓN Y DESARROLLO HIDROMETEOROLÓGICO";
    if (upperName.includes("OBSERVACIÓN")) return "DIRECCIÓN DE LA RED NACIONAL DE OBSERVACIÓN HIDROMETEOROLÓGICA";
    if (upperName.includes("AGUA Y SEDIMENTOS")) return "LABORATORIO NACIONAL DE CALIDAD DE AGUA Y SEDIMENTOS";

    return upperName;
};

const TicketTracking = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [error, setError] = useState('');

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;

        setLoading(true);
        setTickets([]); // LIMPIAMOS LA LISTA AL BUSCAR
        setError('');

        try {
            const response = await fetch(`http://10.0.153.73:3001/search?term=${encodeURIComponent(searchTerm)}`);
            const data = await response.json();

            if (response.ok) {
                const mappedData = data.map((t: Ticket) => ({
                    ...t,
                    area: getAreaFromBackendString(t.area, t.id_area)
                }));
                setTickets(mappedData);
            } else {
                setError(data.message || 'No se encontró ningún ticket.');
            }
        } catch (err) {
            console.error("Error buscando ticket:", err);
            setError('Error de conexión con el servidor.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        const s = status ? status.toLowerCase() : '';
        if (s === 'resuelto') return 'status-success';
        if (s === 'en proceso') return 'status-warning';
        return 'status-pending';
    };

    return (
        <div className="form-container">
            <div className="historial-bg-animation"></div>
            <div className="particles">
                <span></span><span></span><span></span><span></span><span></span>
                <span></span><span></span><span></span><span></span><span></span>
            </div>

            {/* Aumentamos un poco el maxWidth a 800px para acomodar mejor los datos en 2 columnas */}
            <div className="tracking-card animate-slide-up" style={{ maxWidth: '800px' }}>
                <div className="form-header">
                    <Link to="/" className="back-link"><BackIcon /> Volver al Inicio</Link>
                    <img src={logoInamhi} alt="Logo" className="form-logo" />
                    <h2>Consultar Estado de Tickets</h2>
                    <p>Busque por su número de ticket o nombre para ver el detalle completo de sus solicitudes</p>
                </div>

                <form onSubmit={handleSearch} className="search-box-container">
                    <div className="search-input-wrapper">
                        <SearchIcon />
                        <input
                            type="text"
                            placeholder="Ingrese ID (Ej: INAMHI-...) o Nombre del solicitante..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="btn-search-action" disabled={loading}>
                        {loading ? <span className="spinner"></span> : 'Buscar'}
                    </button>
                </form>

                <div className="divider"></div>

                <div className="result-area">
                    {loading && (
                        <div className="loading-state">
                            <span className="spinner-blue"></span>
                            <p className="loading-text">Buscando en el sistema...</p>
                        </div>
                    )}

                    {error && (
                        <div className="error-message animate-shake">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                            <span>{error}</span>
                        </div>
                    )}

                    {!loading && !error && tickets.length === 0 && (
                        <div className="empty-state animate-fade-in">
                            <div className="empty-icon">🔍</div>
                            <p>Ingrese un ID de ticket o nombre para ver los detalles.</p>
                        </div>
                    )}

                    {/* RENDERIZAR LA LISTA DE TICKETS CON SCROLL */}
                    {tickets.length > 0 && (
                        <div className="tickets-list" style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1.5rem',
                            maxHeight: '60vh', /* Altura máxima adaptada a la pantalla */
                            overflowY: 'auto',  /* Activa el scroll vertical */
                            paddingRight: '12px'
                        }}>
                            {tickets.length > 1 && (
                                <p style={{ textAlign: 'center', fontSize: '0.9rem', color: '#666', margin: '0 0 10px 0' }}>
                                    Se encontraron {tickets.length} tickets para "{searchTerm}"
                                </p>
                            )}

                            {tickets.map((ticket) => (
                                <div key={ticket.id} className="ticket-card animate-pop-in" style={{ 
                                    padding: '1.5rem', 
                                    border: '1px solid #e0e0e0', 
                                    borderRadius: '8px', 
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)', 
                                    backgroundColor: '#fff',
                                    flexShrink: 0 /* <--- AQUÍ ESTÁ LA SOLUCIÓN IMPLEMENTADA */
                                }}>

                                    {/* Cabecera del Ticket */}
                                    <div className="ticket-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                        <div className="ticket-id-group">
                                            <span className="ticket-label-small" style={{ fontSize: '0.75rem', color: '#888', display: 'block', letterSpacing: '0.5px' }}>TICKET ID</span>
                                            <span className="ticket-id-badge" style={{ fontWeight: 'bold', color: '#0056b3', fontSize: '1.1rem' }}>{ticket.id}</span>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <span className={`status-badge ${getStatusColor(ticket.status)}`} style={{ marginBottom: '5px', display: 'inline-block' }}>
                                                {ticket.status}
                                            </span>
                                            <span style={{ display: 'block', fontSize: '0.8rem', color: '#666' }}>Fecha: {ticket.date}</span>
                                        </div>
                                    </div>

                                    {/* Barra de Progreso */}
                                    <div className="ticket-progress-bar" style={{ height: '6px', background: '#e9ecef', borderRadius: '3px', overflow: 'hidden', marginBottom: '1.5rem' }}>
                                        <div className={`progress-fill ${getStatusColor(ticket.status)}`} style={{ height: '100%', transition: 'width 0.3s ease', width: ticket.status.toLowerCase() === 'resuelto' ? '100%' : '50%' }}></div>
                                    </div>

                                    {/* Detalles del Ticket (Cuadrícula 2 columnas) */}
                                    <div className="ticket-details" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                                        <div className="detail-row">
                                            <span className="label" style={{ display: 'block', color: '#666', fontSize: '0.8rem', textTransform: 'uppercase' }}>Solicitante</span>
                                            <span className="value" style={{ fontWeight: '600', color: '#333' }}>{ticket.name}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="label" style={{ display: 'block', color: '#666', fontSize: '0.8rem', textTransform: 'uppercase' }}>Cargo</span>
                                            <span className="value" style={{ fontWeight: '500', color: '#444' }}>{ticket.cargo}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="label" style={{ display: 'block', color: '#666', fontSize: '0.8rem', textTransform: 'uppercase' }}>Correo Institucional</span>
                                            <span className="value" style={{ fontWeight: '500', color: '#444' }}>{ticket.email}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="label" style={{ display: 'block', color: '#666', fontSize: '0.8rem', textTransform: 'uppercase' }}>Teléfono</span>
                                            <span className="value" style={{ fontWeight: '500', color: '#444' }}>{ticket.phone}</span>
                                        </div>
                                        <div className="detail-row" style={{ gridColumn: '1 / -1' }}>
                                            <span className="label" style={{ display: 'block', color: '#666', fontSize: '0.8rem', textTransform: 'uppercase' }}>Dirección / Área</span>
                                            <span className="value" style={{ fontWeight: '500', color: '#444' }}>{ticket.area}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="label" style={{ display: 'block', color: '#666', fontSize: '0.8rem', textTransform: 'uppercase' }}>Tipo de Requerimiento</span>
                                            <span className="value" style={{ fontWeight: '500', color: '#444' }}>
                                                {ticket.type}
                                                {ticket.otherDetail ? ` - (${ticket.otherDetail})` : ''}
                                            </span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="label" style={{ display: 'block', color: '#666', fontSize: '0.8rem', textTransform: 'uppercase' }}>Técnico Asignado</span>
                                            <span className="value" style={{ fontWeight: '600', color: ticket.tech === 'Sin Asignar' ? '#dc3545' : '#198754' }}>
                                                {ticket.tech}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Descripción */}
                                    <div className="ticket-description" style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '6px', fontSize: '0.95rem', borderLeft: '4px solid #0056b3' }}>
                                        <span className="label" style={{ display: 'block', color: '#555', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Descripción del Problema</span>
                                        <p style={{ margin: 0, color: '#333', lineHeight: '1.5' }}>{ticket.description}</p>
                                    </div>

                                    {/* Observaciones (Solo se muestra si hay alguna) */}
                                    {ticket.observations && ticket.observations !== 'Ninguna' && (
                                        <div className="ticket-observations" style={{ background: '#fff8e1', padding: '1rem', borderRadius: '6px', fontSize: '0.95rem', borderLeft: '4px solid #ffc107', marginTop: '1rem' }}>
                                            <span className="label" style={{ display: 'block', color: '#664d03', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Observaciones Adicionales</span>
                                            <p style={{ margin: 0, color: '#333', lineHeight: '1.5' }}>{ticket.observations}</p>
                                        </div>
                                    )}

                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="tracking-footer">
                    <p>¿Necesita ayuda adicional? <a href="#" className="link-help">Contactar Soporte</a></p>
                </div>
            </div>
        </div>
    );
};

export default TicketTracking;