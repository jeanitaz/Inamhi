import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as XLSX from 'xlsx';
import '../styles/Historial.css';
import logoInamhi from '../assets/lgo.png';

// --- ICONOS SVG ---
const BackIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></svg>);
const SearchIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>);
const FilterIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>);
const EditIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>);
const ExcelIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>);
const TrashIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>);
const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

// Nuevos iconos para el modal rediseñado
const UserIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const TagIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>;
const FileTextIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;
const MapPinIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;

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

interface Ticket {
  id: string;
  date: string;
  name: string;
  area: string;
  type: string;
  tech: string;
  status: string;
  description?: string;
  evidence?: string;
  id_area?: number;
}

const getAreaFromBackendString = (backendName: string, id_area?: number) => {
    // Si viene el ID del backend (cuando lo actualicen), úsalo.
    if (id_area) {
        const exactArea = AREAS_INSTITUCIONALES.find(a => a.id.toString() === id_area.toString());
        if (exactArea) return exactArea.nombre;
    }

    if (!backendName) return 'Sin Área';
    const upperName = backendName.toUpperCase();

    // Buscar coincidencia exacta
    const exactMatch = AREAS_INSTITUCIONALES.find(a => a.nombre.toUpperCase() === upperName);
    if (exactMatch) return exactMatch.nombre;

    // Búsqueda difusa para los nombres cruzados del backend
    if (upperName.includes("HIDROLOGÍA")) return "DIRECCIÓN DE INFORMACIÓN HIDROMETEOROLÓGICA";
    if (upperName.includes("JURÍDICA")) return "DIRECCIÓN DE ASESORÍA JURÍDICA";
    if (upperName.includes("COMUNICACIÓN")) return "DIRECCIÓN DE COMUNICACIÓN SOCIAL";
    if (upperName.includes("EJECUTIVA") || upperName.includes("TÉCNICA")) return "DIRECCIÓN EJECUTIVA";
    if (upperName.includes("ADMINISTRATIVA") || upperName.includes("FINANCIERA")) return "DIRECCIÓN ADMINISTRATIVA FINANCIERA";
    if (upperName.includes("RECURSOS HUMANOS")) return "DIRECCIÓN DE ADMINISTRACIÓN DE RECURSOS HUMANOS";
    if (upperName.includes("TECNOLOGÍAS") || upperName.includes("INFORMACIÓN Y COMUNICACIÓN")) return "TECNOLOGÍAS DE LA INFORMACIÓN Y COMUNICACIÓN";
    if (upperName.includes("PLANIFICACIÓN")) return "DIRECCIÓN DE PLANIFICACIÓN";
    if (upperName.includes("PRONÓSTICOS")) return "DIRECCIÓN DE PRONÓSTICOS Y ALERTAS";
    if (upperName.includes("ESTUDIOS")) return "DIRECCIÓN DE ESTUDIOS, INVESTIGACIÓN Y DESARROLLO HIDROMETEOROLÓGICO";
    if (upperName.includes("OBSERVACIÓN")) return "DIRECCIÓN DE LA RED NACIONAL DE OBSERVACIÓN HIDROMETEOROLÓGICA";
    if (upperName.includes("AGUA Y SEDIMENTOS")) return "LABORATORIO NACIONAL DE CALIDAD DE AGUA Y SEDIMENTOS";

    return upperName;
};

interface TechUser {
  nombre_completo: string;
}

