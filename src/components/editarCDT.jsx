// src/components/EditarCDT.jsx
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { actualizarSolicitudCDT } from "../store/thunks/cdtThunk";
import { cargarSolicitudesCDT } from "../store/thunks/cdtThunk";

export const EditarCDT = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const { solicitudes } = useSelector((s) => s.cdt);
  const { uid } = useSelector((s) => s.auth);

  const [form, setForm] = useState({ monto: "", plazo: "", tasaInteres: "" });
  const [guardando, setGuardando] = useState(false);

  const plazosMes = [
    { meses: 6, label: "6 meses", tasa: 11.0 },
    { meses: 12, label: "12 meses", tasa: 12.5 },
    { meses: 18, label: "18 meses", tasa: 12.8 },
    { meses: 24, label: "24 meses", tasa: 13.2 },
  ];

  // Cargar si no hay solicitudes en memoria
  useEffect(() => {
    if (uid && (!solicitudes || solicitudes.length === 0)) {
      dispatch(cargarSolicitudesCDT(uid));
    }
  }, [uid, solicitudes?.length, dispatch]);

  const solicitud = (solicitudes || []).find((x) => x.id === id);

  useEffect(() => {
    if (solicitud) {
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
      setForm((f) => ({ ...f, plazo: Number(value), tasaInteres: p?.tasa ?? "" }));
    } else {
      setForm((f) => ({ ...f, [name]: name === "monto" ? value.replace(/\D/g, "") : value }));
    }
  };

  const formatCOP = (v) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(Number(v || 0));

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
    if (!m || m < 250000 || m > 500000000) return "Monto entre $250.000 y $500.000.000";
    if (!form.plazo) return "Seleccione un plazo";
    return null;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const v = validar();
    if (v) return alert(v);
    setGuardando(true);
    const r = await dispatch(
      actualizarSolicitudCDT({
        id,
        cambios: {
          monto: Number(form.monto),
          plazo: Number(form.plazo),
          tasaInteres: Number(form.tasaInteres),
        },
      })
    );
    setGuardando(false);
    if (r?.success) {
      alert("Solicitud actualizada");
      navigate(`/cdt/${id}`);
    } else {
      alert(r?.error || "No fue posible actualizar");
    }
  };

  if (!solicitud) {
    return (
      <div className="dashboard-section" style={{ margin: 16 }}>
        <div className="dashboard-section-title">Editar Solicitud</div>
        <div className="card-sub">Cargando o no existe el registro…</div>
        <div style={{ marginTop: 12 }}>
          <button className="btn-ghost" onClick={() => navigate("/dashboard")}>Volver</button>
        </div>
      </div>
    );
  }

  return (
    <div className="formulario-cdt-container" style={{ margin: 16 }}>
      <div className="dashboard-section-title" style={{ border: "none", padding: 0, marginBottom: 10 }}>
        Editar Solicitud CDT
      </div>

      <form onSubmit={onSubmit} className="formulario-cdt-form">
        <div className="formulario-cdt-form-group">
          <label className="formulario-cdt-label">Monto (COP)</label>
          <input
            className="formulario-cdt-input"
            name="monto"
            value={form.monto}
            onChange={onChange}
            placeholder="10.000.000"
            inputMode="numeric"
          />
          <small className="formulario-cdt-info-text">Rango permitido: $250.000 a $500.000.000</small>
        </div>

        <div className="formulario-cdt-form-group">
          <label className="formulario-cdt-label">Plazo (meses)</label>
          <select className="formulario-cdt-select" name="plazo" value={form.plazo} onChange={onChange} required>
            <option value="">Seleccione plazo</option>
            {plazosMes.map((p) => (
              <option key={p.meses} value={p.meses}>{p.label}</option>
            ))}
          </select>
        </div>

        <div className="formulario-cdt-info-box">
          La tasa E.A. se actualiza automáticamente según el plazo seleccionado.
        </div>

        <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", marginTop: 10 }}>
          <div className="dashboard-section">
            <div className="formulario-cdt-info-title">Monto</div>
            <div style={{ fontWeight: 800 }}>{formatCOP(form.monto)}</div>
          </div>
          <div className="dashboard-section">
            <div className="formulario-cdt-info-title">Tasa</div>
            <div style={{ fontWeight: 800 }}>{form.tasaInteres ? `${form.tasaInteres}% E.A.` : "-"}</div>
          </div>
          <div className="dashboard-section">
            <div className="formulario-cdt-info-title">Total estimado</div>
            <div style={{ fontWeight: 800 }}>{formatCOP(resumen.total)}</div>
          </div>
        </div>

        <div className="formulario-cdt-button-group" style={{ marginTop: 12 }}>
          <button type="button" className="formulario-cdt-cancel-button" onClick={() => navigate(-1)}>Cancelar</button>
          <button type="submit" className="formulario-cdt-submit-button" disabled={guardando}>
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>
    </div>
  );
};
