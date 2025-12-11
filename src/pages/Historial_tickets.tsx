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
const CloseIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>);
const ExcelIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>);

// Interfaz adaptada a la respuesta del Backend
interface Ticket {
  id: string;
  date: string;
  name: string;
  area: string;
  type: string;
  tech: string; // Aquí llegará el nombre del técnico (ej: "Juan Pérez" o "Sin Asignar")
  status: string;
}

interface TechUser {
  nombre_completo: string;
}

const TicketHistory = () => {
  const [allTickets, setAllTickets] = useState<Ticket[]>([]);
  const [technicians, setTechnicians] = useState<TechUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [tempData, setTempData] = useState<{ tech: string; status: string }>({ tech: '', status: '' });
  const [saving, setSaving] = useState(false);

  // --- CARGAR DATOS ---
  useEffect(() => {
    fetchTickets();
    fetchTechnicians();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await fetch('http://10.0.153.73:3001/api/tickets');
      if (response.ok) {
        const data = await response.json();
        setAllTickets(data);
      }
    } catch (error) {
      console.error("Error cargando tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTechnicians = async () => {
    try {
      const response = await fetch('http://10.0.153.73:3001/api/tecnicos-list');
      if (response.ok) {
        setTechnicians(await response.json());
      }
    } catch (error) {
      console.error("Error cargando técnicos:", error);
    }
  };

  // --- LÓGICA EXPORTAR EXCEL ---
  // Ahora el Excel también incluirá el nombre exacto del técnico
  const handleExportExcel = () => {
    if (filteredTickets.length === 0) return;

    const dataToExport = filteredTickets.map(ticket => ({
      "ID Ticket": ticket.id,
      "Fecha": ticket.date,
      "Solicitante": ticket.name,
      "Área": ticket.area,
      "Problema Reportado": ticket.type,
      "Técnico Responsable": ticket.tech || "Sin Asignar", // Aquí va el nombre
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
    // Cargamos el técnico actual en el modal para que no se pierda al editar
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
      const response = await fetch(`http://10.0.153.73:3001/api/tickets/${editingTicket.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tempData),
      });

      if (response.ok) {
        // Actualizamos la tabla localmente
        setAllTickets(prevTickets =>
          prevTickets.map(ticket =>
            ticket.id === editingTicket.id
              ? {
                ...ticket,
                ...tempData,
                // Aseguramos que si limpiaron el técnico, se muestre "Sin Asignar" en la UI
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

  // --- FILTRADO ---
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
            <div className="brand-text">
              <h1>Gestión de Incidencias</h1>
              <p>Panel de Administración</p>
            </div>
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
                <th>Área</th>
                <th>Problema</th>
                <th>Técnico Responsable</th> {/* Cambiado el título */}
                <th>Estado</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center">Cargando...</td></tr>
              ) : filteredTickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td className="col-id">{ticket.id}</td>
                  <td className="col-date">{ticket.date}</td>
                  <td className="col-main">{ticket.name}</td>
                  <td>{ticket.area}</td>
                  <td>{ticket.type}</td>

                  {/* COLUMNA TÉCNICO: Aquí mostramos el nombre si existe */}
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
                    <button className="btn-action" onClick={() => handleOpenModal(ticket)} title="Editar"><EditIcon /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL --- */}
      {editingTicket && (
        <div className="modal-overlay">
          <div className="modal-content animate-pop">
            <div className="modal-header">
              <h2>Gestionar Ticket #{editingTicket.id}</h2>
              <button className="btn-close" onClick={handleCloseModal}><CloseIcon /></button>
            </div>

            <div className="modal-body">
              <div className="info-grid">
                <div className="info-item"><label>Solicitante:</label><span>{editingTicket.name}</span></div>
                <div className="info-item full-width"><label>Problema:</label><p>{editingTicket.type}</p></div>
              </div>

              <hr className="modal-divider" />

              <div className="edit-grid">
                <div className="form-group">
                  <label>Asignar Técnico</label>
                  <select
                    value={tempData.tech}
                    onChange={(e) => setTempData({ ...tempData, tech: e.target.value })}
                  >
                    <option value="">Sin Asignar</option>
                    {technicians.map((t, index) => (
                      <option key={index} value={t.nombre_completo}>
                        {t.nombre_completo}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Estado del Ticket</label>
                  <select
                    value={tempData.status}
                    onChange={(e) => setTempData({ ...tempData, status: e.target.value })}
                    className={`status-select ${getStatusClass(tempData.status)}`}
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="En Proceso">En Proceso</option>
                    <option value="Resuelto">Resuelto</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={handleCloseModal}>Cancelar</button>
              <button className="btn-primary" onClick={handleSaveChanges} disabled={saving}>
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