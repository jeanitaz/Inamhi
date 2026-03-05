import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import '../styles/Reporte.css';

// --- ICONOS SVG ---
const DownloadIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>);
const BackIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></svg>);


const COLORS = [
    '#0f4c81', // Azul Clásico Oscuro
    '#e11d48', // Rojo Rosa Intenso
    '#059669', // Verde Esmeralda
    '#d97706', // Ámbar Oscuro
    '#7c3aed', // Violeta Vibrante
    '#0891b2'  // Cian Oscuro
];

interface Ticket {
    id: string;
    date: string;
    name: string;
    area: string;
    type: string;
    tech: string;
    status: string;
}

const ReportsView = () => {
    const [loadingPdf, setLoadingPdf] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);

    // --- ESTADOS ---
    const [totalTickets, setTotalTickets] = useState(0);
    const [dataMonthly, setDataMonthly] = useState<{ name: string; tickets: number }[]>([]);
    const [dataStatus, setDataStatus] = useState<{ name: string; value: number }[]>([]);
    const [dataArea, setDataArea] = useState<{ name: string; tickets: number }[]>([]);
    const [dataType, setDataType] = useState<{ name: string; count: number }[]>([]);
    const [dataTech, setDataTech] = useState<{ name: string; tickets: number }[]>([]);

    // --- CARGAR DATOS ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/tickets');
                if (response.ok) {
                    const tickets: Ticket[] = await response.json();
                    processTicketData(tickets);
                }
            } catch (error) {
                console.error("Error cargando datos para reportes:", error);
            }
        };
        fetchData();
    }, []);

    // --- PROCESAMIENTO DE DATOS ---
    const processTicketData = (tickets: Ticket[]) => {
        setTotalTickets(tickets.length);

        // 1. Estado
        const statusCount: Record<string, number> = {};
        tickets.forEach(t => {
            const s = t.status || 'Desconocido';
            statusCount[s] = (statusCount[s] || 0) + 1;
        });
        setDataStatus(Object.keys(statusCount).map(key => ({ name: key, value: statusCount[key] })));

        // 2. Área
        const areaCount: Record<string, number> = {};
        tickets.forEach(t => {
            const a = t.area || 'Sin Área';
            areaCount[a] = (areaCount[a] || 0) + 1;
        });
        setDataArea(Object.keys(areaCount).map(key => ({ name: key, tickets: areaCount[key] })));

        // 3. Tipo
        const typeCount: Record<string, number> = {};
        tickets.forEach(t => {
            const tp = t.type || 'Otro';
            typeCount[tp] = (typeCount[tp] || 0) + 1;
        });
        setDataType(Object.keys(typeCount).map(key => ({ name: key, count: typeCount[key] })));

        // 4. Técnicos
        const techCount: Record<string, number> = {};
        tickets.forEach(t => {
            const tc = (t.tech && t.tech !== 'Sin Asignar' && t.tech !== 'Por Asignar') ? t.tech : 'Sin Asignar';
            if (tc !== 'Sin Asignar') {
                techCount[tc] = (techCount[tc] || 0) + 1;
            }
        });
        setDataTech(Object.keys(techCount).map(key => ({ name: key, tickets: techCount[key] })));

        // 5. Mensual
        const monthMap: Record<string, number> = {};
        const monthsOrder = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

        tickets.forEach(t => {
            if (t.date) {
                const parts = t.date.split('/');
                if (parts.length >= 2) {
                    const monthIndex = parseInt(parts[1]) - 1;
                    if (monthIndex >= 0 && monthIndex < 12) {
                        const monthName = monthsOrder[monthIndex];
                        monthMap[monthName] = (monthMap[monthName] || 0) + 1;
                    }
                }
            }
        });
        const sortedMonths = monthsOrder.filter(m => monthMap[m] !== undefined).map(m => ({
            name: m,
            tickets: monthMap[m]
        }));
        setDataMonthly(sortedMonths.length > 0 ? sortedMonths : [{ name: 'Actual', tickets: tickets.length }]);
    };

    // --- EXPORTAR PDF (HORIZONTAL) ---
    const handleExportPDF = async () => {
        const element = printRef.current;
        if (!element) return;

        setLoadingPdf(true);
        try {
            const canvas = await html2canvas(element, {
                scale: 2,
                backgroundColor: '#ffffff', // Fondo blanco forzado
                logging: false
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('l', 'mm', 'a4'); // Landscape

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save('Reporte_INAMHI_Horizontal.pdf');
        } catch (error) {
            console.error("Error al exportar PDF", error);
        }
        setLoadingPdf(false);
    };

    // Estilos comunes para tooltips
    const tooltipStyle = {
        backgroundColor: '#fff',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        color: '#1e293b',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    };

    // Estilos comunes para texto de ejes (Gris Oscuro)
    const axisStyle = { fontSize: '0.75rem', fontWeight: '600', fill: '#475569' };

    return (
        <div className="reports-container">
            {/* Fondo decorativo (opcional si usas el CSS nuevo) */}
            <div className="stars"></div>

            <div className="reports-header">
                <Link to="/admin" className="btn-back-nav">
                    <BackIcon /> Regresar
                </Link>
                <h1>Panel de Métricas y Reportes</h1>
                <button
                    className="btn-export"
                    onClick={handleExportPDF}
                    disabled={loadingPdf}
                >
                    <DownloadIcon /> {loadingPdf ? 'Generando...' : 'Exportar PDF'}
                </button>
            </div>

            {/* Contenedor Principal para capturar en PDF */}
            <div className="dashboard-grid" ref={printRef}>

                {/* FILA 1: KPIs */}
                <div className="card kpi-card">
                    <h3>Total Tickets (Histórico)</h3>
                    <div className="kpi-value">{totalTickets}</div>
                    <span className="kpi-trend positive">Datos en tiempo real</span>
                </div>

                <div className="card kpi-card">
                    <h3>Eficacia Global</h3>
                    <div className="kpi-value">
                        {totalTickets > 0
                            ? Math.round((dataStatus.find(s => s.name === 'Resuelto')?.value || 0) / totalTickets * 100)
                            : 0}%
                    </div>
                    <span className="kpi-sub">Tasa de resolución</span>
                </div>

                <div className="card chart-card wide">
                    <h3>Evolución de Tickets (Por Mes)</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={dataMonthly}>
                            <defs>
                                <linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#0f4c81" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#0f4c81" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            {/* Grilla gris claro visible en fondo blanco */}
                            <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                            <XAxis dataKey="name" stroke="#cbd5e1" tick={axisStyle} />
                            <YAxis stroke="#cbd5e1" tick={axisStyle} />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Area type="monotone" dataKey="tickets" stroke="#0f4c81" strokeWidth={3} fillOpacity={1} fill="url(#colorTickets)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* FILA 2: Distribución y Estado */}
                <div className="card chart-card">
                    <h3>Estado de Tickets</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={dataStatus}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {dataStatus.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={tooltipStyle} />
                            <Legend verticalAlign="bottom" height={36} formatter={(value) => <span style={{ color: '#334155', fontWeight: 600 }}>{value}</span>} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="card chart-card">
                    <h3>Por Dirección / Área</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={dataArea} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" horizontal={false} />
                            <XAxis type="number" stroke="#cbd5e1" hide />
                            <YAxis dataKey="name" type="category" width={100} stroke="#cbd5e1" tick={axisStyle} />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Bar dataKey="tickets" fill="#0f4c81" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* FILA 3: Técnicos y Tipos */}
                <div className="card chart-card wide">
                    <h3>Rendimiento por Técnico (Tickets Tomados)</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={dataTech}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" vertical={false} />
                            <XAxis dataKey="name" stroke="#cbd5e1" tick={axisStyle} />
                            <YAxis stroke="#cbd5e1" tick={axisStyle} />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Legend formatter={(value) => <span style={{ color: '#334155' }}>{value}</span>} />
                            <Bar dataKey="tickets" name="Tickets Resueltos" fill="#059669" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="card chart-card">
                    <h3>Por Tipo de Requerimiento</h3>
                    <ul className="stats-list">
                        {dataType.map((item, idx) => (
                            <li key={idx}>
                                <div className="stat-info">
                                    <span style={{ color: '#334155', fontWeight: 600 }}>{item.name}</span>
                                    <span className="count" style={{ color: '#0f4c81', fontWeight: 'bold' }}>{item.count}</span>
                                </div>
                                <div className="progress-bar">
                                    <div
                                        className="progress-fill"
                                        style={{
                                            width: `${totalTickets > 0 ? (item.count / totalTickets) * 100 : 0}%`,
                                            backgroundColor: COLORS[idx % COLORS.length]
                                        }}
                                    ></div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

            </div>
        </div>
    );
};

export default ReportsView;