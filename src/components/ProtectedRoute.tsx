import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
    children: ReactNode;
    requireAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin }: ProtectedRouteProps) => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("rol");
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (!requireAdmin && userRole === "admin") {
        return <Navigate to="/admin" replace />;
    }

    return children;
};

export default ProtectedRoute;