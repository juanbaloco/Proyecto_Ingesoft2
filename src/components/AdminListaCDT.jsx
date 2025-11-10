import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setFiltroEstado } from "../store/slices/cdtSlice";
import { actualizarEstadoSolicitudAdmin, eliminarSolicitudAdmin } from "../store/thunks/adminThunk";

export const AdminListaCDT = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { solicitudes, filtroEstado } = useSelector((state) => state.cdt);
  const [busqueda, setBusqueda] = useState("");
  const [ordenPor, setOrdenPor] = useState("fecha");
  const [ordenDir, setOrdenDir] = useState("desc");
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 10;

  // Filtrar solicitudes
  const solicitudesFiltradas = solicitudes.filter((sol) => {
    const cumpleFiltroEstado = 
      filtroEstado === "TODOS" || sol.estado === filtroEstado;
    const cumpleBusqueda = 
      sol.id.toLowerCase().includes(busqueda.toLowerCase()) ||
      sol.displayName?.toLowerCase().includes(busqueda.toLowerCase());
    return cumpleFiltroEstado && cumpleBusqueda;
  });

  // Ordenar solicitudes
  const solicitudesOrdenadas = [...solicitudesFiltradas].sort((a, b) => {
    let comparacion = 0;
    switch (ordenPor) {
      case "fecha":
        comparacion = new Date(b.fechaSolicitud) - new Date(a.fechaSolicitud);
        break;
      case "monto":
        comparacion = b.monto - a.monto;
        break;
      case "estado":
        comparacion = a.estado.localeCompare(b.estado);
        break;
      default:
        comparacion = 0;
    }
    return ordenDir === "asc" ? -comparacion : comparacion;
  });

  // Paginación
  const totalPaginas = Math.ceil(solicitudesOrdenadas.length / itemsPorPagina);
  const indiceInicio = (paginaActual - 1) * itemsPorPagina;
  const solicitudesPaginadas = solicitudesOrdenadas.slice(
    indiceInicio,
    indiceInicio + itemsPorPagina
  );

  const handleCambiarEstado = async (solicitud, nuevoEstado) => {
    if (window.confirm(`¿Está seguro de cambiar el estado a "${nuevoEstado}"?`)) {
      const resultado = await dispatch(
        actualizarEstadoSolicitudAdmin(solicitud.userId, solicitud.id, nuevoEstado)
      ); // NOSONAR

      if (resultado.payload?.success) {
        const mensajes = {
          "APROBADA": "La solicitud ha sido aprobada correctamente.",
          "RECHAZADA": "La solicitud ha sido rechazada correctamente.",
          "EN_VALIDACION": "La solicitud se encuentra en validación.",
        };
        alert(mensajes[nuevoEstado] || "Estado actualizado correctamente.");
      } else {
        alert("No se pudo actualizar el estado de la solicitud.");
      }
    }
  };

  const handleCancelar = async (solicitud) => {
  if (window.confirm("¿Está seguro de cancelar esta solicitud?")) {
    const resultado = await dispatch(
      actualizarEstadoSolicitudAdmin(solicitud.userId, solicitud.id, "CANCELADA")
    ); // NOSONAR

    // acceder al payload
    if (resultado.payload?.success) {
      alert("La solicitud ha sido cancelada correctamente.");
    } else {
      alert("No se pudo cancelar la solicitud.");
    }
  }
};


  const handleEliminar = async (solicitud) => {
    if (window.confirm("¿Está seguro de eliminar permanentemente esta solicitud? Esta acción no se puede deshacer.")) {
      const resultado = await dispatch(
        eliminarSolicitudAdmin(solicitud.userId, solicitud.id)
      ); // NOSONAR

      if (resultado.success) {
        alert("La solicitud ha sido eliminada correctamente.");
      } else {
        alert("No se pudo eliminar la solicitud.");
      }
    }
  };

  const handleVerDetalle = (solicitud) => {
    navigate(`/admin/detalle/${solicitud.userId}/${solicitud.id}`);
  };

  const handleEditarSolicitud = (solicitud) => {
    navigate(`/admin/editar/${solicitud.userId}/${solicitud.id}`);
  };

  const getEstadoClase = (estado) => {
    const clases = {
      BORRADOR: "estado-borrador",
      EN_VALIDACION: "estado-validacion",
      APROBADA: "estado-aprobada",
      RECHAZADA: "estado-rechazada",
      CANCELADA: "estado-cancelada",
    };
    return clases[estado] || "";
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatearMonto = (monto) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(monto);
  };

  return (
    <div className="lista-cdt">
      <div className="lista-cdt-header">
        <h2>Todas las Solicitudes de CDT</h2>
        <p className="total-solicitudes">
          Total: {solicitudesOrdenadas.length} solicitudes
        </p>
      </div>

      {/* Controles de filtrado y búsqueda */}
      <div className="lista-cdt-controles">
        <div className="control-busqueda">
          <input
            type="text"
            placeholder="Buscar por ID o nombre de cliente..."
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPaginaActual(1);
            }}
            className="input-busqueda"
          />
        </div>

        <div className="control-filtros">
          <select
            value={filtroEstado}
            onChange={(e) => {
              dispatch(setFiltroEstado(e.target.value));
              setPaginaActual(1);
            }}
            className="select-filtro"
          >
            <option value="TODOS">Todos los estados</option>
            <option value="BORRADOR">Borrador</option>
            <option value="EN_VALIDACION">En Validación</option>
            <option value="APROBADA">Aprobada</option>
            <option value="RECHAZADA">Rechazada</option>
            <option value="CANCELADA">Cancelada</option>
          </select>

          <select
            value={ordenPor}
            onChange={(e) => setOrdenPor(e.target.value)}
            className="select-orden" name="select-orden"
          >
            <option value="fecha">Ordenar por Fecha</option>
            <option value="monto">Ordenar por Monto</option>
            <option value="estado">Ordenar por Estado</option>
          </select>

          <button
            onClick={() => setOrdenDir(ordenDir === "asc" ? "desc" : "asc")}
            className="btn-orden-dir"
          >
            {ordenDir === "asc" ? "↑ Ascendente" : "↓ Descendente"}
          </button>
        </div>
      </div>

      {/* Lista de solicitudes */}
      {solicitudesPaginadas.length === 0 ? (
        <div className="mensaje-vacio">
          <p>No se encontraron solicitudes con los criterios seleccionados.</p>
        </div>
      ) : (
        <>
          <div className="tabla-solicitudes">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cliente</th>
                  <th>Fecha</th>
                  <th>Monto</th>
                  <th>Plazo</th>
                  <th>Tasa</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {solicitudesPaginadas.map((solicitud) => (
                  <tr key={solicitud.id}>
                    <td className="td-id">{solicitud.id.substring(0, 8)}...</td>
                    <td>{solicitud.displayName || "Usuario"}</td>
                    <td>{formatearFecha(solicitud.fechaSolicitud)}</td>
                    <td className="td-monto">{formatearMonto(solicitud.monto)}</td>
                    <td>{solicitud.plazo} meses</td>
                    <td>{solicitud.tasaInteres}%</td>
                    <td>
                      <span className={`estado-badge ${getEstadoClase(solicitud.estado)}`}>
                        {solicitud.estado.replace("_", " ")}
                      </span>
                    </td>
                    <td className="td-acciones">
                      <div className="acciones-grupo">
                        <button
                          onClick={() => navigate(`/admin/detalle/${solicitud.userId}/${solicitud.id}`)}
                          className="btn-accion btn-detalle"
                          title="Ver detalle"
                        >
                          👁️
                        </button>

                        

                        {solicitud.estado !== "APROBADA" && solicitud.estado !== "RECHAZADA" && (
                          <>
                            <button
                              onClick={() => handleCambiarEstado(solicitud, "APROBADA")}
                              className="btn-accion btn-aprobar"
                              title="Aprobar"
                            >
                              ✅
                            </button>
                            <button
                              onClick={() => handleCambiarEstado(solicitud, "RECHAZADA")}
                              className="btn-accion btn-rechazar"
                              title="Rechazar"
                            >
                              ❌
                            </button>
                            <button
                              onClick={() => handleCambiarEstado(solicitud, "EN_VALIDACION")}
                              className="btn-accion btn-validacion"
                              title="Poner en validación"
                            >
                              🔄
                            </button>
                          </>
                        )}

                        {solicitud.estado !== "CANCELADA" && (
                          <button
                            onClick={() => handleCancelar(solicitud)}
                            className="btn-accion btn-cancelar"
                            title="Cancelar"
                          >
                            🚫
                          </button>
                        )}

                        <button
                          onClick={() => handleEliminar(solicitud)}
                          className="btn-accion btn-eliminar"
                          title="Eliminar permanentemente"
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

          {/* Paginación */}
          {totalPaginas > 1 && (
            <div className="paginacion">
              <button
                onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
                disabled={paginaActual === 1}
                className="btn-paginacion"
              >
                ← Anterior
              </button>
              <span className="paginacion-info">
                Página {paginaActual} de {totalPaginas}
              </span>
              <button
                onClick={() => setPaginaActual((prev) => Math.min(prev + 1, totalPaginas))}
                disabled={paginaActual === totalPaginas}
                className="btn-paginacion"
              >
                Siguiente →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
