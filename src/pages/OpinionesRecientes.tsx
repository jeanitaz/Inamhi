import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL as API_BASE_URL_CONFIG } from '../config';
import '../styles/Opiniones.css';
import logoInamhi from '../assets/lgo.png';

// --- ICONOS SVG ---
const BackIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5" />
        <path d="M12 19l-7-7 7-7" />
    </svg>
);

const StarIcon = ({ filled }: { filled: boolean }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "#ffc107" : "none"} stroke={filled ? "#ffc107" : "#64748b"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
);

const ArrowLeftIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 18l-6-6 6-6" />
    </svg>
);

const ArrowRightIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18l6-6-6-6" />
    </svg>
);

interface RecentComment {
    id_valoracion: number;
    ticket_id: string;
    tecnico_nombre: string;
    puntuacion: number;
    comentario: string;
    fecha_creacion: string;
    solicitante_nombre: string;
}

export default function OpinionesRecientes() {
    const API_BASE_URL = API_BASE_URL_CONFIG;

    const [comments, setComments] = useState<RecentComment[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalComments, setTotalComments] = useState(0);
    const limit = 10;

    // Filtros de fecha
    const [filterType, setFilterType] = useState('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [activeCustomFilter, setActiveCustomFilter] = useState({ start: '', end: '' });

    const fetchComments = async (currentPage: number) => {
        setLoading(true);
        try {
            let url = `${API_BASE_URL}/api/valoraciones/comentarios?page=${currentPage}&limit=${limit}&filterType=${filterType}`;
            if (filterType === 'custom') {
                if (activeCustomFilter.start) url += `&startDate=${activeCustomFilter.start}`;
                if (activeCustomFilter.end) url += `&endDate=${activeCustomFilter.end}`;
            }
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                setComments(data.comments || []);
                setTotalPages(data.totalPages || 1);
                setTotalComments(data.total || 0);
            }
        } catch (error) {
            console.error("Error al cargar comentarios:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setPage(1);
    }, [filterType, activeCustomFilter]);

    useEffect(() => {
        fetchComments(page);
    }, [page, filterType, activeCustomFilter]);

    const handleApplyCustomFilter = () => {
        if (!startDate || !endDate) {
            alert("Por favor seleccione fecha de inicio y fin.");
            return;
        }
        setActiveCustomFilter({ start: startDate, end: endDate });
    };

    const handlePrevPage = () => {
        if (page > 1) {
            setPage(page - 1);
        }
    };

    const handleNextPage = () => {
        if (page < totalPages) {
            setPage(page + 1);
        }
    };

    const renderPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={`pagination-number-btn ${page === i ? 'active' : ''}`}
                >
                    {i}
                </button>
            );
        }
        return pages;
    };

    return (
        <div className="opiniones-layout">
            <div className="opiniones-bg-stars"></div>
            <div className="opiniones-bg-glow"></div>

            <div className="opiniones-container animate-enter">
                <header className="opiniones-header">
                    <div className="header-brand-wrapper">
                        <Link to="/ranking" className="btn-back-circle" title="Volver al Ranking">
                            <BackIcon />
                        </Link>
                        <img src={logoInamhi} alt="INAMHI" className="brand-logo" />
                    </div>
                    <div className="header-title-container">
                        <h1 className="opiniones-title">Opiniones y Feedback</h1>
                        <p className="opiniones-subtitle">
                            Total de comentarios registrados: <strong>{totalComments}</strong>
                        </p>
                    </div>
                </header>

                {/* BARRA DE FILTROS TEMPORALES */}
                <div className="filter-bar-panel glass-panel" style={{ marginBottom: '2rem' }}>
                    <div className="filter-bar-content" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                        <div className="filter-group" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            <span className="filter-icon" style={{ fontSize: '1.2rem' }}>📅</span>
                            <label htmlFor="filterTypeSelect" style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: '600' }}>Período:</label>
                            <select
                                id="filterTypeSelect"
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                style={{
                                    background: 'rgba(30, 41, 59, 0.7)',
                                    color: '#f8fafc',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '8px',
                                    padding: '8px 12px',
                                    fontSize: '0.9rem',
                                    fontWeight: '500',
                                    outline: 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <option value="all">Todo el tiempo</option>
                                <option value="day">Hoy</option>
                                <option value="week">Últimos 7 días</option>
                                <option value="month">Últimos 30 días</option>
                                <option value="year">Últimos 365 días</option>
                                <option value="custom">Rango personalizado</option>
                            </select>
                        </div>

                        {filterType === 'custom' && (
                            <div className="custom-dates-group animate-enter" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Desde:</span>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        style={{
                                            background: 'rgba(30, 41, 59, 0.7)',
                                            color: '#f8fafc',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            borderRadius: '8px',
                                            padding: '7px 10px',
                                            fontSize: '0.88rem',
                                            outline: 'none'
                                        }}
                                    />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Hasta:</span>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        style={{
                                            background: 'rgba(30, 41, 59, 0.7)',
                                            color: '#f8fafc',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            borderRadius: '8px',
                                            padding: '7px 10px',
                                            fontSize: '0.88rem',
                                            outline: 'none'
                                        }}
                                    />
                                </div>
                                <button
                                    onClick={handleApplyCustomFilter}
                                    style={{
                                        background: '#2563eb',
                                        color: '#ffffff',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '8px 16px',
                                        fontSize: '0.88rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
                                        transition: 'all 0.2s'
                                    }}
                                    className="btn-apply-filter"
                                >
                                    Aplicar
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="loading-state-center">
                        <span className="spinner-glow"></span>
                        <p>Cargando comentarios...</p>
                    </div>
                ) : (
                    <div className="opiniones-content-area">
                        <div className="opiniones-grid">
                            {comments.map((comment) => (
                                <div key={comment.id_valoracion} className="opinion-card glass-panel">
                                    <div className="card-header">
                                        <div className="user-icon-circle">👤</div>
                                        <div className="comment-meta">
                                            <span className="solicitante-name">{comment.solicitante_nombre || 'Usuario Anónimo'}</span>
                                            <span className="ticket-id-ref">Ticket #{comment.ticket_id}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="comment-stars">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <StarIcon key={star} filled={comment.puntuacion >= star} />
                                        ))}
                                        <span className="comment-date">
                                            {new Date(comment.fecha_creacion).toLocaleDateString('es-EC', { 
                                                day: '2-digit', 
                                                month: 'short', 
                                                year: 'numeric' 
                                            })}
                                        </span>
                                    </div>

                                    <p className="comment-text-body">
                                        "{comment.comentario || 'Sin comentarios adicionales.'}"
                                    </p>
                                    
                                    <div className="comment-footer">
                                        <span>Atendido por:</span>
                                        <span className="comment-tech-assigned">🧑‍💻 {comment.tecnico_nombre}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {comments.length === 0 && (
                            <div className="empty-feed-state glass-panel">
                                <span className="empty-feed-icon">💬</span>
                                <p>Aún no se han registrado comentarios ni calificaciones de soporte.</p>
                            </div>
                        )}

                        {totalPages > 1 && (
                            <div className="opiniones-pagination-wrapper">
                                <button 
                                    onClick={handlePrevPage} 
                                    disabled={page === 1}
                                    className="pagination-arrow-btn"
                                    title="Página Anterior"
                                >
                                    <ArrowLeftIcon />
                                </button>
                                
                                <div className="pagination-numbers">
                                    {renderPageNumbers()}
                                </div>

                                <button 
                                    onClick={handleNextPage} 
                                    disabled={page === totalPages}
                                    className="pagination-arrow-btn"
                                    title="Página Siguiente"
                                >
                                    <ArrowRightIcon />
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
