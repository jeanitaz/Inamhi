import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/RegistroTickects.css';
import logoInamhi from '../assets/lgo.png';

// --- ICONOS ---
const SearchIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>);
const BackIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></svg>);

// 1. INTERFAZ CORREGIDA (Para coincidir con el backend)
interface Ticket {
    id: string;          // Backend envía 'id'
    status: string;      // Backend envía 'status'
    name: string;        // Backend envía 'name'
    area: string;
    date: string;
    type: string;        // Backend envía 'type'
    description: string; // Backend envía 'description'
}

const TicketTracking = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [error, setError] = useState('');

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;

        setLoading(true);
        setTicket(null);
        setError('');

        try {
            const response = await fetch(`http://10.0.153.73:3001/api/tickets/search?term=${encodeURIComponent(searchTerm)}`);
            const data = await response.json();

            if (response.ok) {
                // El backend ya formatea la fecha, usamos 'data' directamente
                setTicket(data);
            } else {
                setError(data.message || 'No se encontró el ticket.');
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

            <div className="tracking-card animate-slide-up" style={{ maxWidth: '700px' }}>
                <div className="form-header">
                    <Link to="/" className="back-link"><BackIcon /> Volver al Inicio</Link>
                    <img src={logoInamhi} alt="Logo" className="form-logo" />
                    <h2>Consultar Estado de Ticket</h2>
                    <p>Rastree el progreso de su solicitud en tiempo real</p>
                </div>

                <form onSubmit={handleSearch} className="search-box-container">
                    <div className="search-input-wrapper">
                        <SearchIcon />
                        <input
                            type="text"
                            placeholder="Ingrese su número de ticket (Ej: INAMHI-DAF-UTICS-2025-001-ST)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="btn-search-action" disabled={loading}>
                        {loading ? <span className="spinner"></span> : 'Rastrear'}
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

                    {!loading && !error && !ticket && (
                        <div className="empty-state animate-fade-in">
                            <div className="empty-icon">🔍</div>
                            <p>Ingrese un ID de ticket o nombre para ver los detalles.</p>
                        </div>
                    )}

                    {ticket && (
                        <div className="ticket-card animate-pop-in">
                            <div className="ticket-card-header">
                                <div className="ticket-id-group">
                                    <span className="ticket-label-small">TICKET ID</span>
                                    <span className="ticket-id-badge">{ticket.id}</span>
                                </div>
                                <span className={`status-badge ${getStatusColor(ticket.status)}`}>
                                    {ticket.status}
                                </span>
                            </div>

                            <div className="ticket-progress-bar">
                                <div className={`progress-fill ${getStatusColor(ticket.status)}`} style={{ width: ticket.status === 'Resuelto' ? '100%' : '50%' }}></div>
                            </div>

                            <div className="ticket-details">
                                <div className="detail-row">
                                    <span className="label">Solicitante</span>
                                    <span className="value">{ticket.name}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Área</span>
                                    <span className="value">{ticket.area}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Fecha</span>
                                    <span className="value">{ticket.date}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Tipo</span>
                                    <span className="value">{ticket.type}</span>
                                </div>
                            </div>

                            <div className="ticket-description">
                                <span className="label">Descripción del Problema</span>
                                <p>{ticket.description}</p>
                            </div>
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