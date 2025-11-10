import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutAuth } from "../store/thunks/logout";
import { ListaCDT } from "./ListaCDT";
import { FormularioCDT } from "./FormularioCDT";
import { clearCdtState } from "../store/slices/cdtSlice";
import { Footer } from "./Footer";
import { cargarSolicitudesCDT } from "../store/thunks/cdtThunk";

export const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, displayName, uid, role } = useSelector((state) => state.auth);
  const { solicitudes } = useSelector((state) => state.cdt);

  useEffect(() => {
    if (status === "not-authenticated") {
      navigate("/login");
      return;
    }

    if (role === "admin") {
      navigate("/admin/dashboard");
      return;
    }

    if (uid && status === "authenticated") {
      dispatch(cargarSolicitudesCDT(uid));
    }
  }, [status, role, uid]);

  const handleLogout = () => {
    dispatch(clearCdtState());
    dispatch(logoutAuth());
  };

  if (status !== "authenticated" || role === "admin") {
    return null;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1 className="dashboard-title">NeoBank - NeoCDT</h1>
          <p className="dashboard-subtitle">Gestión de Solicitudes de CDT</p>
        </div>
        <div className="dashboard-user-info">
          <span className="dashboard-user-name">{displayName}</span>
          <button onClick={handleLogout} className="dashboard-logout-button">
            Cerrar Sesión
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        <section className="dashboard-section">
          <h2 className="dashboard-section-title">Nueva Solicitud de CDT</h2>
          <FormularioCDT />
        </section>

        <section className="dashboard-section">
          <h2 className="dashboard-section-title">
            Mis Solicitudes ({solicitudes.length})
          </h2>
          <ListaCDT />
        </section>
      </main>

      <Footer />
    </div>
  );
};