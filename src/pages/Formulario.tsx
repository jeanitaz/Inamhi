import { useState, useRef, type ChangeEvent, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Formulario.css';
import logoInamhi from '../assets/lgo.png';

// 1. CAMBIO AQUÍ: Ahora son arreglos de objetos con su ID de base de datos
// ¡IMPORTANTE! Verifica que estos IDs sean los mismos que tienes en tu MySQL
const AREAS_INSTITUCIONALES = [
    { id: 1, nombre: "TECNOLOGÍAS DE LA INFORMACIÓN Y COMUNICACIÓN" },
    { id: 2, nombre: "DIRECCIÓN DE INFORMACIÓN HIDROMETEOROLÓGICA" },
    { id: 3, nombre: "DIRECCIÓN DE ADMINISTRACIÓN DE RECURSOS HUMANOS" },
    { id: 4, nombre: "DIRECCIÓN ADMINISTRATIVA FINANCIERA" },
    { id: 5, nombre: "DIRECCIÓN EJECUTIVA" },
    { id: 6, nombre: "DIRECCIÓN DE ASESORÍA JURÍDICA" },
    { id: 7, nombre: "DIRECCIÓN DE COMUNICACIÓN SOCIAL" },
    { id: 8, nombre: "DIRECCIÓN DE PLANIFICACIÓN" },
    { id: 9, nombre: "DIRECCIÓN DE PRONÓSTICOS Y ALERTAS" },
    { id: 10, nombre: "DIRECCIÓN DE ESTUDIOS, INVESTIGACIÓN Y DESARROLLO HIDROMETEOROLÓGICO" },
    { id: 11, nombre: "DIRECCIÓN DE LA RED NACIONAL DE OBSERVACIÓN HIDROMETEOROLÓGICA" },
    { id: 12, nombre: "LABORATORIO NACIONAL DE CALIDAD DE AGUA Y SEDIMENTOS" }
];

const TIPOS_REQUERIMIENTO = [
    { id: 1, nombre: "Problemas de hardware (Físico)" },
    { id: 2, nombre: "Problemas de software (Digital)" },
    { id: 3, nombre: "Problemas de red / internet" },
    { id: 4, nombre: "Solicitud de instalación de software" },
    { id: 5, nombre: "Solicitud de acceso a sistemas" },
    { id: 6, nombre: "Solicitud de creación / desbloqueo de cuenta" },
    { id: 7, nombre: "Problemas con impresoras" },
    { id: 8, nombre: "Problemas con correo electrónico" },
    { id: 9, nombre: "Solicitud de actualización de aplicación" },
    { id: 10, nombre: "Otros" }
];

const ID_TIPO_OTROS = '10';

// ... Iconos ...
const UploadIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
);
const BackIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></svg>
);
const CheckIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
);


