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
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(v || 0);

  const formatFecha = (f) => {
    if (!f) return "-";
    try {
      const d = typeof f?.toDate === "function" ? f.toDate() : new Date(f);
      return d.toLocaleString("es-CO", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return "-";
    }
  };

  const chipClase = (e) =>
    ({
      Aprobado: "chip chip--success",
      "En Validación": "chip chip--info",
      Rechazado: "chip chip--danger",
      Cancelado: "chip chip--warning",
      Borrador: "chip",
    }[e] || "chip");

  // ✅ CORREGIDO: Navegar a /cdt/:id en vez de /detalle/:id
  const onVerDetalle = (solicitudId) => {
    console.log("🔍 Navegando a detalles:", solicitudId);
    navigate(`/cdt/${solicitudId}`);
  };

  const onEditar = (s) => {
    console.log("✏️ Navegando a editar:", s.id);
    navigate(`/editar/${s.id}`);
  };

  const onEliminar = async (id) => {
    if (window.confirm("¿Eliminar esta solicitud?")) {
      const r = await dispatch(eliminarSolicitudCDT(id));
      if (!r.success) alert("No fue posible eliminar");
    }
  };

  const visible = (solicitudes || [])
    .filter((s) => (filtro === "TODOS" ? true : s.estado === filtro))
    .filter((s) =>
      [s.monto, s.plazo, s.estado]
        ?.join(" ")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
        <input
          type="text"
          placeholder="🔍 Buscar por monto o plazo"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1, padding: "10px", borderRadius: "4px", border: "1px solid #ddd" }}
        />
        <select
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          style={{ padding: "10px", borderRadius: "4px", border: "1px solid #ddd" }}
        >
          {ESTADOS.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
      </div>

      {status === "loading" && <p>Cargando solicitudes...</p>}
      {visible.length === 0 && status !== "loading" && (
        <p style={{ textAlign: "center", padding: "20px", color: "#666" }}>
          No hay resultados
        </p>
      )}

      {visible.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f5f5f5" }}>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #ddd" }}>Monto</th>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #ddd" }}>Plazo</th>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #ddd" }}>Tasa</th>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #ddd" }}>Estado</th>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #ddd" }}>Fecha</th>
                <th style={{ padding: "12px", textAlign: "center", borderBottom: "2px solid #ddd" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((s) => (
                <tr key={s.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "12px" }}>{formatCOP(s.monto)}</td>
                  <td style={{ padding: "12px" }}>
                    {s.plazo >= 6 ? `${s.plazo} meses` : `${s.plazo} días`}
                  </td>
                  <td style={{ padding: "12px" }}>{(s.tasaInteres ?? 0).toFixed(1)}%</td>
                  <td style={{ padding: "12px" }}>
                    <span className={chipClase(s.estado)}>{s.estado}</span>
                  </td>
                  <td style={{ padding: "12px" }}>{formatFecha(s.fechaSolicitud)}</td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                      {/* ✅ BOTÓN VER CORREGIDO */}
                      <button
                        onClick={() => onVerDetalle(s.id)}
                        style={{
                          padding: "6px 12px",
                          backgroundColor: "#007bff",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "0.9em",
                        }}
                      >
                        👁️ Ver
                      </button>

                      {/* ✅ BOTÓN EDITAR SOLO PARA BORRADOR O EN_VALIDACION */}
                      {(s.estado === "Borrador" || s.estado === "En Validación") && (
                        <button
                          onClick={() => onEditar(s)}
                          style={{
                            padding: "6px 12px",
                            backgroundColor: "#ffc107",
                            color: "#000",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "0.9em",
                          }}
                        >
                          ✏️ Editar
                        </button>
                      )}

                      {s.estado === "Borrador" && (
                        <button
                          onClick={() => onEliminar(s.id)}
                          style={{
                            padding: "6px 12px",
                            backgroundColor: "#dc3545",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "0.9em",
                          }}
                        >
                          🗑️ Eliminar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};