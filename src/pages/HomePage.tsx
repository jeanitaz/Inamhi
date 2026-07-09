import { Link } from 'react-router-dom';
import '../styles/HomeInamhi.css';
import logoInamhi from '../assets/lgo.png';

const TicketIcon = () => (
    <svg className="action-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="12" y1="18" x2="8" y2="18" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
);

const SearchIcon = () => (
    <svg className="action-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

const AdminIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);

const HomePage = () => {
    return (
        <div className="inamhi-home-container">
            {/* Ambient Background Glow Orbs */}
            <div className="bg-glow-orb orb-1"></div>
            <div className="bg-glow-orb orb-2"></div>
            <div className="bg-glow-orb orb-3"></div>

            {/* Top Header / Nav */}
            <header className="home-top-nav animate-fade-in">
                <div className="nav-logo-group">
                    <img src={logoInamhi} alt="INAMHI" className="nav-logo-img" />
                </div>
                <Link to="/login" className="btn-admin-nav">
                    <AdminIcon />
                    <span>Acceso Administrativo</span>
                </Link>
            </header>

            {/* Main Content Area */}
            <main className="home-main-content animate-entry">
                <div className="home-hero-section">
                    <div className="status-badge">
                        <span className="pulse-dot"></span>
                        <span>Plataforma de Soporte Técnico Activa</span>
                    </div>
                    <h1 className="home-main-title">
                        ¿Cómo podemos ayudarte hoy?
                    </h1>
                    <p className="home-description">
                        Plataforma institucional para la gestión de requerimientos tecnológicos, asegurando la continuidad de nuestros servicios.”
                    </p>
                </div>

                {/* Grid of Interactive Actions */}
                <div className="home-actions-grid">
                    <Link to="/formulario" className="action-card card-blue">
                        <div className="action-card-header">
                            <div className="icon-container">
                                <TicketIcon />
                            </div>
                            <span className="action-card-arrow">&rarr;</span>
                        </div>
                        <div className="action-card-body">
                            <h3>Crear Nuevo Ticket</h3>
                            <p>Registra un requerimiento de soporte técnico para hardware, software, red u otros servicios.</p>
                        </div>
                        <div className="card-shine"></div>
                    </Link>

                    <Link to="/registro" className="action-card card-cyan">
                        <div className="action-card-header">
                            <div className="icon-container">
                                <SearchIcon />
                            </div>
                            <span className="action-card-arrow">&rarr;</span>
                        </div>
                        <div className="action-card-body">
                            <h3>Consultar Estado</h3>
                            <p>Realiza el seguimiento de tus solicitudes y revisa el progreso en tiempo real de tus incidencias.</p>
                        </div>
                        <div className="card-shine"></div>
                    </Link>
                </div>
            </main>

            {/* Footer */}
            <footer className="home-footer animate-fade-in">
                <p>&copy; {new Date().getFullYear()} Instituto Nacional de Meteorología e Hidrología. Todos los derechos reservados.</p>
            </footer>
        </div>
    );
};

export default HomePage;