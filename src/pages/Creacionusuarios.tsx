import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/CreUsuarios.css';

const CreacionUsuarios = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const INITIAL_FORM_STATE = {
        nombre: '',
        email: '',
        password: '',
        rol: 'Tecnico',
        departamento: 'TICS'
    };

    const [formData, setFormData] = useState(INITIAL_FORM_STATE);
    const [showPassword, setShowPassword] = useState(false);

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
            const response = await fetch('http://10.0.153.73:3001/api/usuarios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setShowSuccessModal(true);
                setFormData(INITIAL_FORM_STATE);
            } else {
                alert("Error: " + (data.message || "No se pudo crear el usuario"));
            }

        } catch (error) {
            console.error("Error de conexión:", error);
            alert("Error de conexión con el servidor.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="admin-layout">
            <div className="admin-bg-stars"></div>
            <div className="admin-bg-glow"></div>

            <main className="admin-content">

                <header className="content-header">
                    <div className="header-titles">
                        <h1>Gestión de Usuarios</h1>
                        <p>Crear nueva credencial de acceso</p>
                    </div>
                    <button className="btn-back" onClick={() => navigate(-1)}>
                        ⬅ Volver
                    </button>
                </header>

                {/* --- NUEVO LAYOUT: GRID DE 2 COLUMNAS --- */}
                <div className="creation-grid">

                    {/* COLUMNA IZQUIERDA: FORMULARIO */}
                    <div className="form-column">
                        <div className="glass-form-card">
                            <div className="form-header">
                                <div className="icon-circle">👤</div>
                                <h2>Datos del Nuevo Usuario</h2>
                                <p>Ingresa la información para registrar en el sistema.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="cyber-form">
                                <div className="form-group">
                                    <label>Nombre Completo</label>
                                    <div className="input-wrapper">
                                        <span className="input-icon">Aa</span>
                                        <input
                                            type="text"
                                            name="nombre"
                                            placeholder="Ej. Diego González"
                                            value={formData.nombre}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Correo Institucional</label>
                                    <div className="input-wrapper">
                                        <span className="input-icon">@</span>
                                        <input
                                            type="email"
                                            name="email"
                                            placeholder="usuario@inamhi.gob.ec"
                                            value={formData.email}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Contraseña Inicial</label>
                                    <div className="input-wrapper">
                                        <span className="input-icon">🔒</span>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            placeholder="******"
                                            value={formData.password}
                                            onChange={handleChange}
                                        />
                                        <button
                                            type="button"
                                            className="toggle-pass"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? "🙈" : "👁️"}
                                        </button>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group half">
                                        <label>Rol</label>
                                        <select name="rol" value={formData.rol} onChange={handleChange}>
                                            <option value="Pasante">Pasante</option>
                                            <option value="Tecnico">Técnico</option>
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
                                    <button type="button" className="btn-ghost" onClick={() => navigate(-1)}>
                                        Cancelar
                                    </button>
                                    <button type="submit" className="btn-neon-primary" disabled={isLoading}>
                                        {isLoading ? 'Guardando...' : 'Guardar Usuario'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* COLUMNA DERECHA: CARDS INFORMATIVAS (NUEVO) */}
                    <div className="info-column">

                        {/* Card 1: Aviso Importante */}
                        <div className="info-card warning-card">
                            <div className="card-icon">⚠️</div>
                            <h3>Políticas de Correo</h3>
                            <p>
                                Recuerda que el correo institucional debe tener el formato usuario@inamhi.gob.ec.
                            </p>
                        </div>

                        {/* Card 2: Roles */}
                        <div className="info-card info-blue">
                            <div className="card-icon">ℹ️</div>
                            <h3>Roles de Acceso</h3>
                            <ul className="info-list">
                                <li><strong>Técnico:</strong> Acceso completo a gestión de tickets y reportes.</li>
                                <li><strong>Pasante:</strong> Acceso limitado a asignación y visualización.</li>
                            </ul>
                        </div>

                        {/* Card 3: Anuncio */}
                        <div className="info-card success-card">
                            <div className="card-icon">📢</div>
                            <h3>Recordatorio del Admin</h3>
                            <p>
                                Solo el Admin puede crear usuarios ya sea tanto para tecnicos y pasantes.
                            </p>
                        </div>

                    </div>

                </div>

            </main>

            {/* MODAL DE ÉXITO */}
            {showSuccessModal && (
                <div className="modal-overlay">
                    <div className="modal-content glass-form-card animate-pop" style={{ maxWidth: '400px', textAlign: 'center' }}>
                        <div className="modal-header-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div className="icon-circle" style={{ background: 'rgba(0, 255, 136, 0.2)', color: '#00ff88', fontSize: '2.5rem', width: '80px', height: '80px', marginBottom: '1rem' }}>🎉</div>
                            <h2 style={{ color: '#fff', marginBottom: '0.5rem' }}>¡Usuario Creado!</h2>
                        </div>

                        <div className="modal-body">
                            <p style={{ color: '#ccc', marginBottom: '2rem' }}>
                                El usuario ha sido registrado exitosamente en la base de datos.
                            </p>
                        </div>

                        <div className="modal-footer-center" style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button
                                className="btn-neon-primary"
                                onClick={() => setShowSuccessModal(false)}
                            >
                                Aceptar
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
export default CreacionUsuarios;