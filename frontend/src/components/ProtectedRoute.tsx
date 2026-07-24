import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ReactNode } from "react";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { admin, loading } = useAuth();

  if (loading) return <div className="p-8 text-center">Verificando sesión...</div>;
  if (!admin) return <Navigate to="/admin/login" replace />;

  return <>{children}</>;
}
