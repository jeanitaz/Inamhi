import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/CreUsuarios.css';

interface Usuario {
    id: number;
    nombre: string;
    email: string;
    rol: string;
    password?: string;
}

const CreacionUsuarios = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    
    // --- ESTADOS ---
    const [listaUsuarios, setListaUsuarios] = useState<Usuario[]>([]);
    const [filterRole, setFilterRole] = useState('Todos');
    const [loadingList, setLoadingList] = useState(true);
    
    const [visiblePasswords, setVisiblePasswords] = useState<{ [key: number]: boolean }>({});

    const INITIAL_FORM_STATE = {
        nombre: '',
        email: '',
        password: '',
        rol: 'Tecnico',
        departamento: 'TICS'
    };

    const [formData, setFormData] = useState(INITIAL_FORM_STATE);
    const [showPassword, setShowPassword] = useState(false);

    // =================================================================
    // 1. IP DEL SERVIDOR (IMPORTANTE: CAMBIADO DE LOCALHOST A IP REAL)
    // =================================================================
    const API_URL = 'http://10.0.153.73:3001/api/usuarios';

    // --- CARGAR USUARIOS ---
    useEffect(() => {
        fetchUsuarios();
    }, []);

    const fetchUsuarios = async () => {
        try {
            // Usamos la IP del servidor
            const response = await fetch(API_URL);
            if (response.ok) {
                const data = await response.json();
                setListaUsuarios(data);
            }
        } catch (error) {
            console.error("Error cargando usuarios:", error);
            alert("No se pudo conectar al servidor 10.0.153.73. Revisa si estás conectado a la VPN/Red.");
        } finally {
            setLoadingList(false);
        }
    };

    // --- ELIMINAR USUARIO ---
    const handleDelete = async (id: number) => {
        if (!window.confirm("¿Estás seguro de eliminar este usuario?")) return;
        try {
            const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            if (response.ok) {
                setListaUsuarios(prev => prev.filter(user => user.id !== id));
            } else {
                alert("Error al eliminar.");
            }
        } catch (error) {
            console.error(error);
        }
    };

    // --- TOGGLE VER PASSWORD ---
    const togglePasswordVisibility = (id: number) => {
        setVisiblePasswords(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    // --- FORMULARIO HANDLERS ---
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!formData.nombre || !formData.email || !formData.password) {
            alert("Completa los campos requeridos");
            return;
        }
        setIsLoading(true);
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (response.ok) {
                setShowSuccessModal(true);
                setFormData(INITIAL_FORM_STATE);
                fetchUsuarios(); // Recargar la lista del servidor
            } else {
                const data = await response.json();
                alert("Error: " + (data.message || "No se pudo crear"));
            }
        } catch (error) {
            console.error(error);
            alert("Error de conexión con el servidor 10.0.153.73");
        } finally {
            setIsLoading(false);
        }
    };

    // --- FILTRADO ---
    const filteredUsers = listaUsuarios.filter(user => {
        const userRole = (user.rol || '').toLowerCase();
        if (userRole.includes('admin')) return false;
        if (filterRole === 'Todos') return true;
        return userRole === filterRole.toLowerCase();
    });

    return (
        <div className="admin-layout">
            <div className="admin-bg-stars"></div>
            <div className="admin-bg-glow"></div>

            <main className="admin-content" style={{ paddingBottom: '4rem' }}>
                <header className="content-header">
                    <div className="header-titles">
                        <h1>Gestión de Usuarios</h1>
                        <p>Crear nueva credencial de acceso</p>
                    </div>
                    <button className="btn-back" onClick={() => navigate(-1)}>⬅ Volver</button>
                </header>

                <div className="creation-grid">
                    {/* IZQUIERDA: FORMULARIO */}
                    <div className="form-column">
                        <div className="glass-form-card">
                            <div className="form-header">
                                <div className="icon-circle">👤</div>
                                <h2>Registrar Nuevo</h2>
                            </div>
                            <form onSubmit={handleSubmit} className="cyber-form">
                                <div className="form-group">
                                    <label>Nombre Completo</label>
                                    <div className="input-wrapper">
                                        <span className="input-icon">Aa</span>
                                        <input type="text" name="nombre" placeholder="Nombre completo" value={formData.nombre} onChange={handleChange} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <div className="input-wrapper">
                                        <span className="input-icon">@</span>
                                        <input type="email" name="email" placeholder="correo@inamhi.gob.ec" value={formData.email} onChange={handleChange} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Contraseña</label>
                                    <div className="input-wrapper">
                                        <span className="input-icon">🔒</span>
                                        <input type={showPassword ? "text" : "password"} name="password" placeholder="******" value={formData.password} onChange={handleChange} />
                                        <button type="button" className="toggle-pass" onClick={() => setShowPassword(!showPassword)}>{showPassword ? "🙈" : "👁️"}</button>
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group half">
                                        <label>Rol</label>
                                        <select name="rol" value={formData.rol} onChange={handleChange}>
                                            <option value="Tecnico">Técnico</option>
                                            <option value="Pasante">Pasante</option>
                                        </select>
                                    </div>
                                    <div className="form-group half">
                                        <label>Departamento</label>
                                        <select name="departamento" value={formData.departamento} onChange={handleChange}>
                                            <option value="TICS">TICS</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-actions">
                                    <button type="submit" className="btn-neon-primary full-width" disabled={isLoading}>
                                        {isLoading ? 'Guardando...' : 'Crear Usuario'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* DERECHA: TARJETAS INFORMATIVAS */}
                    <div className="info-column">
                        <div className="info-card" style={{ background: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px', marginBottom: '15px' }}>Resumen de Personal</h3>
                            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#fff', display: 'block' }}>
                                        {listaUsuarios.filter(u => (u.rol || '').toLowerCase() === 'tecnico').length}
                                    </span>
                                    <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Técnicos</span>
                                </div>
                                <div style={{ height: '40px', width: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                                <div style={{ textAlign: 'center' }}>
                                    <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#fff', display: 'block' }}>
                                        {listaUsuarios.filter(u => (u.rol || '').toLowerCase() === 'pasante').length}
                                    </span>
                                    <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Pasantes</span>
                                </div>
                            </div>
                        </div>

                        <div className="info-card warning-card">
                            <div className="card-icon">⚠️</div>
                            <h3>Políticas de Correo</h3>
                            <p>Recuerda que el correo institucional debe tener el formato usuario@inamhi.gob.ec.</p>
                        </div>

                        <div className="info-card info-blue">
                            <div className="card-icon">ℹ️</div>
                            <h3>Roles de Acceso</h3>
                            <ul className="info-list">
                                <li><strong>Técnico:</strong> Acceso completo a gestión de tickets y reportes.</li>
                                <li><strong>Pasante:</strong> Acceso limitado a asignación y visualización.</li>
                            </ul>
                        </div>

                        <div className="info-card success-card">
                            <div className="card-icon">📢</div>
                            <h3>Recordatorio del Admin</h3>
                            <p>Solo el Admin puede crear usuarios ya sea tanto para tecnicos y pasantes.</p>
                        </div>
                    </div>
                </div>

                {/* --- SECCIÓN INFERIOR: LISTADO DE USUARIOS --- */}
                <div className="users-list-section" style={{ marginTop: '3rem' }}>
                    <div className="list-header-row">
                        <h2 className="section-title">📂 Personal Registrado (Servidor)</h2>
                        <div className="filter-tabs">
                            <button className={`filter-tab ${filterRole === 'Todos' ? 'active' : ''}`} onClick={() => setFilterRole('Todos')}>Todos</button>
                            <button className={`filter-tab ${filterRole === 'Tecnico' ? 'active' : ''}`} onClick={() => setFilterRole('Tecnico')}>🛠️ Técnicos</button>
                            <button className={`filter-tab ${filterRole === 'Pasante' ? 'active' : ''}`} onClick={() => setFilterRole('Pasante')}>🎓 Pasantes</button>
                        </div>
                    </div>

                    {loadingList ? (
                        <p style={{color: 'white', textAlign: 'center'}}>Cargando usuarios del servidor...</p>
                    ) : (
                        <div className="users-grid">
                            {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                                <div key={user.id} className="user-card-glass">
                                    <div className="user-card-header">
                                        <div className="user-avatar">
                                            {user.nombre ? user.nombre.charAt(0).toUpperCase() : 'U'}
                                        </div>
                                        <span className={`role-badge role-${(user.rol || '').toLowerCase()}`}>
                                            {user.rol}
                                        </span>
                                    </div>
                                    <div className="user-card-body">
                                        <h4>{user.nombre}</h4>
                                        <p>{user.email}</p>
                                        
                                        {/* --- MOSTRAR CONTRASEÑA --- */}
                                        <div style={{ 
                                            background: 'rgba(0,0,0,0.3)', 
                                            padding: '8px', 
                                            borderRadius: '8px', 
                                            marginTop: '10px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            fontSize: '0.85rem'
                                        }}>
                                            <span style={{ color: '#ccc', fontFamily: 'monospace' }}>
                                                {visiblePasswords[user.id] ? user.password || '******' : '••••••••'}
                                            </span>
                                            <button 
                                                onClick={() => togglePasswordVisibility(user.id)}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', fontSize: '1.2rem', padding: '0 5px' }}
                                                title={visiblePasswords[user.id] ? "Ocultar" : "Mostrar"}
                                            >
                                                {visiblePasswords[user.id] ? '🙈' : '👁️'}
                                            </button>
                                        </div>

                                    </div>
                                    <div className="user-card-footer">
                                        <button 
                                            className="btn-icon delete" 
                                            onClick={() => handleDelete(user.id)}
                                            style={{ width: '100%', color: '#ff4757', background: 'rgba(255, 71, 87, 0.1)' }}
                                        >
                                            🗑️ Eliminar
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2rem', color: '#aaa', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                                    No hay usuarios en esta categoría en el servidor.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* MODAL DE ÉXITO */}
            {showSuccessModal && (
                <div className="modal-overlay">
                    <div className="modal-content glass-form-card animate-pop" style={{ maxWidth: '400px', textAlign: 'center' }}>
                        <div className="icon-circle" style={{ background: 'rgba(0, 255, 136, 0.2)', color: '#00ff88', fontSize: '2.5rem', width: '80px', height: '80px', margin: '0 auto 1rem' }}>🎉</div>
                        <h2 style={{ color: '#fff', marginBottom: '0.5rem' }}>¡Usuario Creado!</h2>
                        <p style={{color: '#ccc'}}>Guardado en el servidor exitosamente.</p>
                        <button className="btn-neon-primary" onClick={() => setShowSuccessModal(false)} style={{ width: '100%', marginTop: '1rem' }}>Aceptar</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CreacionUsuarios;