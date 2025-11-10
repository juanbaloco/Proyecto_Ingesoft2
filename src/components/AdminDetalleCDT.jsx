import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { actualizarEstadoSolicitudAdmin } from "../store/thunks/adminThunk";

export const AdminDetalleCDT = () => {
  const { userId, solicitudId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { role } = useSelector((state) => state.auth);
  const [solicitud, setSolicitud] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    const cargarSolicitud = async () => {
      if (!userId || !solicitudId) {
        setError("Faltan parámetros de la URL");
        setLoading(false);
        return;
      }

      try {
        console.log("🔍 Cargando solicitud:", { userId, solicitudId });
        const solicitudRef = doc(db, "usuarios", userId, "solicitudesCDT", solicitudId);
        const solicitudSnap = await getDoc(solicitudRef);

        if (solicitudSnap.exists()) {
          const data = { id: solicitudSnap.id, ...solicitudSnap.data() };
          setSolicitud(data);
          console.log("✅ Solicitud cargada:", data);
        } else {
          setError("Solicitud no encontrada");
        }
      } catch (err) {
        console.error("❌ Error cargando solicitud:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (role === "admin") {
      cargarSolicitud();
    }
  }, [userId, solicitudId, role]);

  const handleCambiarEstado = async (nuevoEstado) => {
    if (!window.confirm(`¿Cambiar estado a ${nuevoEstado}?`)) return;

    setProcesando(true);
    const resultado = await dispatch(
      actualizarEstadoSolicitudAdmin(userId, solicitudId, nuevoEstado)
    ); // NOSONAR
    setProcesando(false);

    if (resultado.success) {
      alert(`✅ Estado cambiado a ${nuevoEstado}`);
      setSolicitud((prev) => ({ ...prev, estado: nuevoEstado }));
    } else {
      alert("❌ Error al cambiar el estado");
    }
  };

  const formatCOP = (valor) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(valor || 0);

  const formatFecha = (fecha) => {
    if (!fecha) return "-";
    try {
      const d = typeof fecha?.toDate === "function" ? fecha.toDate() : new Date(fecha);
      return d.toLocaleString("es-CO", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (err) {
      console.error("Error formateando fecha:", err);
      return "-";
    }
  };

  if (loading) {
    return (
      <div className="auth-loading-container">
        <div className="auth-loading-spinner">Cargando solicitud...</div>
      </div>
    );
  }

  if (error || !solicitud) {
    return (
      <div className="dashboard-container">
        <main className="dashboard-content">
          <section className="dashboard-section">
            <h3 className="dashboard-section-title" style={{ color: "#EF4444" }}>❌ {error || "Solicitud no encontrada"}</h3>
            <p style={{ color: "#6B7280", marginBottom: "20px" }}>
              userId: {userId} | solicitudId: {solicitudId}
            </p>
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="formulario-cdt-cancel-button"
            >
              Volver al Dashboard Admin
            </button>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1 className="dashboard-title">📋 Detalle de Solicitud CDT</h1>
          <p className="dashboard-subtitle">Panel de Administrador</p>
        </div>
        <div className="dashboard-user-info">
          <button onClick={() => navigate("/admin/dashboard")} className="dashboard-logout-button">
            ← Volver al Dashboard
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        <section className="dashboard-section">
          <h2 className="dashboard-section-title">Información del Cliente</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
            <div>
              <label className="formulario-cdt-label">Cliente</label>
              <p style={{ fontSize: "1.05em", fontWeight: "600", color: "#111827", marginTop: "6px" }}>
                {solicitud.displayName || "N/A"}
              </p>
            </div>
            <div>
              <label className="formulario-cdt-label">Email</label>
              <p style={{ fontSize: "1.05em", fontWeight: "600", color: "#111827", marginTop: "6px" }}>
                {solicitud.email || "N/A"}
              </p>
            </div>
            <div>
              <label className="formulario-cdt-label">User ID</label>
              <p style={{ fontSize: "0.85em", fontWeight: "500", color: "#6B7280", marginTop: "6px", wordBreak: "break-all" }}>
                {userId}
              </p>
            </div>
            <div>
              <label className="formulario-cdt-label">Solicitud ID</label>
              <p style={{ fontSize: "0.85em", fontWeight: "500", color: "#6B7280", marginTop: "6px", wordBreak: "break-all" }}>
                {solicitudId}
              </p>
            </div>
          </div>
        </section>

        <section className="dashboard-section">
          <h2 className="dashboard-section-title">Información del CDT</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "20px" }}>
            <div>
              <label className="formulario-cdt-label">Monto</label>
              <p style={{ fontSize: "1.3em", fontWeight: "700", color: "#111827", margin: "6px 0 0 0" }}>
                {formatCOP(solicitud.monto)}
              </p>
            </div>
            <div>
              <label className="formulario-cdt-label">Plazo</label>
              <p style={{ fontSize: "1.3em", fontWeight: "700", color: "#111827", margin: "6px 0 0 0" }}>
                {solicitud.plazo} meses
              </p>
            </div>
            <div>
              <label className="formulario-cdt-label">Tasa de Interés</label>
              <p style={{ fontSize: "1.3em", fontWeight: "700", color: "#111827", margin: "6px 0 0 0" }}>
                {(solicitud.tasaInteres || 0).toFixed(2)}% E.A.
              </p>
            </div>
            <div>
              <label className="formulario-cdt-label">Estado</label>
              <p style={{ fontSize: "1.3em", fontWeight: "700", color: "#8B5CF6", margin: "6px 0 0 0" }}>
                {solicitud.estado}
              </p>
            </div>
          </div>

          {(solicitud.interesEstimado || solicitud.totalAlVencimiento) && (
            <div className="formulario-cdt-info-box" style={{ backgroundColor: "#F0FDF4", border: "1px solid #DCFCE7", marginBottom: "20px", padding: "16px 18px" }}>
              <h3 className="formulario-cdt-info-title" style={{ marginTop: 0, marginBottom: "12px" }}>Resumen Financiero</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label className="formulario-cdt-label" style={{ color: "#16A34A" }}>
                    Interés Estimado
                  </label>
                  <p style={{ fontSize: "1.4em", fontWeight: "800", color: "#16A34A", margin: "6px 0 0 0" }}>
                    {formatCOP(solicitud.interesEstimado)}
                  </p>
                </div>
                <div>
                  <label className="formulario-cdt-label" style={{ color: "#16A34A" }}>
                    Total al Vencimiento
                  </label>
                  <p style={{ fontSize: "1.4em", fontWeight: "800", color: "#16A34A", margin: "6px 0 0 0" }}>
                    {formatCOP(solicitud.totalAlVencimiento)}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="formulario-cdt-label">Fecha de Solicitud</label>
            <p style={{ fontSize: "1em", color: "#6B7280", margin: "6px 0 0 0" }}>
              {formatFecha(solicitud.fechaSolicitud)}
            </p>
          </div>
        </section>

        <section className="dashboard-section">
          <h2 className="dashboard-section-title">Cambiar Estado</h2>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button
              onClick={() => handleCambiarEstado("EN_VALIDACION")}
              disabled={procesando || solicitud.estado === "EN_VALIDACION"}
              className="formulario-cdt-submit-button"
              style={{
                background: "#FFC107",
                minWidth: "160px",
                opacity: solicitud.estado === "EN_VALIDACION" ? 0.5 : 1,
              }}
            >
              En Validación
            </button>
            <button
              onClick={() => handleCambiarEstado("APROBADA")}
              disabled={procesando || solicitud.estado === "APROBADA"}
              className="formulario-cdt-submit-button"
              style={{
                background: "#16A34A",
                minWidth: "160px",
                opacity: solicitud.estado === "APROBADA" ? 0.5 : 1,
              }}
            >
              Aprobar
            </button>
            <button
              onClick={() => handleCambiarEstado("RECHAZADA")}
              disabled={procesando || solicitud.estado === "RECHAZADA"}
              className="formulario-cdt-submit-button"
              style={{
                background: "#EF4444",
                minWidth: "160px",
                opacity: solicitud.estado === "RECHAZADA" ? 0.5 : 1,
              }}
            >
              Rechazar
            </button>
            <button
              onClick={() => handleCambiarEstado("CANCELADA")}
              disabled={procesando || solicitud.estado === "CANCELADA"}
              className="formulario-cdt-cancel-button"
              style={{
                minWidth: "160px",
                opacity: solicitud.estado === "CANCELADA" ? 0.5 : 1,
              }}
            >
              Cancelar
            </button>
          </div>
        </section>

        <section className="dashboard-section">
          <div className="formulario-cdt-button-group" style={{ marginTop: 0 }}>
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="formulario-cdt-cancel-button"
            >
              Volver al Dashboard
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};