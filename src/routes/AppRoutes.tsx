import { Route, Routes } from "react-router-dom";

// Páginas existentes
import HomePage from "../pages/HomePage";
import Historial_tickets from "../pages/Historial_tickets"; 
import LoginAdmin from "../pages/LoginAdmin";
import Reportes from "../pages/Reportes";
import Formulario from "../pages/Formulario";
import TicketTracking from "../pages/RegistroTickets";

// Páginas Nuevas / Actualizadas
import Admin from "../pages/Admin"; 
import CreacionUsuarios from "../pages/Creacionusuarios";
import TechnicianDashboard from "../pages/Usuarios";
import ProtectedRoute from "../components/ProtectedRoute";

const AppRoutes = () => {
    return (
        <Routes>
            {/* --- Rutas Públicas --- */}
            <Route path="/" element={<HomePage />} />
            <Route path="/formulario" element={<Formulario />} />
            <Route path="/registro" element={<TicketTracking />} />
            <Route path="/login" element={<LoginAdmin />} />
            <Route path="/reportes" element={<Reportes />} />
            <Route path="/listado" element={<Historial_tickets />} />

            {/* --- Rutas Privadas / Gestión --- */}
            <Route 
                path="/admin" 
                element={
                    <ProtectedRoute requireAdmin={true}>
                        <Admin />
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/usuarios" 
                element={
                    <CreacionUsuarios />
                } 
            />     

       
            <Route path="/tecnico" element={<TechnicianDashboard />} />
        </Routes>
    )
}

export default AppRoutes;