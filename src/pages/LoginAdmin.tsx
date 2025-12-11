import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/LoginAdmin.css';
import logoInamhi from '../assets/lgo.png';

// --- ICONOS SVG (Se mantienen igual) ---
const AdminIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" /><path d="M12 6v6l4 2" /></svg>
);
const TechIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>
);
const BackIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></svg>
);

// 1. CONFIGURACIÓN DE CREDENCIALES DE ADMIN
const ADMIN_CREDENTIALS = {
    email: "admin@inamhi.gob.ec",
    password: "admin"
};

type Role = 'admin' | 'tecnico';

const LoginAdmin = () => {
    const [role, setRole] = useState<Role>('admin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // =========================================================
        // ESCENARIO 1: LOGIN DE ADMINISTRADOR (LOCAL / HARDCODED)
        // =========================================================
        if (role === 'admin') {
            // Simulamos un pequeño delay para que la UX se sienta natural
            setTimeout(() => {
                if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
                    // Credenciales correctas
                    localStorage.setItem('token', 'TOKEN-MASTER-ADMIN');
                    localStorage.setItem('role', 'admin');
                    localStorage.setItem('userName', 'Administrador Principal');
                    localStorage.setItem('userEmail', email);

                    navigate('/admin');
                } else {
                    // Credenciales incorrectas
                    setError('Credenciales de Administrador incorrectas');
                    setLoading(false);
                }
            }, 800); // 0.8 segundos de espera simulada

            return; // DETENEMOS AQUÍ: No ejecutamos la llamada a la API
        }

        // =========================================================
        // ESCENARIO 2: LOGIN DE TÉCNICO (API / BASE DE DATOS)
        // =========================================================

        // Mapeo para la base de datos (tu backend espera 'Tecnico' con mayúscula)
        const dbRole = 'Tecnico';

        try {
            const response = await fetch('http://10.0.153.73:3001/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email,
                    password: password,
                    rol: dbRole
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Login Técnico Exitoso
                localStorage.setItem('token', 'token-tecnico-valido');
                localStorage.setItem('role', 'tecnico');
                localStorage.setItem('userName', data.user.name);
                localStorage.setItem('userEmail', data.user.email);

                navigate('/tecnico');
            } else {
                // Error desde el backend
                setError(data.message || 'Credenciales inválidas');
            }

        } catch (err) {
            console.error(err);
            setError('Error de conexión con el servidor.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`login-universe ${role}`}>
            <div className="stars"></div>
            <div className="twinkling"></div>

            <div className="glass-panel animate-pop-in">

                <div className="panel-navigation">
                    <Link to="/" className="btn-back">
                        <BackIcon /> <span>Volver al Inicio</span>
                    </Link>
                </div>

                <div className="panel-header">
                    <div className="logo-badge">
                        <img src={logoInamhi} alt="Logo INAMHI" />
                    </div>
                    <h2>Portal de Servicios</h2>
                    <p>Seleccione su perfil para continuar</p>
                </div>

                {/* Selector de Roles */}
                <div className="role-cards">
                    <div
                        className={`role-card ${role === 'tecnico' ? 'active' : ''}`}
                        onClick={() => { setRole('tecnico'); setError(''); }}
                    >
                        <div className="icon-box"><TechIcon /></div>
                        <span>Técnico</span>
                    </div>
                    <div
                        className={`role-card ${role === 'admin' ? 'active' : ''}`}
                        onClick={() => { setRole('admin'); setError(''); }}
                    >
                        <div className="icon-box"><AdminIcon /></div>
                        <span>Admin</span>
                    </div>
                </div>

                <form onSubmit={handleLogin} className="login-form">
                    <div className="input-field">
                        <input
                            type="email"
                            placeholder=" "
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <label>Correo Institucional</label>
                    </div>

                    <div className="input-field">
                        <input
                            type="password"
                            placeholder=" "
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <label>Contraseña</label>
                    </div>

                    {error && <div className="error-pill">⚠️ {error}</div>}

                    <button type="submit" className="btn-glow" disabled={loading}>
                        {loading ? 'Verificando...' : 'Iniciar Sesión'}
                    </button>
                </form>

                <div className="panel-footer">
                    <p>Soporte Técnico &copy; 2025</p>
                </div>
            </div>
        </div>
    );
};

export default LoginAdmin;