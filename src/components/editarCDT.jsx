import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { actualizarSolicitudCDT, cargarSolicitudesCDT } from "../store/thunks/cdtThunk";

export const EditarCDT = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { solicitudes } = useSelector((s) => s.cdt);
  const { uid } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ monto: "", plazo: "", tasaInteres: "" });
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const plazosMes = [
    { meses: 6, label: "6 meses", tasa: 11.0 },
    { meses: 12, label: "12 meses", tasa: 12.5 },
    { meses: 18, label: "18 meses", tasa: 12.8 },
    { meses: 24, label: "24 meses", tasa: 13.2 },
  ];

  useEffect(() => {
    if (uid && !solicitudes?.length) {
      console.log("Cargando solicitudes para editar...");
      const cargar = async () => {
        try {
          await dispatch(cargarSolicitudesCDT(uid));//NOSONAR
          setCargando(false);
        } catch (err) {
          console.error("Error cargando solicitudes:", err);
          setError(err.message);
          setCargando(false);
        }
      };
      cargar();
    } else {
      setCargando(false);
    }
  }, [uid, dispatch, solicitudes?.length]);

  const solicitud = (solicitudes || []).find((x) => x.id === id);

  useEffect(() => {
    if (solicitud) {
      console.log("Solicitud encontrada:", solicitud);
      setForm({
        monto: String(solicitud.monto || ""),
        plazo: Number(solicitud.plazo) || "",
        tasaInteres: Number(solicitud.tasaInteres) || "",
      });
    }
  }, [solicitud]);

  const onChange = (e) => {
    const { name, value } = e.target;
    if (name === "plazo") {
      const p = plazosMes.find((x) => x.meses === Number(value));
      setForm((f) => ({
        ...f,
        plazo: Number(value),
        tasaInteres: p?.tasa ?? "",
      }));
    } else {
      setForm((f) => ({
        ...f,
        [name]: name === "monto" ? value.replace(/\D/g, "") : value,
      }));
    }
  };

  const formatCOP = (v) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(Number(v || 0));

  const resumen = useMemo(() => {
    const monto = Number(form.monto || 0);
    const EAR = Number(form.tasaInteres || 0) / 100;
    const dias = Math.round((Number(form.plazo || 0) / 12) * 365);
    const r = Math.pow(1 + EAR, dias / 365) - 1;
    const intereses = monto * r;
    return { intereses, total: monto + intereses };
  }, [form.monto, form.plazo, form.tasaInteres]);

  const validar = () => {
    const m = Number(form.monto || 0);
    if (!solicitud) return "No se encontró la solicitud";

    // ✅ CORREGIDO: Permitir editar "Borrador" y "En Validación"
    const estadosEditables = ["Borrador", "En Validación", "BORRADOR", "EN_VALIDACION"];
    if (!estadosEditables.includes(solicitud.estado)) {
      return `No se puede editar una solicitud en estado ${solicitud.estado}`;
    }

    if (!m || m < 250000 || m > 500000000)
      return "Monto entre $250.000 y $500.000.000";
    if (!form.plazo) return "Seleccione un plazo";
    return null;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const v = validar();
    if (v) return alert(v);

    setGuardando(true);
    console.log("Actualizando solicitud:", { id, form });

    const r = await dispatch(
      actualizarSolicitudCDT(id, {
        monto: Number(form.monto),
        plazo: Number(form.plazo),
        tasaInteres: Number(form.tasaInteres),
        estado: solicitud.estado,
      })
    ); // NOSONAR

    setGuardando(false);
    if (r?.success) {
      alert("✅ Solicitud actualizada correctamente");
      navigate(`/cdt/${id}`);
    } else {
      alert("❌ " + (r?.error || "No fue posible actualizar"));
    }
  };

  if (cargando) {
    return (
      <div className="auth-loading-container">
        <div className="auth-loading-spinner">Cargando solicitud...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <main className="dashboard-content">
          <section className="dashboard-section">
            <h2 className="dashboard-section-title" style={{ color: "#EF4444" }}>❌ Error</h2>
            <p style={{ marginBottom: "20px" }}>{error}</p>
            <button onClick={() => navigate("/dashboard")} className="formulario-cdt-cancel-button">
              Volver al Dashboard
            </button>
          </section>
        </main>
      </div>
    );
  }

  if (!solicitud) {
    return (
      <div className="dashboard-container">
        <main className="dashboard-content">
          <section className="dashboard-section">
            <h2 className="dashboard-section-title" style={{ color: "#EF4444" }}>❌ Solicitud no encontrada</h2>
            <p style={{ marginBottom: "20px" }}>ID: {id}</p>
            <button onClick={() => navigate("/dashboard")} className="formulario-cdt-cancel-button">
              Volver al Dashboard
            </button>
          </section>
        </main>
      </div>
    );
  }

  // ✅ CORREGIDO: Permitir editar "Borrador" y "En Validación"
  const estadosEditables = ["Borrador", "En Validación", "BORRADOR", "EN_VALIDACION"];
  if (!estadosEditables.includes(solicitud.estado)) {
    return (
      <div className="dashboard-container">
        <main className="dashboard-content">
          <section className="dashboard-section">
            <h2 className="dashboard-section-title" style={{ color: "#EF4444" }}>❌ No se puede editar</h2>
            <p style={{ marginBottom: "10px" }}>
              La solicitud está en estado: <strong>{solicitud.estado}</strong>
            </p>
            <p style={{ marginBottom: "20px" }}>Solo se pueden editar solicitudes en Borrador o En Validación</p>
            <button onClick={() => navigate("/dashboard")} className="formulario-cdt-cancel-button">
              Volver al Dashboard
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
          <h1 className="dashboard-title">Editar Solicitud CDT</h1>
          <p className="dashboard-subtitle">
            Solicitud: {solicitud.id.substring(0, 8)}... | Estado: {solicitud.estado}
          </p>
        </div>
        <div className="dashboard-user-info">
          <button onClick={() => navigate("/dashboard")} className="dashboard-logout-button">
            ← Volver al Dashboard
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        <section className="dashboard-section">
          <h2 className="dashboard-section-title">Modificar Datos</h2>
          
          <form onSubmit={onSubmit} className="formulario-cdt-form">
            <div className="formulario-cdt-form-group">
              <label className="formulario-cdt-label">Monto (COP)</label>
              <input
                className="formulario-cdt-input"
                name="monto"
                value={form.monto}
                onChange={onChange}
                disabled={guardando}
                placeholder="10.000.000"
                inputMode="numeric"
              />
              <small className="formulario-cdt-info-text">Rango permitido: $250.000 a $500.000.000</small>
            </div>

            <div className="formulario-cdt-form-group">
              <label className="formulario-cdt-label">Plazo (meses)</label>
              <select
                className="formulario-cdt-select"
                name="plazo"
                value={form.plazo || ""}
                onChange={onChange}
                disabled={guardando}
                required
              >
                <option value="">Seleccione plazo</option>
                {plazosMes.map((p) => (
                  <option key={p.meses} value={p.meses}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="formulario-cdt-form-group">
              <label className="formulario-cdt-label">Tasa de Interés (E.A.)</label>
              <input
                className="formulario-cdt-input formulario-cdt-readonly"
                value={form.tasaInteres ? `${form.tasaInteres}%` : ""}
                disabled
              />
              <small className="formulario-cdt-info-text">Se asigna automáticamente según el plazo</small>
            </div>

            <div className="formulario-cdt-info-box">
              La tasa E.A. se asigna automáticamente según el plazo seleccionado.
            </div>

            <div className="dashboard-section-title" style={{ border: "none", padding: 0, marginTop: 20 }}>
              Resumen y Confirmación
            </div>

            <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
              <div className="dashboard-section" style={{ padding: "16px" }}>
                <div className="formulario-cdt-info-title">Monto solicitado</div>
                <div style={{ fontWeight: 800, fontSize: "1.1em" }}>{formatCOP(form.monto)}</div>
              </div>

              <div className="dashboard-section" style={{ padding: "16px" }}>
                <div className="formulario-cdt-info-title">Tasa de interés</div>
                <div style={{ fontWeight: 800, fontSize: "1.1em" }}>{form.tasaInteres ? `${form.tasaInteres}% E.A.` : "-"}</div>
              </div>

              <div className="dashboard-section" style={{ padding: "16px" }}>
                <div className="formulario-cdt-info-title">Intereses estimados</div>
                <div style={{ fontWeight: 800, color: "#16A34A", fontSize: "1.1em" }}>{formatCOP(resumen.intereses)}</div>
              </div>

              <div className="dashboard-section" style={{ padding: "16px" }}>
                <div className="formulario-cdt-info-title">Plazo</div>
                <div style={{ fontWeight: 800, fontSize: "1.1em" }}>{form.plazo ? `${form.plazo} meses` : "-"}</div>
              </div>

              <div className="dashboard-section" style={{ padding: "16px" }}>
                <div className="formulario-cdt-info-title">Total al vencimiento</div>
                <div style={{ fontWeight: 800, fontSize: "1.1em" }}>{formatCOP(resumen.total)}</div>
              </div>
            </div>

            <div className="formulario-cdt-button-group">
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                disabled={guardando}
                className="formulario-cdt-cancel-button"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={guardando}
                className="formulario-cdt-submit-button"
              >
                {guardando ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
};