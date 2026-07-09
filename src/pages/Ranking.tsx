import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { API_BASE_URL as API_BASE_URL_CONFIG } from '../config';
import '../styles/Ranking.css';
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

const TrophyIcon = ({ place }: { place: 1 | 2 | 3 }) => {
    const color = place === 1 ? '#eab308' : place === 2 ? '#94a3b8' : '#cd7f32';
    return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="trophy-bounce">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
            <path d="M4 22h16" />
            <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34" />
            <path d="M12 2a7 7 0 0 0-7 7v4a7 7 0 0 0 14 0V9a7 7 0 0 0-7-7z" />
        </svg>
    );
};

interface TechRanking {
    name: string;
    role: string;
    averageRating: string | number;
    ratedTicketsCount: number;
    resolvedTicketsCount: number;
}

export default function Ranking() {
    const API_BASE_URL = API_BASE_URL_CONFIG;

    const [ranking, setRanking] = useState<TechRanking[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingPdf, setLoadingPdf] = useState(false);
    const [filterType, setFilterType] = useState('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const reportRef = useRef<HTMLDivElement>(null);

    const handleExportPDF = async () => {
        const element = reportRef.current;
        if (!element) return;

        setLoadingPdf(true);
        try {
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4'); // Portrait A4

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save('Ranking_Desempeno_Soporte.pdf');
        } catch (error) {
            console.error("Error al exportar ranking PDF", error);
            alert("Ocurrió un error al generar el PDF.");
        }
        setLoadingPdf(false);
    };

    const loadData = async (fType = filterType, sDate = startDate, eDate = endDate) => {
        setLoading(true);
        try {
            let url = `${API_BASE_URL}/api/valoraciones/ranking?filterType=${fType}`;
            if (fType === 'custom' && sDate && eDate) {
                url += `&startDate=${sDate}&endDate=${eDate}`;
            }
            const rankingRes = await fetch(url);

            if (rankingRes.ok) {
                const data = await rankingRes.json();
                setRanking(data);
            }
        } catch (err) {
            console.error("Error al cargar datos de ranking:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (filterType !== 'custom') {
            loadData(filterType, startDate, endDate);
        }
    }, [filterType]);

    const handleApplyCustomFilter = () => {
        if (!startDate || !endDate) {
            alert("Por favor seleccione fecha de inicio y fin.");
            return;
        }
        loadData('custom', startDate, endDate);
    };

    // Separar top 3 del resto
    const top3 = ranking.slice(0, 3);
    const rest = ranking.slice(3);

    // Reordenar top 3 para el podio visual (2do, 1ro, 3ro)
    const podiumOrder = [];
    if (top3[1]) podiumOrder.push({ ...top3[1], place: 2 });
    if (top3[0]) podiumOrder.push({ ...top3[0], place: 1 });
    if (top3[2]) podiumOrder.push({ ...top3[2], place: 3 });

    return (
        <div className="ranking-layout">
            <div className="ranking-bg-stars"></div>
            <div className="ranking-bg-glow"></div>

            <div className="ranking-container animate-enter">
                <header className="ranking-header" style={{ justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                        <div className="header-brand">
                            <Link to="/admin" className="btn-back-circle" title="Volver al Panel de Control">
                                <BackIcon />
                            </Link>
                            <img src={logoInamhi} alt="INAMHI" className="brand-logo" />
                        </div>
                        <div className="header-title-container">
                            <h1 className="ranking-title">Ranking de Calificaciones</h1>
                            <p className="ranking-subtitle">Rendimiento y Feedback de Técnicos y Pasantes</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        <Link
                            to="/opiniones"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '10px 20px',
                                background: 'rgba(30, 41, 59, 0.6)',
                                color: '#ffffff',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '10px',
                                fontWeight: '600',
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                textDecoration: 'none'
                            }}
                            className="btn-opiniones"
                        >
                            <span>💬</span> Ver Opiniones
                        </Link>

                        <button
                            onClick={handleExportPDF}
                            disabled={loadingPdf || ranking.length === 0}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '10px 20px',
                                background: '#2563eb',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '10px',
                                fontWeight: '600',
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
                                transition: 'all 0.2s',
                                opacity: loadingPdf ? 0.7 : 1
                            }}
                            className="btn-export-pdf"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                            {loadingPdf ? 'Generando PDF...' : 'Exportar Reporte PDF'}
                        </button>
                    </div>
                </header>

                {/* BARRA DE FILTROS TEMPORALES */}
                <div className="filter-bar-panel glass-panel animate-enter" style={{ marginBottom: '2rem' }}>
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
                        <p>Cargando información del ranking...</p>
                    </div>
                ) : (
                    <div className="ranking-grid-single">
                        {/* SECCIÓN PODIO Y TABLA */}
                        <div className="ranking-main-col">
                            {/* PODIO VISUAL */}
                            {top3.length > 0 && (
                                <div className="podium-section ranking-panel">
                                    <h2 className="section-title">🏆 Cuadro de Honor</h2>
                                    <div className="podium-container">
                                        {podiumOrder.map((tech) => (
                                            <div key={tech.name} className={`podium-card place-${tech.place}`}>
                                                <div className="trophy-wrapper">
                                                    <TrophyIcon place={tech.place as 1 | 2 | 3} />
                                                </div>
                                                <div className="avatar-circle">
                                                    {tech.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                                                </div>
                                                <div className="podium-info">
                                                    <h3 className="tech-name">{tech.name}</h3>
                                                    <span className="tech-role">{tech.role}</span>
                                                    <div className="tech-stars">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <StarIcon key={star} filled={Number(tech.averageRating) >= star} />
                                                        ))}
                                                    </div>
                                                    <span className="tech-avg-text">
                                                        {Number(tech.averageRating).toFixed(1)} / 5.0
                                                    </span>
                                                    <div className="tech-kpis">
                                                        <div className="kpi-mini">
                                                            <span className="kpi-val">{tech.resolvedTicketsCount}</span>
                                                            <span className="kpi-lbl">Resueltos</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="podium-step">
                                                    <span className="place-number">{tech.place}°</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* TABLA DE LEADERBOARD COMPLETO */}
                            <div className="leaderboard-section ranking-panel">
                                <h2 className="section-title">📋 Ranking General</h2>
                                <div className="table-responsive">
                                    <table className="ranking-table">
                                        <thead>
                                            <tr>
                                                <th>Puesto</th>
                                                <th>Nombre</th>
                                                <th>Rol</th>
                                                <th>Promedio</th>
                                                <th>Calificaciones</th>
                                                <th>Tickets Resueltos</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {ranking.map((tech, idx) => (
                                                <tr key={tech.name} className={idx < 3 ? `row-top-${idx + 1}` : ''}>
                                                    <td className="col-position">
                                                        <span className={`pos-badge ${idx < 3 ? `top-${idx + 1}` : ''}`}>
                                                            {idx + 1}
                                                        </span>
                                                    </td>
                                                    <td className="col-name">
                                                        <div className="name-wrapper">
                                                            <div className="table-avatar">
                                                                {tech.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                                                            </div>
                                                            <span className="name-text">{tech.name}</span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className={`role-badge ${tech.role.toLowerCase()}`}>
                                                            {tech.role}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="rating-progress-wrapper">
                                                            <div className="stars-mini">
                                                                {[1, 2, 3, 4, 5].map((star) => (
                                                                    <StarIcon key={star} filled={Number(tech.averageRating) >= star} />
                                                                ))}
                                                            </div>
                                                            <span className="avg-value">{Number(tech.averageRating).toFixed(1)}</span>
                                                        </div>
                                                    </td>
                                                    <td className="text-center font-semibold">{tech.ratedTicketsCount}</td>
                                                    <td className="text-center font-semibold">{tech.resolvedTicketsCount}</td>
                                                </tr>
                                            ))}
                                            {ranking.length === 0 && (
                                                <tr>
                                                    <td colSpan={6} className="text-center py-4">No hay datos de técnicos disponibles.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Elemento oculto estructurado con un diseño ejecutivo impecable para la generación de PDF */}
            <div 
                ref={reportRef} 
                style={{
                    position: 'absolute',
                    left: '-9999px',
                    top: '-9999px',
                    width: '800px',
                    backgroundColor: '#ffffff',
                    color: '#0f172a',
                    padding: '40px',
                    fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
                }}
            >
                {/* Cabecera del PDF */}
                <div style={{ display: 'flex', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '20px', marginBottom: '30px' }}>
                    <img src={logoInamhi} alt="INAMHI Logo" style={{ height: '60px', marginRight: '20px' }} />
                    <div>
                        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#1e3a8a', letterSpacing: '0.5px' }}>
                            INSTITUTO NACIONAL DE METEOROLOGÍA E HIDROLOGÍA
                        </h1>
                        <h2 style={{ margin: '4px 0 0 0', fontSize: '13px', fontWeight: '600', color: '#475569' }}>
                            Reporte de Rendimiento y Ranking de Soporte Técnico (TICS)
                        </h2>
                    </div>
                </div>

                {/* Fecha y Metadatos */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginBottom: '25px' }}>
                    <div>
                        <span>Generado el: {new Date().toLocaleString('es-EC')}</span>
                        <br />
                        <span style={{ fontWeight: '600', color: '#334155' }}>
                            Período: {
                                filterType === 'all' ? 'Todo el tiempo' :
                                filterType === 'day' ? 'Hoy' :
                                filterType === 'week' ? 'Últimos 7 días' :
                                filterType === 'month' ? 'Últimos 30 días' :
                                filterType === 'year' ? 'Últimos 365 días' :
                                `Rango personalizado (${startDate} al ${endDate})`
                            }
                        </span>
                    </div>
                    <span>Total Técnicos Evaluados: {ranking.length}</span>
                </div>

                {/* PODIO VISUAL en el PDF */}
                {top3.length > 0 && (
                    <div style={{ marginBottom: '40px' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#1e3a8a', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px', marginBottom: '15px' }}>
                            🏆 Cuadro de Honor (Top 3)
                        </h3>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '20px', padding: '15px 0' }}>
                            
                            {/* 2do Lugar */}
                            {top3[1] && (
                                <div style={{ 
                                    flex: 1, 
                                    backgroundColor: '#f8fafc', 
                                    border: '1px solid #cbd5e1', 
                                    borderRadius: '12px', 
                                    padding: '16px', 
                                    textAlign: 'center',
                                    height: '220px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between'
                                }}>
                                    <div>
                                        <div style={{ fontSize: '24px', marginBottom: '4px' }}>🥈</div>
                                        <h4 style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: 'bold', color: '#334155', lineHeight: '1.2' }}>{top3[1].name}</h4>
                                        <span style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>{top3[1].role}</span>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#475569', margin: '8px 0 4px 0' }}>
                                            {Number(top3[1].averageRating).toFixed(1)} / 5.0 ⭐
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 1er Lugar */}
                            {top3[0] && (
                                <div style={{ 
                                    flex: 1.1, 
                                    backgroundColor: '#fffdf5', 
                                    border: '2px solid #fbbf24', 
                                    borderRadius: '12px', 
                                    padding: '20px 16px', 
                                    textAlign: 'center',
                                    height: '250px',
                                    boxShadow: '0 4px 10px rgba(251, 191, 36, 0.1)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between'
                                }}>
                                    <div>
                                        <div style={{ fontSize: '32px', marginBottom: '4px' }}>🥇</div>
                                        <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 'bold', color: '#b45309', lineHeight: '1.2' }}>{top3[0].name}</h4>
                                        <span style={{ fontSize: '10px', color: '#78350f', textTransform: 'uppercase', fontWeight: '600' }}>{top3[0].role}</span>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#d97706', margin: '8px 0 4px 0' }}>
                                            {Number(top3[0].averageRating).toFixed(1)} / 5.0 ⭐
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 3er Lugar */}
                            {top3[2] && (
                                <div style={{ 
                                    flex: 1, 
                                    backgroundColor: '#fcf8f5', 
                                    border: '1px solid #edcbb7', 
                                    borderRadius: '12px', 
                                    padding: '16px', 
                                    textAlign: 'center',
                                    height: '200px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between'
                                }}>
                                    <div>
                                        <div style={{ fontSize: '24px', marginBottom: '4px' }}>🥉</div>
                                        <h4 style={{ margin: '0 0 4px 0', fontSize: '12px', fontWeight: 'bold', color: '#431407', lineHeight: '1.2' }}>{top3[2].name}</h4>
                                        <span style={{ fontSize: '10px', color: '#9a3412', textTransform: 'uppercase' }}>{top3[2].role}</span>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '17px', fontWeight: 'bold', color: '#b45309', margin: '8px 0 4px 0' }}>
                                            {Number(top3[2].averageRating).toFixed(1)} / 5.0 ⭐
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                )}

                {/* TABLA RANKING GENERAL */}
                <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#1e3a8a', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px', marginBottom: '15px' }}>
                        📋 Ranking General de Personal
                    </h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>
                                <th style={{ padding: '10px 8px', fontWeight: 'bold', color: '#475569', width: '60px' }}>Puesto</th>
                                <th style={{ padding: '10px 8px', fontWeight: 'bold', color: '#475569' }}>Nombre Completo</th>
                                <th style={{ padding: '10px 8px', fontWeight: 'bold', color: '#475569', width: '120px' }}>Rol</th>
                                <th style={{ padding: '10px 8px', fontWeight: 'bold', color: '#475569', textAlign: 'center', width: '90px' }}>Promedio</th>
                                <th style={{ padding: '10px 8px', fontWeight: 'bold', color: '#475569', textAlign: 'center', width: '90px' }}>Calificaciones</th>
                                <th style={{ padding: '10px 8px', fontWeight: 'bold', color: '#475569', textAlign: 'center', width: '110px' }}>Tickets Resueltos</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ranking.map((tech, idx) => (
                                <tr key={tech.name} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                                    <td style={{ padding: '10px 8px', fontWeight: 'bold', color: idx < 3 ? '#b45309' : '#64748b' }}>
                                        {idx < 3 ? `🏆 ${idx + 1}` : `${idx + 1}`}
                                    </td>
                                    <td style={{ padding: '10px 8px', fontWeight: '600', color: '#1e293b' }}>
                                        {tech.name}
                                    </td>
                                    <td style={{ padding: '10px 8px', color: '#475569', textTransform: 'uppercase', fontSize: '10px', fontWeight: '600' }}>
                                        {tech.role}
                                    </td>
                                    <td style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 'bold', color: '#b45309' }}>
                                        {Number(tech.averageRating).toFixed(1)} / 5.0 ⭐
                                    </td>
                                    <td style={{ padding: '10px 8px', textAlign: 'center', color: '#334155', fontWeight: '600' }}>
                                        {tech.ratedTicketsCount}
                                    </td>
                                    <td style={{ padding: '10px 8px', textAlign: 'center', color: '#334155', fontWeight: '600' }}>
                                        {tech.resolvedTicketsCount}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pie de página del Reporte */}
                <div style={{ marginTop: '40px', paddingTop: '15px', borderTop: '1px solid #e2e8f0', textAlign: 'center', fontSize: '9px', color: '#94a3b8' }}>
                    Instituto Nacional de Meteorología e Hidrología - Inamhi | TICS © 2026. Todos los derechos reservados.
                </div>
            </div>
        </div>
    );
}
