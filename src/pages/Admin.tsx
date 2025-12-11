import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Reloj from "../components/reloj"; // <--- IMPORTACIÓN ACTIVADA
import logoInamhi from '../assets/lgo.png';
import "../styles/Admin.css";

// Definimos la interfaz del Ticket básico que devuelve la API
interface Ticket {
    id: string;
    status: string;
    // ... otros campos
}

// Interfaz para las Props de las tarjetas
interface StatusCardProps {
    title: string;
    icon: React.ReactNode;
    status: string;
    count?: number;
}

const StatusCard = ({ title, icon, status, count = 0 }: StatusCardProps) => {
    return (
        <div className={`kpi-card ${status}`}>
            <div className="kpi-icon-wrapper">
                {icon}
            </div>
            <div className="kpi-info">
                <span className="kpi-count">{count}</span>
                <span className="kpi-title">{title}</span>
            </div>
            <div className="kpi-glow"></div>
        </div>
    );
};

export default function Admin() {
    const navigate = useNavigate();

    // 1. ESTADO: Iniciamos con array vacío
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);

    // 2. ESTADO DE MÉTRICAS (Contadores)
    const [metrics, setMetrics] = useState({
        pendientes: 0,
        enProceso: 0,
        resueltos: 0,
        total: 0,
        eficacia: 0
    });

    // 3. CARGAR DATOS REALES AL INICIO
    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const response = await fetch('http://10.0.153.73:3001/api/tickets');
                if (response.ok) {
                    const data = await response.json();
                    setTickets(data); // Guardamos todos los tickets
                }
            } catch (error) {
                console.error("Error al cargar métricas:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMetrics();
    }, []);

    // 4. CALCULAR MÉTRICAS AUTOMÁTICAMENTE
    useEffect(() => {
        if (tickets.length > 0 || !loading) {
            const pendientes = tickets.filter(t => (t.status || "").toLowerCase() === "pendiente").length;
            const enProceso = tickets.filter(t => (t.status || "").toLowerCase() === "en proceso").length;
            const resueltos = tickets.filter(t => (t.status || "").toLowerCase() === "resuelto").length;
            const total = tickets.length;

            const eficaciaCalculada = total > 0 ? Math.round((resueltos / total) * 100) : 0;

            setMetrics({
                pendientes,
                enProceso,
                resueltos,
                total,
                eficacia: eficaciaCalculada
            });
        }
    }, [tickets, loading]);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

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
                        <span className="nav-label">Principal</span>
                        <button className="nav-item active">
                            <span className="icon">📊</span> Inicio
                        </button>
                        <button className="nav-item" onClick={() => navigate('/reportes')}>
                            <span className="icon">📈</span> Estadísticas
                        </button>
                    </div>

                    <div className="nav-group">
                        <span className="nav-label">Gestión</span>
                        <button className="nav-item" onClick={() => navigate('/listado')}>
                            <span className="icon">📝</span> Historial Tickets
                        </button>
                        <button className="nav-item" onClick={() => navigate('/usuarios')}>
                            <span className="icon">👥</span> Usuarios
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
                        <div className="user-avatar">AD</div>
                        <div className="user-info">
                            <span className="name">Admin</span>
                            <span className="role">Soporte</span>
                        </div>
                    </div>
                </div>
            </aside>

            <main className="admin-content">
                <header className="content-header">
                    <div className="header-titles">
                        <h1>Panel de Control</h1>
                        <p>Visión general del sistema de soporte</p>
                    </div>
                    <div className="header-actions">
                        {/* --- RELOJ INTEGRADO AQUÍ --- */}
                        <div className="clock-wrapper">
                            <Reloj />
                        </div>
                    </div>
                </header>

                <div className="dashboard-grid">

                    {/* Tarjeta de Bienvenida */}
                    <div className="hero-card glass-panel">
                        <div className="hero-text">
                            <h2>¡Hola de nuevo! 👋</h2>
                            <p>
                                Tienes <strong>{metrics.pendientes} tickets pendientes</strong> que requieren atención hoy.
                                {metrics.pendientes > 0 ? " Prioriza estos casos." : " ¡Todo al día!"}
                            </p>
                            <button onClick={() => navigate('/listado')} className="btn-neon">
                                Ver Historial Completo
                            </button>
                        </div>
                        <div className="hero-visual">
                            <div className="pulse-circle"></div>
                        </div>
                    </div>

                    {/* --- KPIS --- */}
                    <div className="kpi-section">
                        <StatusCard
                            title="Resueltos"
                            icon="✅"
                            status="success"
                            count={metrics.resueltos}
                        />
                        <StatusCard
                            title="En Proceso"
                            icon="⚙️"
                            status="info"
                            count={metrics.enProceso}
                        />
                        <StatusCard
                            title="Pendientes"
                            icon="⏳"
                            status="warning"
                            count={metrics.pendientes}
                        />
                        <StatusCard
                            title="Total Tickets"
                            icon="📁"
                            status="primary"
                            count={metrics.total}
                        />
                    </div>

                    {/* Gráfico Estático */}
                    <div className="chart-card glass-panel span-2">
                        <div className="card-header">
                            <h3>Actividad Reciente</h3>
                        </div>
                        <div className="chart-area">
                            <div className="fake-chart-bars">
                                <div className="bar" style={{ height: '40%' }}></div>
                                <div className="bar" style={{ height: '70%' }}></div>
                                <div className="bar active" style={{ height: '55%' }}></div>
                                <div className="bar" style={{ height: '85%' }}></div>
                                <div className="bar" style={{ height: '60%' }}></div>
                                <div className="bar" style={{ height: '45%' }}></div>
                                <div className="bar" style={{ height: '90%' }}></div>
                            </div>
                            <div className="chart-label">Tickets generados últimos 7 días</div>
                        </div>
                    </div>

                    {/* Eficacia Dinámica */}
                    <div className="stat-card glass-panel">
                        <h3>Eficacia de Resolución</h3>
                        <div className="circular-progress">
                            <svg viewBox="0 0 36 36" className="circular-chart">
                                <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                <path
                                    className="circle"
                                    strokeDasharray={`${metrics.eficacia}, 100`}
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                            </svg>
                            <div className="percentage">{metrics.eficacia}%</div>
                        </div>
                        <p className="stat-detail">
                            {metrics.eficacia > 70 ? "Buen ritmo de resolución" : "Se requiere atención"}
                        </p>
                    </div>

                </div>
            </main>
        </div>
    );
}