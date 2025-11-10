// src/components/FormularioCDT.jsx
import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearSolicitudActual } from "../store/slices/cdtSlice";
import { crearSolicitudCDT, actualizarSolicitudCDT } from "../store/thunks/cdtThunk";

export const FormularioCDT = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { solicitudActual, error } = useSelector((s) => s.cdt);
  const { uid, displayName } = useSelector((s) => s.auth);

  const productos = [{ id: "tradicional", label: "CDT Tradicional" }];

  const plazosMes = [
    { meses: 6, label: "6 meses", tasa: 11.0 },
    { meses: 12, label: "12 meses", tasa: 12.5 },
    { meses: 18, label: "18 meses", tasa: 12.8 },
    { meses: 24, label: "24 meses", tasa: 13.2 },
  ];

  const [form, setForm] = useState({ producto: "", monto: "", plazo: "", tasaInteres: "" });
  const [ok, setOk] = useState("");

  useEffect(() => {
    if (solicitudActual) {
      setForm({
        producto: "tradicional",
        monto: String(solicitudActual.monto || ""),
        plazo: Number(solicitudActual.plazo) || "",
        tasaInteres: solicitudActual.tasaInteres,
      });
    } else {
      setForm({ producto: "", monto: "", plazo: "", tasaInteres: "" });
    }
  }, [solicitudActual]);

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
    if (!uid) return "Usuario no autenticado";
    if (!form.producto) return "Seleccione un producto";
    if (!m || m < 250000 || m > 500000000) return "Monto entre $250.000 y $500.000.000";
    if (!form.plazo) return "Seleccione un plazo";
    return null;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setOk("");
    const v = validar();
    if (v) return alert(v);

    const data = {
      monto: Number(form.monto),
      plazo: Number(form.plazo),
      tasaInteres: Number(form.tasaInteres),
      estado: solicitudActual?.estado || "Borrador",
      displayName,
    };

    const res = solicitudActual
      ? await dispatch(actualizarSolicitudCDT({ id: solicitudActual.id, cambios: data }))//NOSONAR
      : await dispatch(crearSolicitudCDT(data));//NOSONAR

    if (res?.success) {
      setOk(solicitudActual ? "Solicitud actualizada" : "Solicitud creada");
      setTimeout(() => {
        setOk("");
        dispatch(clearSolicitudActual());
        navigate("/dashboard");
      }, 800);
    } else {
      alert(res?.error || "Ocurrió un error");
    }
  };

  const onClearForm = () => {
    setForm({ producto: "", monto: "", plazo: "", tasaInteres: "" });
    dispatch(clearSolicitudActual());
  };

  return (
    <div className="formulario-cdt-container">
      <form onSubmit={onSubmit} className="formulario-cdt-form">
        {/* Producto */}
        <div className="formulario-cdt-form-group">
          <label className="formulario-cdt-label">Producto</label>
          <select className="formulario-cdt-select" name="producto" value={form.producto} onChange={onChange} required>
            <option value="">Seleccione un producto</option>
            {productos.map((p) => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
        </div>

        {/* Monto */}
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

        {/* Plazo */}
        <div className="formulario-cdt-form-group">
          <label className="formulario-cdt-label">Plazo (meses)</label>
          <select className="formulario-cdt-select" name="plazo" value={form.plazo} onChange={onChange} required>
            <option value="">Seleccione plazo</option>
            {plazosMes.map((p) => (
              <option key={p.meses} value={p.meses}>{p.label}</option>
            ))}
          </select>
        </div>

        {/* Info */}
        <div className="formulario-cdt-info-box">
          La tasa E.A. se asigna automáticamente según el plazo seleccionado.
        </div>

        {/* Resumen */}
        <div className="dashboard-section-title" style={{ border: "none", padding: 0, marginTop: 10 }}>
          Resumen y Confirmación
        </div>

        <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          <div className="dashboard-section">
            <div className="formulario-cdt-info-title">Monto solicitado</div>
            <div style={{ fontWeight: 800 }}>{formatCOP(form.monto)}</div>
          </div>

          <div className="dashboard-section">
            <div className="formulario-cdt-info-title">Tasa de interés</div>
            <div style={{ fontWeight: 800 }}>{form.tasaInteres ? `${form.tasaInteres}% E.A.` : "-"}</div>
          </div>

          <div className="dashboard-section">
            <div className="formulario-cdt-info-title">Intereses estimados</div>
            <div style={{ fontWeight: 800, color: "#16A34A" }}>{formatCOP(resumen.intereses)}</div>
          </div>

          <div className="dashboard-section">
            <div className="formulario-cdt-info-title">Plazo</div>
            <div style={{ fontWeight: 800 }}>{form.plazo ? `${form.plazo} meses` : "-"}</div>
          </div>

          <div className="dashboard-section">
            <div className="formulario-cdt-info-title">Total al vencimiento</div>
            <div style={{ fontWeight: 800 }}>{formatCOP(resumen.total)}</div>
          </div>
        </div>

        {/* Mensajes */}
        {error && <div className="formulario-cdt-error-message" style={{ marginTop: 10 }}>{error}</div>}
        {ok && <div className="formulario-cdt-success-message" style={{ marginTop: 10 }}>{ok}</div>}

        {/* Botones */}
        <div className="formulario-cdt-button-group">
          <button type="button" className="formulario-cdt-cancel-button" onClick={onClearForm}>Borrar Selección</button>
          <button type="submit" className="formulario-cdt-submit-button">
            {solicitudActual ? "Guardar cambios" : "Guardar solicitud"}
          </button>
        </div>
      </form>
    </div>
  );
};
