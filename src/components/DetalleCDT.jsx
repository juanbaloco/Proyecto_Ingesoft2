import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useState, useEffect } from "react";

export const DetalleCDT = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { solicitudes } = useSelector((s) => s.cdt);
  const { uid } = useSelector((s) => s.auth);

  const [solicitud, setSolicitud] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const obtenerSolicitud = async () => {
      try {
        // Primero buscar en Redux
        let s = (solicitudes || []).find((x) => x.id === id);

        // Si no está en Redux, cargar de Firestore
        if (!s && uid && id) {
          const solicitudRef = doc(db, "usuarios", uid, "solicitudesCDT", id);
          const docSnap = await getDoc(solicitudRef);
          if (docSnap.exists()) {
            s = { id: docSnap.id, ...docSnap.data() };
          }
        }

        if (s) {
          setSolicitud(s);
          setError(null);
        } else {
          setError("Solicitud no encontrada");
        }
      } catch (err) {
        console.error("Error cargando solicitud:", err);
        setError(err.message || "Error al cargar la solicitud");
      } finally {
        setLoading(false);
      }
    };

    obtenerSolicitud();
  }, [id, uid, solicitudes]);

  const formatCOP = (v) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(v || 0);

  // ✅ CORREGIDO: Usar toLocaleString en vez de toLocaleDateString
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
    return <div style={{ padding: "20px" }}>Cargando...</div>;
  }

  if (error || !solicitud) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h3 style={{ color: "#dc3545" }}>❌ {error || "Solicitud no encontrada"}</h3>
        <p style={{ fontSize: "0.9em", color: "#666", marginBottom: "20px" }}>ID: {id}</p>
        <button
          onClick={() => navigate("/dashboard")}
          style={{
            padding: "10px 20px",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Volver al Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Detalle de Solicitud CDT</h1>
          <p className="dashboard-subtitle">Información completa de la solicitud</p>
        </div>
        <div className="dashboard-user-info">
          <button onClick={() => navigate("/dashboard")} className="dashboard-logout-button">
            ← Volver al Dashboard
          </button>
        </div>
      </header>

      <main className="dashboard-content">
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

          {(solicitud.interesEstimado !== undefined || solicitud.totalAlVencimiento !== undefined) && (
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
          <div className="formulario-cdt-button-group" style={{ marginTop: 0 }}>
            <button
              onClick={() => navigate("/dashboard")}
              className="formulario-cdt-cancel-button"
            >
              Volver
            </button>
            {(solicitud.estado === "Borrador" || solicitud.estado === "En Validación") && (
              <button
                onClick={() => navigate(`/editar/${solicitud.id}`)}
                className="formulario-cdt-submit-button"
              >
                Editar Solicitud
              </button>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};