const TicketHistory = () => {
  const API_BASE_URL = 'http://10.0.153.73:3001';

  const [allTickets, setAllTickets] = useState<Ticket[]>([]);
  const [technicians, setTechnicians] = useState<TechUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [loading, setLoading] = useState(true);

  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [tempData, setTempData] = useState<{ tech: string; status: string }>({ tech: '', status: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTickets();
    fetchTechnicians();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}`);
      if (response.ok) {
        const data = await response.json();
        const mappedData = data.map((t: Ticket) => ({
            ...t,
            area: getAreaFromBackendString(t.area, t.id_area)
        }));
        setAllTickets(mappedData);
      }
    } catch (error) {
      console.error("Error cargando tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTechnicians = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tecnicos-list`);
      if (response.ok) {
        setTechnicians(await response.json());
      }
    } catch (error) {
      console.error("Error cargando técnicos:", error);
    }
  };

  const handleDeleteTicket = async (id: string) => {
    const confirmacion = window.confirm(
      `¿Estás seguro de que deseas eliminar el ticket ${id}?\n\nEsta acción no se puede deshacer.`
    );

    if (!confirmacion) return;

    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setAllTickets(prev => prev.filter(t => t.id !== id));
        alert("Ticket eliminado correctamente.");
      } else {
        alert("No se pudo eliminar el ticket. Verifica el servidor.");
      }
    } catch (error) {
      console.error("Error eliminando ticket:", error);
      alert("Error de conexión al intentar eliminar.");
    }
  };

  const handleExportExcel = () => {
    if (filteredTickets.length === 0) return;

    const dataToExport = filteredTickets.map(ticket => ({
      "ID Ticket": ticket.id,
      "Fecha": ticket.date,
      "Solicitante": ticket.name,
      "Área": ticket.area,
      "Problema Reportado": ticket.type,
      "Técnico Responsable": ticket.tech || "Sin Asignar",
      "Estado Actual": ticket.status
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wscols = [
      { wch: 15 }, { wch: 15 }, { wch: 25 }, { wch: 15 },
      { wch: 30 }, { wch: 25 }, { wch: 15 }
    ];
    ws['!cols'] = wscols;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reporte de Tickets");
    XLSX.writeFile(wb, `Reporte_Tickets_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleOpenModal = (ticket: Ticket) => {
    setEditingTicket(ticket);
    setTempData({
      tech: ticket.tech === 'Sin Asignar' ? '' : ticket.tech,
      status: ticket.status || 'Pendiente'
    });
  };

  const handleCloseModal = () => {
    setEditingTicket(null);
    setSaving(false);
  };

  const handleSaveChanges = async () => {
    if (!editingTicket) return;
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/${editingTicket.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tempData),
      });

      if (response.ok) {
        setAllTickets(prevTickets =>
          prevTickets.map(ticket =>
            ticket.id === editingTicket.id
              ? {
                ...ticket,
                ...tempData,
                tech: tempData.tech || 'Sin Asignar'
              }
              : ticket
          )
        );
        handleCloseModal();
      } else {
        alert("Error al actualizar");
      }
    } catch (error) {
      console.error("Error saving ticket:", error);
      alert("Error de conexión");
    } finally {
      setSaving(false);
    }
  };

  const filteredTickets = allTickets.filter((ticket) => {
    const term = searchTerm.toLowerCase();
    const matchText = (ticket.name?.toLowerCase() || '').includes(term) || (ticket.id?.toLowerCase() || '').includes(term);
    const matchStatus = statusFilter === 'Todos' || ticket.status === statusFilter;
    return matchText && matchStatus;
  });

  const getStatusClass = (status: string) => {
    const s = status ? status.toLowerCase() : '';
    switch (s) {
      case 'resuelto': return 'status-resolved';
      case 'en proceso': return 'status-process';
      default: return 'status-pending';
    }
  };

  return (
    <div className="historial-layout">
      <div className="bg-stars"></div>
      <div className="bg-glow"></div>

      <div className="historial-container animate-enter">

        <header className="historial-header">
          <div className="header-brand">
            <Link to="/admin" className="btn-back-circle"><BackIcon /></Link>
            <img src={logoInamhi} alt="INAMHI" className="brand-logo" />
          </div>

          <button
            className="btn-primary"
            onClick={handleExportExcel}
            disabled={filteredTickets.length === 0}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <ExcelIcon />
            <span>Exportar Excel</span>
          </button>
        </header>

        <div className="controls-panel">
          <div className="search-group">
            <SearchIcon />
            <input type="text" placeholder="Buscar ticket..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <div className="filter-group">
            <FilterIcon />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="Todos">Todos</option>
              <option value="Pendiente">Pendiente</option>
              <option value="En Proceso">En Proceso</option>
              <option value="Resuelto">Resuelto</option>
            </select>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="modern-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Fecha</th>
                <th>Solicitante</th>
                <th>Descripción</th>
                <th>Área</th>
                <th>Problema</th>
                <th className="text-center">Evidencia</th>
                <th>Técnico Responsable</th>
                <th>Estado</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} className="text-center">Cargando...</td></tr>
              ) : filteredTickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td className="col-id">{ticket.id}</td>
                  <td className="col-date">{ticket.date}</td>
                  <td className="col-main">{ticket.name}</td>
                  <td className="col-description">{ticket.description}</td>
                  <td>{ticket.area}</td>
                  <td>{ticket.type}</td>

                  <td className="text-center">
                    {ticket.evidence ? (
                      <a
                        href={`${API_BASE_URL}/uploads/${ticket.evidence}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Ver Evidencia"
                        style={{
                          color: '#3b82f6',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          textDecoration: 'none',
                          fontWeight: '600',
                          fontSize: '0.85rem'
                        }}
                      >
                        <EyeIcon />
                        Ver
                      </a>
                    ) : (
                      <span style={{ opacity: 0.5, fontSize: '0.8rem', fontStyle: 'italic' }}>Sin archivo</span>
                    )}
                  </td>

                  <td className="col-tech">
                    {ticket.tech && ticket.tech !== 'Sin Asignar' ? (
                      <span style={{ fontWeight: '500', color: ticket.status === 'Resuelto' ? '#4ade80' : 'inherit' }}>
                        {ticket.status === 'Resuelto' && '✓ '}
                        {ticket.tech}
                      </span>
                    ) : (
                      <span style={{ opacity: 0.5 }}>—</span>
                    )}
                  </td>

                  <td><span className={`badge ${getStatusClass(ticket.status)}`}>{ticket.status}</span></td>

                  <td className="text-center">
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button className="btn-action" onClick={() => handleOpenModal(ticket)} title="Editar">
                        <EditIcon />
                      </button>
                      <button
                        className="btn-action delete"
                        onClick={() => handleDeleteTicket(ticket.id)}
                        title="Eliminar"
                        style={{ color: '#ff4757' }}
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- NUEVO MODAL REDISEÑADO --- */}
      {editingTicket && (
        <div className="modal-overlay" style={{
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div className="modal-content animate-pop" style={{
            background: '#ffffff',
            borderRadius: '16px',
            overflow: 'hidden',
            width: '90%',
            maxWidth: '650px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #e2e8f0',
            padding: 0
          }}>

            {/* Header del Modal */}
            <div style={{
              background: '#0f172a',
              color: 'white',
              padding: '20px 25px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '4px solid #3b82f6'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', letterSpacing: '1px', fontWeight: 'bold' }}>PANEL DE EDICIÓN</span>
                <h2 style={{ margin: '0', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  Ticket <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '6px', fontSize: '1.1rem', color: '#60a5fa' }}>#{editingTicket.id}</span>
                </h2>
              </div>
              <button
                onClick={handleCloseModal}
                style={{
                  background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer',
                  padding: '5px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = 'white'}
                onMouseOut={(e) => e.currentTarget.style.color = '#94a3b8'}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            {/* Cuerpo del Modal */}
            <div style={{ padding: '25px', maxHeight: '70vh', overflowY: 'auto' }}>

              {/* Sección de Información */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', marginBottom: '25px' }}>
                <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', marginBottom: '5px' }}>
                    <UserIcon /> <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>SOLICITANTE</span>
                  </div>
                  <p style={{ margin: 0, fontWeight: '600', color: '#1e293b' }}>{editingTicket.name}</p>
                </div>

                <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', marginBottom: '5px' }}>
                    <MapPinIcon /> <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>ÁREA</span>
                  </div>
                  <p style={{ margin: 0, fontWeight: '600', color: '#1e293b' }}>{editingTicket.area}</p>
                </div>

                <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '10px', border: '1px solid #e2e8f0', gridColumn: '1 / -1' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', marginBottom: '5px' }}>
                    <TagIcon /> <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>TIPO DE PROBLEMA</span>
                  </div>
                  <p style={{ margin: 0, fontWeight: '600', color: '#1e293b' }}>{editingTicket.type}</p>
                </div>

                <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '10px', border: '1px solid #e2e8f0', gridColumn: '1 / -1' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', marginBottom: '5px' }}>
                    <FileTextIcon /> <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>DESCRIPCIÓN DEL PROBLEMA</span>
                  </div>
                  <p style={{ margin: 0, color: '#334155', fontSize: '0.95rem', lineHeight: '1.5' }}>{editingTicket.description || 'Sin descripción adicional.'}</p>
                </div>
              </div>

              {/* Evidencia */}
              {editingTicket.evidence && (
                <div style={{ marginBottom: '25px' }}>
                  <a
                    href={`${API_BASE_URL}/uploads/${editingTicket.evidence}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '8px',
                      background: '#eff6ff', color: '#2563eb', padding: '10px 16px',
                      borderRadius: '8px', textDecoration: 'none', fontWeight: '600',
                      border: '1px solid #bfdbfe', fontSize: '0.9rem',
                      transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#dbeafe'}
                    onMouseOut={(e) => e.currentTarget.style.background = '#eff6ff'}
                  >
                    <EyeIcon />
                    Visualizar Archivo Adjunto
                  </a>
                </div>
              )}

              {/* Divisor */}
              <div style={{ borderTop: '2px dashed #e2e8f0', margin: '20px 0', position: 'relative' }}>
                <span style={{
                  position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)',
                  background: 'white', padding: '0 10px', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 'bold'
                }}>
                  ZONA DE ASIGNACIÓN
                </span>
              </div>

              {/* Controles de Edición */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '30px' }}>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#475569' }}>Técnico Responsable</label>
                  <select
                    value={tempData.tech}
                    onChange={(e) => setTempData({ ...tempData, tech: e.target.value })}
                    style={{
                      width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1',
                      background: 'white', outline: 'none', color: '#0f172a', fontSize: '0.95rem', cursor: 'pointer'
                    }}
                  >
                    <option value="">Sin Asignar</option>
                    {technicians.map((t, index) => (
                      <option key={index} value={t.nombre_completo}>
                        {t.nombre_completo}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#475569' }}>Estado Actual</label>
                  <select
                    value={tempData.status}
                    onChange={(e) => setTempData({ ...tempData, status: e.target.value })}
                    style={{
                      width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1',
                      background: 'white', outline: 'none', color: '#0f172a', fontSize: '0.95rem', cursor: 'pointer'
                    }}
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="En Proceso">En Proceso</option>
                    <option value="Resuelto">Resuelto</option>
                  </select>
                </div>

              </div>
            </div>

            {/* Footer del Modal */}
            <div style={{
              background: '#f8fafc',
              padding: '16px 25px',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px'
            }}>
              <button
                onClick={handleCloseModal}
                style={{
                  padding: '10px 20px', background: 'transparent', border: '1px solid #cbd5e1',
                  borderRadius: '8px', color: '#64748b', fontWeight: '600', cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#f1f5f9'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveChanges}
                disabled={saving}
                style={{
                  padding: '10px 20px', background: '#3b82f6', border: 'none',
                  borderRadius: '8px', color: 'white', fontWeight: '600', cursor: saving ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.39)', transition: 'background 0.2s',
                  display: 'flex', alignItems: 'center', gap: '8px'
                }}
                onMouseOver={(e) => { if (!saving) e.currentTarget.style.background = '#2563eb' }}
                onMouseOut={(e) => { if (!saving) e.currentTarget.style.background = '#3b82f6' }}
              >
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default TicketHistory;   