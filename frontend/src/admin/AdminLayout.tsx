import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const tabs = [
  { to: "/admin", label: "Contenido", end: true },
  { to: "/admin/media", label: "Fotos y videos" },
  { to: "/admin/testimonios", label: "Testimonios" },
  { to: "/admin/contacto", label: "Contacto" },
];

export default function AdminLayout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-lg">Panel admin — Fusión con Sazón</h1>
            <p className="text-xs text-gray-500">{admin?.email}</p>
          </div>
          <div className="flex gap-3">
            <NavLink to="/" className="text-sm text-gray-600 hover:text-brand">
              Ver sitio
            </NavLink>
            <button onClick={handleLogout} className="text-sm text-red-600 hover:underline">
              Cerrar sesión
            </button>
          </div>
        </div>
        <nav className="max-w-6xl mx-auto px-4 flex gap-4 border-t">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                `py-3 text-sm font-medium border-b-2 ${
                  isActive ? "border-brand text-brand" : "border-transparent text-gray-600 hover:text-brand"
                }`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
