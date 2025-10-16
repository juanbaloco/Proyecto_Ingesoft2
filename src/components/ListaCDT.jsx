import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSolicitudActual } from "../store/slices/cdtSlice";
import { cargarSolicitudesCDT, eliminarSolicitudCDT } from "../store/thunks/cdtThunk";

export const ListaCDT = () => {
  const dispatch = useDispatch();
  const { solicitudes, status } = useSelector((state) => state.cdt);
  const { uid } = useSelector((state) => state.auth);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (uid) {
      dispatch(cargarSolicitudesCDT(uid));
    }
  }, [uid, dispatch]);

  const handleEditar = (solicitud) => {
    dispatch(setSolicitudActual(solicitud));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEliminar = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta solicitud?")) {
      const resultado = await dispatch(eliminarSolicitudCDT(id));
      if (!resultado.success) {
        alert("Error al eliminar la solicitud");
      }
    }
  };

  const formatFecha = (fecha) => {
    if (!fecha) return "N/A";
    try {
      const date =
        fecha.toDate instanceof Function ? fecha.toDate() : new Date(fecha);
      return date.toLocaleDateString("es-CO", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return "N/A";
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getEstadoBadgeClass = (estado) => {
    switch (estado) {
      case "PENDIENTE":
        return "lista-cdt-badge lista-cdt-badge-pendiente";
      case "APROBADA":
        return "lista-cdt-badge lista-cdt-badge-aprobada";
      case "RECHAZADA":
        return "lista-cdt-badge lista-cdt-badge-rechazada";
      default:
        return "lista-cdt-badge";
    }
  };

  const solicitudesFiltradas = solicitudes.filter((sol) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      sol.monto.toString().includes(term) ||
      sol.plazo.toString().includes(term) ||
      sol.estado.toLowerCase().includes(term)
    );
  });

  return (
    <div className="lista-cdt-container">
      <div className="lista-cdt-search-container">
        <input
          type="text"
          placeholder="Buscar por monto, plazo o estado..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="lista-cdt-search-input"
        />
      </div>

      {solicitudesFiltradas.length === 0 ? (
        <div className="lista-cdt-empty">
          {solicitudes.length === 0
            ? "No tienes solicitudes de CDT. ¡Crea tu primera solicitud!"
            : "No se encontraron solicitudes con los filtros aplicados."}
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="lista-cdt-table">
            <thead>
              <tr className="lista-cdt-table-header">
                <th className="lista-cdt-th">Fecha</th>
                <th className="lista-cdt-th">Monto</th>
                <th className="lista-cdt-th">Plazo (días)</th>
                <th className="lista-cdt-th">Tasa (%)</th>
                <th className="lista-cdt-th">Estado</th>
                <th className="lista-cdt-th">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {solicitudesFiltradas.map((solicitud) => (
                <tr 
                  key={solicitud.id} 
                  className="lista-cdt-table-row"
                >
                  <td className="lista-cdt-td">
                    {formatFecha(solicitud.fechaSolicitud)}
                  </td>
                  <td className="lista-cdt-td">{formatCurrency(solicitud.monto)}</td>
                  <td className="lista-cdt-td">
                    {solicitud.plazo} días
                  </td>
                  <td className="lista-cdt-td">{solicitud.tasaInteres}% E.A</td>
                  <td className="lista-cdt-td">
                    <span className={getEstadoBadgeClass(solicitud.estado)}>
                      {solicitud.estado}
                    </span>
                  </td>
                  <td className="lista-cdt-td">
                    <div className="lista-cdt-actions">
                      <button
                        onClick={() => handleEditar(solicitud)}
                        className="lista-cdt-edit-button"
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleEliminar(solicitud.id)}
                        className="lista-cdt-delete-button"
                        title="Eliminar"
                      >
                        🗑️
                      </button>
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
