// src/components/DetalleCDT.jsx
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";

export const DetalleCDT = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { solicitudes } = useSelector((s) => s.cdt);

  const s = (solicitudes || []).find((x) => x.id === id);

  const formatCOP = (v) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(v || 0);

  if (!s) {
    return (
      <div className="dashboard-section" style={{ margin: 16 }}>
        <div className="dashboard-section-title">Detalle de Solicitud</div>
        <div className="card-sub">No se encontró la solicitud.</div>
        <div style={{ marginTop: 12 }}>
          <button className="btn-ghost" onClick={() => navigate("/dashboard")}>Volver</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-section" style={{ margin: 16 }}>
      <div className="dashboard-section-title">Detalle de Solicitud</div>

      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <div>
          <div className="card-sub">ID</div>
          <div style={{ fontWeight: 800 }}>{s.id}</div>
        </div>
        <div>
          <div className="card-sub">Monto</div>
          <div style={{ fontWeight: 800 }}>{formatCOP(s.monto)}</div>
        </div>
        <div>
          <div className="card-sub">Plazo</div>
          <div style={{ fontWeight: 800 }}>{s.plazo} {s.plazo >= 6 ? "meses" : "días"}</div>
        </div>
        <div>
          <div className="card-sub">Tasa</div>
          <div style={{ fontWeight: 800 }}>{(s.tasaInteres ?? 0).toFixed(1)}% E.A.</div>
        </div>
        <div>
          <div className="card-sub">Estado</div>
          <span className="chip">{s.estado}</span>
        </div>
        <div>
          <div className="card-sub">Fecha</div>
          <div style={{ fontWeight: 800 }}>
            {s.fechaSolicitud
              ? (typeof s.fechaSolicitud?.toDate === "function"
                  ? s.fechaSolicitud.toDate()
                  : new Date(s.fechaSolicitud)
                ).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })
              : "-"}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
        <button className="btn-ghost" onClick={() => navigate(-1)}>← Volver</button>
        <button className="lista-cdt-edit-button" onClick={() => navigate(`/cdt/${s.id}/editar`)}>Editar</button>
      </div>
    </div>
  );
};
