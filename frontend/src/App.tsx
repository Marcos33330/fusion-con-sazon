import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Nosotros from "./pages/Nosotros";
import TortasYPostres from "./pages/TortasYPostres";
import Catering from "./pages/Catering";
import Eventos from "./pages/Eventos";
import AdminLogin from "./admin/AdminLogin";
import AdminLayout from "./admin/AdminLayout";
import AdminContent from "./admin/AdminContent";
import AdminMedia from "./admin/AdminMedia";
import AdminTestimonials from "./admin/AdminTestimonials";
import AdminContact from "./admin/AdminContact";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      {/* Sitio público */}
      <Route path="/" element={<Home />} />
      <Route path="/nosotros" element={<Nosotros />} />
      <Route path="/tortas-y-postres" element={<TortasYPostres />} />
      <Route path="/catering" element={<Catering />} />
      <Route path="/eventos" element={<Eventos />} />

      {/* Admin */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminContent />} />
        <Route path="media" element={<AdminMedia />} />
        <Route path="testimonios" element={<AdminTestimonials />} />
        <Route path="contacto" element={<AdminContact />} />
      </Route>
    </Routes>
  );
}
