// src/components/ListaCDT.jsx
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearSolicitudActual } from "../store/slices/cdtSlice";
import { cargarSolicitudesCDT, eliminarSolicitudCDT } from "../store/thunks/cdtThunk";

export const ListaCDT = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { solicitudes, status } = useSelector((s) => s.cdt);
  const { uid } = useSelector((s) => s.auth);

  const [searchTerm, setSearchTerm] = useState("");
  const [filtro, setFiltro] = useState("TODOS");
  const ESTADOS = ["TODOS", "Borrador", "En Validación", "Aprobado", "Rechazado", "Cancelado"];

  useEffect(() => {
    if (uid) dispatch(cargarSolicitudesCDT(uid));
  }, [uid, dispatch]);

  const formatCOP = (v) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(v || 0);

  const formatFecha = (f) => {
    if (!f) return "-";
    try {
      const d = typeof f?.toDate === "function" ? f.toDate() : new Date(f);
      return d.toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" });
    } catch {
      return "-";
    }
  };

  const chipClase = (e) =>
    ({
      "Aprobado": "chip chip--success",
      "En Validación": "chip chip--info",
      "Rechazado": "chip chip--danger",
      "Cancelado": "chip chip--warning",
      "Borrador": "chip",
    }[e] || "chip");

  const onNueva = () => {
    dispatch(clearSolicitudActual());
    navigate("/cdt/nuevo");
  };

  const onEditar = (s) => {
    navigate(`/cdt/${s.id}/editar`);
  };

  const onEliminar = async (id) => {
    if (window.confirm("¿Eliminar esta solicitud?")) {
      const r = await dispatch(eliminarSolicitudCDT(id));
      if (!r.success) alert("No fue posible eliminar");
    }
  };

  const visible = (solicitudes || [])
    .filter((s) => (filtro === "TODOS" ? true : s.estado === filtro))
    .filter((s) => [s.monto, s.plazo, s.estado]?.join(" ").toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="lista-cdt-container">
      <div className="space-between" style={{ marginBottom: 10 }}>
        <div>
          <h2 style={{ background: "linear-gradient(90deg,#8B5CF6,#6366F1)", WebkitBackgroundClip: "text", color: "transparent" }}>
            Solicitudes CDT
          </h2>
          <div className="card-sub">Gestione sus solicitudes de Certificados de Depósito a Término</div>
        </div>
        <button className="auth-submit-button" onClick={onNueva}>＋ Nueva solicitud</button>
      </div>

      <div className="toolbar" style={{ marginBottom: 12 }}>
        <div className="row" style={{ width: "100%" }}>
          <div className="search" style={{ flex: 1 }}>
            <span className="icon">🔎</span>
            <input
              className="input"
              placeholder="Buscar por monto, plazo o estado…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select className="select" value={filtro} onChange={(e) => setFiltro(e.target.value)} style={{ minWidth: 200 }}>
            {ESTADOS.map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
        </div>
      </div>

      <table className="lista-cdt-table">
        <thead className="lista-cdt-table-header">
          <tr>
            <th className="lista-cdt-th">Monto</th>
            <th className="lista-cdt-th">Plazo</th>
            <th className="lista-cdt-th">Tasa</th>
            <th className="lista-cdt-th">Estado</th>
            <th className="lista-cdt-th">Fecha</th>
            <th className="lista-cdt-th" style={{ textAlign: "right", width: 220 }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {status === "idle" && visible.length === 0 && (
            <tr className="lista-cdt-table-row">
              <td className="lista-cdt-td" colSpan={6} style={{ textAlign: "center", color: "#6B7280", padding: 20 }}>
                No hay resultados
              </td>
            </tr>
          )}

          {visible.map((s) => (
            <tr key={s.id} className="lista-cdt-table-row">
              <td className="lista-cdt-td">{formatCOP(s.monto)}</td>
              <td className="lista-cdt-td">{s.plazo >= 6 ? `${s.plazo} meses` : `${s.plazo} días`}</td>
              <td className="lista-cdt-td">{(s.tasaInteres ?? 0).toFixed(1)}%</td>
              <td className="lista-cdt-td"><span className={chipClase(s.estado)}>{s.estado}</span></td>
              <td className="lista-cdt-td">{formatFecha(s.fechaSolicitud)}</td>
              <td className="lista-cdt-td">
                <div className="actions">
                  <button className="btn-ghost" onClick={() => navigate(`/cdt/${s.id}`)}>Ver</button>
                  <button className="btn-edit" onClick={() => onEditar(s)}>Editar</button>
                  <button className="btn-danger" onClick={() => onEliminar(s.id)}>Eliminar</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