const ServiceRequestForm = () => {
    const [formData, setFormData] = useState({
        fullName: '', area: '', position: '', email: '',
        phone: '', reqType: '', otherDetail: '', description: '', observations: ''
    });

    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [ticketId, setTicketId] = useState(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showModal, setShowModal] = useState(false);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            alert('Por favor, ingrese un correo electrónico válido.');
            setLoading(false);
            return;
        }

        try {
            const payload = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                payload.append(key, value as string);
            });

            if (file) {
                payload.append('evidence', file);
            }

            const response = await fetch('http://10.0.153.73:3001/tickets', {
                method: 'POST',
                body: payload,
            });

            const data = await response.json();

            if (response.ok) {
                setTicketId(data.ticketId);
                setShowModal(true);
            } else {
                alert('Error al crear ticket: ' + (data.message || 'Error desconocido'));
            }

        } catch (error) {
            console.error("Error de conexión:", error);
            alert('No se pudo conectar con el servidor. Asegúrate de que el backend esté corriendo.');
        } finally {
            setLoading(false);
        }
    };

    const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        const onlyNums = value.replace(/[^0-9]/g, '');
        if (onlyNums.length <= 10) {
            setFormData(prev => ({ ...prev, phone: onlyNums }));
        }
    };

    const getAreaName = (id: string) => {
        const area = AREAS_INSTITUCIONALES.find(a => a.id.toString() === id);
        return area ? area.nombre : '';
    };

    const getReqTypeName = (id: string) => {
        const type = TIPOS_REQUERIMIENTO.find(t => t.id.toString() === id);
        return type ? type.nombre : '';
    };

    return (
        <div className="form-container">
            <div className="stars"></div>

            <div className="service-request-card animate-slide-up">
                <div className="form-header">
                    <div className="header-actions">
                        <Link to="/" className="nav-link back">
                            <BackIcon /> Cancelar
                        </Link>
                    </div>
                    <img src={logoInamhi} alt="Logo" className="form-logo" />
                    <h2>Nueva Solicitud de Soporte</h2>
                    <p>Complete los campos para registrar su incidencia</p>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* SECCIÓN 1: DATOS DEL USUARIO */}
                    <div className="form-section">
                        <h3><span className="step-number">1</span> Información del Solicitante</h3>
                        <div className="grid-2">
                            <div className="input-group">
                                <label>Nombre Completo *</label>
                                <input type="text" name="fullName" required value={formData.fullName} onChange={handleChange} />
                            </div>
                            <div className="input-group">
                                <label>Cargo *</label>
                                <input type="text" name="position" required value={formData.position} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="grid-2">
                            <div className="input-group">
                                <label>Dirección / Área *</label>
                                <select name="area" required value={formData.area} onChange={handleChange}>
                                    <option value="">Seleccione un área...</option>
                                    {AREAS_INSTITUCIONALES.map(area => (
                                        <option key={area.id} value={area.id}>{area.nombre}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="input-group">
                                <label>Correo Electrónico *</label>
                                <input type="email" name="email" required value={formData.email} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="input-group">
                            <label>Teléfono (Opcional)</label>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handlePhoneChange}
                                inputMode="numeric"
                                placeholder="0995717225"
                            />
                        </div>
                    </div>

                    <div className="divider"></div>

                    {/* SECCIÓN 2: DETALLE */}
                    <div className="form-section">
                        <h3><span className="step-number">2</span> Detalle del Requerimiento</h3>
                        <div className="input-group">
                            <label>Tipo de Requerimiento *</label>
                            <select name="reqType" required value={formData.reqType} onChange={handleChange}>
                                <option value="">Seleccione...</option>
                                {TIPOS_REQUERIMIENTO.map(type => (
                                    <option key={type.id} value={type.id}>{type.nombre}</option>
                                ))}
                            </select>
                        </div>
                        {formData.reqType === ID_TIPO_OTROS && (
                            <div className="input-group animate-fade-in">
                                <label>Especifique *</label>
                                <input type="text" name="otherDetail" required value={formData.otherDetail} onChange={handleChange} />
                            </div>
                        )}
                        <div className="input-group">
                            <label>Descripción *</label>
                            <textarea name="description" rows={4} required value={formData.description} onChange={handleChange}></textarea>
                        </div>
                        <div className="input-group">
                            <label>Adjuntar Evidencia</label>
                            <div className="file-drop-zone" onClick={() => fileInputRef.current?.click()}>
                                <input type="file" hidden ref={fileInputRef} onChange={handleFileChange} accept="image/*,.pdf" />
                                <div className="file-content">
                                    <UploadIcon />
                                    <span>{file ? file.name : "Click para subir imagen o PDF"}</span>
                                </div>
                            </div>
                        </div>
                        <div className="input-group">
                            <label>Observaciones</label>
                            <input type="text" name="observations" value={formData.observations} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn-glow full-width" disabled={loading}>
                            {loading ? <span className="spinner"></span> : 'Generar Ticket'}
                        </button>
                    </div>
                </form>
            </div>

            {/* --- ESTE ES EL NUEVO MODAL REDISEÑADO --- */}
            {showModal && (
                <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)' }}>
                    <div className="modal-content animate-slide-up" style={{
                        background: '#ffffff',
                        borderRadius: '16px',
                        padding: '30px',
                        maxWidth: '450px',
                        width: '90%',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        textAlign: 'center',
                        borderTop: '6px solid #3b82f6'
                    }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            background: '#dcfce7',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 15px'
                        }}>
                            <CheckIcon />
                        </div>

                        <h2 style={{ margin: '0 0 5px', color: '#111827', fontSize: '1.5rem', fontWeight: 'bold' }}>¡Solicitud Enviada!</h2>
                        <p style={{ color: '#6b7280', fontSize: '0.95rem', margin: '0 0 20px' }}>Tu requerimiento ha sido registrado con éxito en nuestro sistema.</p>

                        <div style={{
                            background: '#eff6ff',
                            border: '1px dashed #93c5fd',
                            borderRadius: '10px',
                            padding: '15px',
                            margin: '0 0 20px'
                        }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#60a5fa', letterSpacing: '1px' }}>NÚMERO DE TICKET</span>
                            <h3 style={{ margin: '5px 0 0', color: '#1d4ed8', fontSize: '1.25rem', letterSpacing: '0.5px', wordBreak: 'break-all' }}>{ticketId}</h3>
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '15px',
                            background: '#f9fafb',
                            padding: '15px',
                            borderRadius: '10px',
                            textAlign: 'left',
                            marginBottom: '20px'
                        }}>
                            <div>
                                <span style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af', fontWeight: 'bold' }}>SOLICITANTE</span>
                                <span style={{ display: 'block', fontSize: '0.9rem', color: '#374151', fontWeight: '500' }}>{formData.fullName}</span>
                            </div>
                            <div>
                                <span style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af', fontWeight: 'bold' }}>ÁREA</span>
                                <span style={{ display: 'block', fontSize: '0.9rem', color: '#374151', fontWeight: '500' }}>{getAreaName(formData.area)}</span>
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <span style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af', fontWeight: 'bold' }}>PROBLEMA</span>
                                <span style={{ display: 'block', fontSize: '0.9rem', color: '#374151', fontWeight: '500' }}>{getReqTypeName(formData.reqType)}</span>
                            </div>
                        </div>

                        <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '25px' }}>
                            Nuestro Equipo de Soporte Técnico se pondrá en contacto contigo a la brevedad posible.
                        </p>

                        <button
                            className="btn-glow"
                            style={{ width: '100%', padding: '12px', fontSize: '1rem' }}
                            onClick={() => {
                                setShowModal(false);
                                setTicketId(null);
                                setFormData({
                                    fullName: '', area: '', position: '', email: '',
                                    phone: '', reqType: '', otherDetail: '', description: '', observations: ''
                                });
                                setFile(null);
                            }}
                        >
                            Entendido, cerrar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ServiceRequestForm;