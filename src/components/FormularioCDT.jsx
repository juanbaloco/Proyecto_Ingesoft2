import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearSolicitudActual } from "../store/slices/cdtSlice";
import { crearSolicitudCDT, actualizarSolicitudCDT } from "../store/thunks/cdtThunk";

export const FormularioCDT = () => {
  const dispatch = useDispatch();
  const { uid, displayName } = useSelector((state) => state.auth);
  const { solicitudActual, status, error } = useSelector((state) => state.cdt);

  const plazoOpciones = [
    { dias: 90, tasa: 6.5, label: "90 días" },
    { dias: 180, tasa: 8, label: "180 días" },
    { dias: 360, tasa: 12, label: "360 días" },
  ];

  const [formState, setFormState] = useState({
    monto: "",
    plazo: "",
    tasaInteres: "",
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  const { monto, plazo, tasaInteres } = formState;

  useEffect(() => {
    if (solicitudActual) {
      setFormState({
        monto: solicitudActual.monto.toString(),
        plazo: solicitudActual.plazo.toString(),
        tasaInteres: solicitudActual.tasaInteres.toString(),
      });
    }
  }, [solicitudActual]);

  const onInputChange = (evt) => {
    const { name, value } = evt.target;
    
    if (name === "plazo") {
      const opcionSeleccionada = plazoOpciones.find(
        (op) => op.dias.toString() === value
      );
      setFormState({
        ...formState,
        plazo: value,
        tasaInteres: opcionSeleccionada ? opcionSeleccionada.tasa.toString() : "",
      });
    } else {
      setFormState({
        ...formState,
        [name]: value,
      });
    }
    
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: "",
      });
    }
  };

  const validateForm = () => {
    const errors = {};

    const montoNum = parseFloat(monto);
    if (!monto || isNaN(montoNum)) {
      errors.monto = "El monto es requerido";
    } else if (montoNum <= 0) {
      errors.monto = "El monto debe ser mayor a 0";
    } else if (montoNum < 250000) {
      errors.monto = "El monto mínimo es $250,000 COP";
    } else if (montoNum > 500000000) {
      errors.monto = "El monto máximo es $500,000,000 COP";
    }

    if (!plazo) {
      errors.plazo = "Debes seleccionar un plazo";
    } else {
      const plazoValido = plazoOpciones.some(
        (op) => op.dias.toString() === plazo
      );
      if (!plazoValido) {
        errors.plazo = "Plazo no válido";
      }
    }

    if (!tasaInteres) {
      errors.tasaInteres = "La tasa de interés debe estar asignada";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");

    if (!validateForm()) {
      return;
    }
    
    if (solicitudActual) {
      // Actualizar solicitud existente en Firestore
      const resultado = await dispatch(actualizarSolicitudCDT(
        solicitudActual.id,
        {
          monto: parseFloat(monto),
          plazo: parseInt(plazo),
          tasaInteres: parseFloat(tasaInteres),
        }
      ));
      
      if (resultado.success) {
        setSuccessMessage("Solicitud actualizada exitosamente");
      } else {
        setSuccessMessage("Error al actualizar la solicitud");
      }
    } else {
      const resultado = await dispatch(crearSolicitudCDT({
        monto: parseFloat(monto),
        plazo: parseInt(plazo),
        tasaInteres: parseFloat(tasaInteres),
        userId: uid,
        displayName,
        estado: "PENDIENTE",
      }));
      
      if (resultado.success) {
        setSuccessMessage("Solicitud creada exitosamente");
      } else {
        setSuccessMessage("Error al crear la solicitud");
      }
    }

    resetForm();
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const resetForm = () => {
    setFormState({
      monto: "",
      plazo: "",
      tasaInteres: "",
    });
    setValidationErrors({});
    if (solicitudActual) {
      dispatch(clearSolicitudActual());
    }
  };

  const handleCancel = () => {
    resetForm();
  };

  return (
    <div className="formulario-cdt-container">
      <form onSubmit={handleSubmit} className="formulario-cdt-form">
        <div className="formulario-cdt-form-group">
          <label htmlFor="monto" className="formulario-cdt-label">
            Monto (COP)
          </label>
          <input
            id="monto"
            name="monto"
            type="number"
            placeholder="Ej: 5000000"
            value={monto}
            onChange={onInputChange}
            className={`formulario-cdt-input ${validationErrors.monto ? "formulario-cdt-input-error" : ""}`}
            min="250000"
            max="500000000"
            step="1"
          />
          {validationErrors.monto && (
            <span className="formulario-cdt-error-text">{validationErrors.monto}</span>
          )}
          <small style={{ fontSize: "12px", color: "#7f8c8d" }}>
            Mínimo: $250,000 - Máximo: $500,000,000
          </small>
        </div>

        <div className="formulario-cdt-form-group">
          <label htmlFor="plazo" className="formulario-cdt-label">
            Plazo de Inversión
          </label>
          <select
            id="plazo"
            name="plazo"
            value={plazo}
            onChange={onInputChange}
            className={`formulario-cdt-select ${validationErrors.plazo ? "formulario-cdt-input-error" : ""}`}
          >
            <option value="">Selecciona un plazo</option>
            {plazoOpciones.map((opcion) => (
              <option key={opcion.dias} value={opcion.dias}>
                {opcion.label}
              </option>
            ))}
          </select>
          {validationErrors.plazo && (
            <span className="formulario-cdt-error-text">{validationErrors.plazo}</span>
          )}
          <small style={{ fontSize: "12px", color: "#7f8c8d" }}>
            La tasa de interés se asigna automáticamente según el plazo
          </small>
        </div>

        <div className="formulario-cdt-form-group">
          <label htmlFor="tasaInteres" className="formulario-cdt-label">
            Tasa de Rendimiento Efectivo Anual
          </label>
          <div style={{
            padding: "12px",
            fontSize: "18px",
            fontWeight: "600",
            color: "#27ae60",
            backgroundColor: "#e8f8f5",
            borderRadius: "4px",
            textAlign: "center",
            border: "2px solid #27ae60"
          }}>
            {tasaInteres ? `${tasaInteres}% Efectivo Anual` : "Selecciona un plazo primero"}
          </div>
        </div>

        {error && <div className="formulario-cdt-error-message">{error}</div>}
        {successMessage && (
          <div className="formulario-cdt-success-message">{successMessage}</div>
        )}

        <div className="formulario-cdt-button-group">
          <button type="submit" className="formulario-cdt-submit-button">
            {solicitudActual ? "Actualizar Solicitud" : "Crear Solicitud"}
          </button>
          {solicitudActual && (
            <button
              type="button"
              onClick={handleCancel}
              className="formulario-cdt-cancel-button"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
