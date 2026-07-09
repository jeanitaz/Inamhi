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
import Ranking from "../pages/Ranking";
import OpinionesRecientes from "../pages/OpinionesRecientes";

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

       
            <Route path="/tecnico" element={<ProtectedRoute requireAdmin={true}>
                        <TechnicianDashboard />
                    </ProtectedRoute>} />

            <Route 
                path="/ranking" 
                element={
                    <ProtectedRoute requireAdmin={true}>
                        <Ranking />
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/opiniones" 
                element={
                    <ProtectedRoute requireAdmin={true}>
                        <OpinionesRecientes />
                    </ProtectedRoute>
                } 
            />
        </Routes>
    )
}

export default AppRoutes;