import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutAuth } from "../store/thunks/logout";
import { cargarTodasSolicitudesCDT } from "../store/thunks/cdtThunk";
import { clearCdtState } from "../store/slices/cdtSlice";
import { AdminListaCDT } from "./AdminListaCDT";
import { Footer } from "./Footer";

export const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, displayName, role } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status !== "authenticated" || role !== "admin") {
      navigate("/login");
      return;
    }

    // Cargar todas las solicitudes de todos los usuarios
    const cargarSolicitudes = async () => {
      setLoading(true);
      await dispatch(cargarTodasSolicitudesCDT());
      setLoading(false);
    };

    cargarSolicitudes();
  }, [status, role, navigate, dispatch]);

  const handleLogout = () => {
    dispatch(clearCdtState());
    dispatch(logoutAuth());
  };

  if (status !== "authenticated" || role !== "admin") {
    return null;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1 className="dashboard-title">NeoBank - Panel de Administrador</h1>
          <p className="dashboard-subtitle">Gestión de Solicitudes de CDT</p>
        </div>
        <div className="dashboard-user-info">
          <span className="dashboard-user-name">👤 {displayName} (Admin)</span>
          <button onClick={handleLogout} className="dashboard-logout-button">
            Cerrar Sesión
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        {loading ? (
          <div className="loading-container">
            <p>Cargando solicitudes...</p>
          </div>
        ) : (
          <AdminListaCDT />
        )}
      </main>

      <Footer />
    </div>
  );
};
