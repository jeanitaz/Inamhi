import { Route, Routes } from "react-router-dom";

// Páginas existentes
import HomePage from "../pages/HomePage";
import Historial_tickets from "../pages/Historial_tickets"; // Verifica si quieres usar TicketHistory.tsx aquí
import LoginAdmin from "../pages/LoginAdmin";
import Reportes from "../pages/Reportes";
import Formulario from "../pages/Formulario";
import TicketTracking from "../pages/RegistroTickets";

// Páginas Nuevas / Actualizadas
import Admin from "../pages/Admin"; // Este es tu Super Admin Dashboard
import CreacionUsuarios from "../pages/Creacionusuarios";
import TechnicianDashboard from "../pages/Usuarios";
const AppRoutes = () => {
    return (
        <Routes>
            {/* Rutas Públicas */}
            <Route path="/" element={<HomePage />} />
            <Route path="/formulario" element={<Formulario />} />
            <Route path="/registro" element={<TicketTracking />} />
            <Route path="/login" element={<LoginAdmin />} />

            {/* Rutas Privadas / Gestión */}
            <Route path="/admin" element={<Admin />} />
            <Route path="/tecnico" element={<TechnicianDashboard />} /> 
            <Route path="/usuarios" element={<CreacionUsuarios />} />     
            <Route path="/listado" element={<Historial_tickets />} />
            <Route path="/reportes" element={<Reportes />} />
        </Routes>
    )
}

export default AppRoutes;