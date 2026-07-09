import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import '../styles/RegistroTickects.css';
import logoInamhi from '../assets/lgo.png';

// --- ICONOS ---
const SearchIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>);
const BackIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></svg>);

const StarIcon = ({ filled, onClick, onMouseEnter, onMouseLeave }: { filled: boolean; onClick?: () => void; onMouseEnter?: () => void; onMouseLeave?: () => void }) => (
    <svg
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill={filled ? "#ffc107" : "none"}
        stroke={filled ? "#ffc107" : "#cbd5e1"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ cursor: onClick ? 'pointer' : 'default', transition: 'transform 0.15s ease', transform: filled ? 'scale(1.05)' : 'scale(1)' }}
    >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
);

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
    estimated_time?: string;
}

const AREAS_INSTITUCIONALES = [
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

    // Estados para valoraciones
    const [ticketRatings, setTicketRatings] = useState<{ [ticketId: string]: { puntuacion: number; comentario: string } | null }>({});
    const [hoverRatings, setHoverRatings] = useState<{ [key: string]: number }>({});
    const [selectedRatings, setSelectedRatings] = useState<{ [key: string]: number }>({});
    const [comments, setComments] = useState<{ [key: string]: string }>({});
    const [submitting, setSubmitting] = useState<{ [key: string]: boolean }>({});
    const [activeRatingTicket, setActiveRatingTicket] = useState<Ticket | null>(null);

    const getRatingLevelText = (stars: number) => {
        if (stars === 0 || stars === 1 || stars === 2) return "Insatisfactorio";
        if (stars === 3) return "Satisfactorio";
        return "Excelente";
    };

    const getRatingLevelLabel = (stars: number) => {
        if (stars === 0 || stars === 1 || stars === 2) {
            return { label: 'Insatisfactorio (0-2 estrellas)', className: 'insatisfactorio' };
        }
        if (stars === 3) {
            return { label: 'Satisfactorio (3 estrellas)', className: 'satisfactorio' };
        }
        return { label: 'Excelente (4-5 estrellas)', className: 'excelente' };
    };

    // Cargar calificaciones de los tickets cargados
    useEffect(() => {
        const fetchRatings = async () => {
            const newRatings: typeof ticketRatings = {};
            let autoOpenTicket: Ticket | null = null;
            for (const ticket of tickets) {
                if (ticket.status.toLowerCase() === 'resuelto') {
                    try {
                        const response = await fetch(`${API_BASE_URL}/api/valoraciones/ticket/${ticket.id}`);
                        if (response.ok) {
                            const data = await response.json();
                            newRatings[ticket.id] = data;
                        } else {
                            newRatings[ticket.id] = null;
                            if (!autoOpenTicket && ticket.tech && ticket.tech !== 'Sin Asignar') {
                                autoOpenTicket = ticket;
                            }
                        }
                    } catch (e) {
                        console.error('Error fetching rating:', ticket.id, e);
                        newRatings[ticket.id] = null;
                    }
                }
            }
            setTicketRatings(prev => ({ ...prev, ...newRatings }));

            if (autoOpenTicket) {
                setActiveRatingTicket(autoOpenTicket);
                setSelectedRatings(prev => ({ ...prev, [autoOpenTicket.id]: 0 })); // Inicializar en 0 estrellas
            }
        };

        if (tickets.length > 0) {
            fetchRatings();
        }
    }, [tickets]);

    const handleRatingSubmit = async (ticketId: string, techName: string) => {
        const rating = selectedRatings[ticketId] !== undefined ? selectedRatings[ticketId] : 0;
        const comment = comments[ticketId] || '';

        setSubmitting(prev => ({ ...prev, [ticketId]: true }));

        try {
            const response = await fetch(`${API_BASE_URL}/api/valoraciones`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_ticket_formatted: ticketId,
                    tecnico_nombre: techName,
                    puntuacion: rating,
                    comentario: comment
                })
            });

            const resData = await response.json();

            if (response.ok) {
                setTicketRatings(prev => ({ ...prev, [ticketId]: { puntuacion: rating, comentario: comment } }));
                setActiveRatingTicket(null);
            } else {
                alert(resData.message || 'Error al enviar la calificación.');
            }
        } catch (err) {
            console.error('Error submitting rating:', err);
            alert('Error de conexión con el servidor.');
        } finally {
            setSubmitting(prev => ({ ...prev, [ticketId]: false }));
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;

        setLoading(true);
        setTickets([]); // LIMPIAMOS LA LISTA AL BUSCAR
        setError('');

        try {
            const response = await fetch(`${API_BASE_URL}/search?term=${encodeURIComponent(searchTerm)}`);
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
                                        <div className="detail-row">
                                            <span className="label" style={{ display: 'block', color: '#666', fontSize: '0.8rem', textTransform: 'uppercase' }}>Tiempo Estimado de Resolución</span>
                                            <span className="value" style={{ fontWeight: '600', color: ticket.estimated_time === 'No establecido' || !ticket.estimated_time ? '#64748b' : '#0056b3' }}>
                                                {ticket.estimated_time || 'No establecido'}
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

                                    {/* Sección de Calificación */}
                                    {ticket.status.toLowerCase() === 'resuelto' && ticket.tech && ticket.tech !== 'Sin Asignar' && (
                                        <div className="ticket-rating-section" style={{
                                            marginTop: '1.5rem',
                                            padding: '1.2rem',
                                            borderRadius: '8px',
                                            background: '#f8fafc',
                                            border: '1px solid #e2e8f0',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '12px'
                                        }}>
                                            <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#1e293b', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                ⭐ Calificación del Soporte
                                            </h4>

                                            {ticketRatings[ticket.id] === undefined ? (
                                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Cargando valoración...</p>
                                            ) : ticketRatings[ticket.id] === null ? (
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                                                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569' }}>
                                                        ¡Tu inconveniente ha sido resuelto! Por favor califica la atención de <strong>{ticket.tech}</strong>.
                                                    </p>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setActiveRatingTicket(ticket);
                                                            setSelectedRatings(prev => ({ ...prev, [ticket.id]: 0 }));
                                                        }}
                                                        style={{
                                                            padding: '8px 16px',
                                                            background: '#2563eb',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '6px',
                                                            fontWeight: '600',
                                                            fontSize: '0.85rem',
                                                            cursor: 'pointer',
                                                            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
                                                            transition: 'background 0.2s'
                                                        }}
                                                    >
                                                        Calificar Atención
                                                    </button>
                                                </div>
                                            ) : (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: '#f0fdf4', padding: '10px 14px', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                                                        <span style={{ fontSize: '0.85rem', color: '#166534', fontWeight: '600' }}>
                                                            ¡Gracias por calificar a {ticket.tech}! Puntuación: {getRatingLevelText(ticketRatings[ticket.id]!.puntuacion)}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setActiveRatingTicket(ticket);
                                                            }}
                                                            style={{
                                                                background: 'none',
                                                                border: 'none',
                                                                color: '#2563eb',
                                                                fontSize: '0.85rem',
                                                                fontWeight: '600',
                                                                cursor: 'pointer',
                                                                textDecoration: 'underline'
                                                            }}
                                                        >
                                                            Ver Detalle
                                                        </button>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <StarIcon
                                                                key={star}
                                                                filled={ticketRatings[ticket.id]!.puntuacion >= star}
                                                            />
                                                        ))}
                                                    </div>
                                                    {ticketRatings[ticket.id]!.comentario && (
                                                        <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: '#374151', fontStyle: 'italic', background: 'rgba(255,255,255,0.6)', padding: '6px 10px', borderRadius: '4px' }}>
                                                            "{ticketRatings[ticket.id]!.comentario}"
                                                        </p>
                                                    )}
                                                </div>
                                            )}
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

            {/* Modal de Calificación */}
            {activeRatingTicket && (
                <div className="rating-modal-overlay">
                    <div className="rating-modal-box">
                        <button
                            type="button"
                            className="rating-modal-close"
                            onClick={() => setActiveRatingTicket(null)}
                        >
                            &times;
                        </button>

                        {ticketRatings[activeRatingTicket.id] !== null ? (
                            /* MODO SOLO LECTURA (Ya calificado) */
                            <div>
                                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                                    <span style={{ fontSize: '3rem' }}>✅</span>
                                    <h3 style={{ margin: '10px 0 5px 0', color: '#1e293b', fontSize: '1.4rem', fontWeight: 'bold' }}>
                                        Calificación Registrada
                                    </h3>
                                </div>

                                <p style={{ fontSize: '0.9rem', color: '#64748b', textAlign: 'center', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                                    Ya has valorado el ticket con ID <strong style={{ color: '#0056b3' }}>{activeRatingTicket.id}</strong>.
                                    La calificación de la atención brindada por <strong>{activeRatingTicket.tech}</strong> fue:
                                </p>

                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
                                    <div className="rating-stars-container" style={{ margin: 0 }}>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <StarIcon
                                                key={star}
                                                filled={ticketRatings[activeRatingTicket.id]!.puntuacion >= star}
                                            />
                                        ))}
                                    </div>

                                    <div className={`rating-badge-level ${getRatingLevelLabel(ticketRatings[activeRatingTicket.id]!.puntuacion).className}`}>
                                        {getRatingLevelLabel(ticketRatings[activeRatingTicket.id]!.puntuacion).label}
                                    </div>
                                </div>

                                {ticketRatings[activeRatingTicket.id]!.comentario && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.5rem' }}>
                                        <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>
                                            Tu comentario:
                                        </label>
                                        <p style={{
                                            margin: 0,
                                            padding: '12px',
                                            background: '#f8fafc',
                                            borderRadius: '8px',
                                            border: '1px solid #e2e8f0',
                                            fontSize: '0.95rem',
                                            color: '#334155',
                                            fontStyle: 'italic'
                                        }}>
                                            "{ticketRatings[activeRatingTicket.id]!.comentario}"
                                        </p>
                                    </div>
                                )}

                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    <button
                                        type="button"
                                        className="btn-rating-submit"
                                        onClick={() => setActiveRatingTicket(null)}
                                    >
                                        Aceptar
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* MODO FORMULARIO (Por calificar) */
                            <div>
                                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                                    <span style={{ fontSize: '3rem' }}>🎉</span>
                                    <h3 style={{ margin: '10px 0 5px 0', color: '#1e293b', fontSize: '1.4rem', fontWeight: 'bold' }}>
                                        ¡Felicidades!
                                    </h3>
                                    <h4 style={{ margin: 0, color: '#475569', fontSize: '1.1rem', fontWeight: '600' }}>
                                        Se solucionó tu inconveniente
                                    </h4>
                                </div>

                                <p style={{ fontSize: '0.9rem', color: '#64748b', textAlign: 'center', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                                    Tu ticket con ID <strong style={{ color: '#0056b3' }}>{activeRatingTicket.id}</strong> ha sido resuelto por <strong>{activeRatingTicket.tech}</strong>.
                                    Por favor, califica tu atención:
                                </p>

                                <div style={{
                                    display: 'flex',
                                    gap: '10px',
                                    alignItems: 'center',
                                    background: '#eff6ff',
                                    border: '1px solid #bfdbfe',
                                    padding: '10px 14px',
                                    borderRadius: '10px',
                                    fontSize: '0.82rem',
                                    color: '#1e40af',
                                    lineHeight: '1.4',
                                    marginBottom: '1.5rem',
                                    textAlign: 'left'
                                }}>
                                    <span style={{ fontSize: '1.2rem' }}>ℹ️</span>
                                    <span>
                                        Si no realizas la calificación dentro de las próximas 24 horas, el sistema asignará automáticamente <strong>5 estrellas</strong> de forma predeterminada.
                                    </span>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
                                    <div className="rating-stars-container" style={{ margin: 0 }}>
                                        {[1, 2, 3, 4, 5].map((star) => {
                                            const ratingVal = selectedRatings[activeRatingTicket.id] !== undefined ? selectedRatings[activeRatingTicket.id] : 0;
                                            const isFilled = (hoverRatings[activeRatingTicket.id] !== undefined ? hoverRatings[activeRatingTicket.id] : ratingVal) >= star;
                                            return (
                                                <StarIcon
                                                    key={star}
                                                    filled={isFilled}
                                                    onClick={() => setSelectedRatings(prev => ({ ...prev, [activeRatingTicket.id]: star }))}
                                                    onMouseEnter={() => setHoverRatings(prev => ({ ...prev, [activeRatingTicket.id]: star }))}
                                                    onMouseLeave={() => setHoverRatings(prev => {
                                                        const updated = { ...prev };
                                                        delete updated[activeRatingTicket.id];
                                                        return updated;
                                                    })}
                                                />
                                            );
                                        })}
                                    </div>

                                    <div className={`rating-badge-level ${getRatingLevelLabel(selectedRatings[activeRatingTicket.id] !== undefined ? selectedRatings[activeRatingTicket.id] : 0).className}`}>
                                        {getRatingLevelLabel(selectedRatings[activeRatingTicket.id] !== undefined ? selectedRatings[activeRatingTicket.id] : 0).label}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.5rem' }}>
                                    <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>
                                        Dejar un comentario (opcional):
                                    </label>
                                    <textarea
                                        className="rating-textarea"
                                        placeholder="Deja tu comentario sobre el soporte recibido..."
                                        value={comments[activeRatingTicket.id] || ''}
                                        onChange={(e) => setComments(prev => ({ ...prev, [activeRatingTicket.id]: e.target.value }))}
                                        maxLength={500}
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                    <button
                                        type="button"
                                        className="btn-rating-cancel"
                                        onClick={() => setActiveRatingTicket(null)}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-rating-submit"
                                        onClick={() => handleRatingSubmit(activeRatingTicket.id, activeRatingTicket.tech)}
                                        disabled={submitting[activeRatingTicket.id]}
                                    >
                                        {submitting[activeRatingTicket.id] ? 'Enviando...' : 'Enviar Calificación'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TicketTracking;