import { Link } from 'react-router-dom';
import '../styles/HomeInamhi.css'; // Usaremos un archivo CSS específico
import logoInamhi from '../assets/lgo.png';

const HomePage = () => {
    return (
        <div className="inamhi-home-container">
            {/* Elementos de fondo para la animación */}
            <div className="weather-bg-animation"></div>
            <div className="particles">
                <span></span><span></span><span></span><span></span><span></span>
                <span></span><span></span><span></span><span></span><span></span>
            </div>

            {/* Contenido Principal (Efecto Cristal) */}
            <div className="glass-card animate-entry">
                
                <div className="logo-area">
                    <div className="logo-glow">
                        <img src={logoInamhi} alt="Logo INAMHI" className="main-logo" />
                    </div>
                </div>

                <div className="text-content">
                    <h1 className="main-title">
                        Sistema de Soporte Técnico
                    </h1>
                    <h2 className="sub-title">INAMHI</h2>
                    
                    <p className="description">
                        Plataforma institucional para la gestión ágil de requerimientos tecnológicos, 
                        asegurando la continuidad de nuestros servicios meteorológicos e hidrológicos.
                    </p>

                    <div className="action-buttons">
                        <Link to="/formulario" className="btn-primary-glow">
                            <span className="btn-icon">📝</span> INGRESO DE SOLICITUD
                        </Link>
                        <Link to="/registro" className="btn-primary-glow">
                            <span className="btn-icon">📝</span> CONSULTA DE SOLICITUD
                        </Link>
                        <Link to="/login" className="btn-secondary-ghost">
                            Acceso Administrativo &rarr;
                        </Link>
                    </div>
                </div>
            </div>

            <footer className="simple-footer">
                <p>&copy; {new Date().getFullYear()} Instituto Nacional de Meteorología e Hidrología</p>
            </footer>
        </div>
    );
};

export default HomePage;