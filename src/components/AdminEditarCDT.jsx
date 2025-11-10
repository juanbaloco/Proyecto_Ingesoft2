import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { actualizarSolicitudAdmin } from "../store/thunks/adminThunk";

export const AdminEditarCDT = () => {
  const { userId, solicitudId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { role } = useSelector((state) => state.auth);

  const [formState, setFormState] = useState({
    monto: "",
    plazo: "",
    tasaInteres: "",
    estado: "BORRADOR",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (role !== "admin") {
      navigate("/dashboard");
      return;
    }

    const cargarSolicitud = async () => {
      try {
        setLoading(true);
        const solicitudRef = doc(db, "usuarios", userId, "solicitudesCDT", solicitudId);
        const solicitudDoc = await getDoc(solicitudRef);

        if (solicitudDoc.exists()) {
          const data = solicitudDoc.data();
          setFormState({
            monto: data.monto || "",
            plazo: data.plazo || "",
            tasaInteres: data.tasaInteres || "",
            estado: data.estado || "BORRADOR",
          });
        } else {
          alert("Solicitud no encontrada");
          navigate("/admin/dashboard");
        }
      } catch (err) {
        console.error("Error al cargar solicitud:", err);
        alert("Error al cargar la solicitud");
        navigate("/admin/dashboard");
      } finally {
        setLoading(false);
      }
    };

    cargarSolicitud();
  }, [userId, solicitudId, role, navigate]);

  const onInputChange = (evt) => {
    const { name, value } = evt.target;
    setFormState({
      ...formState,
      [name]: value,
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validar monto
    if (!formState.monto) {
      newErrors.monto = "El monto es obligatorio";
    } else if (isNaN(formState.monto) || Number(formState.monto) <= 0) {
      newErrors.monto = "El monto debe ser un número mayor a 0";
    } else if (Number(formState.monto) < 1000000) {
      newErrors.monto = "El monto mínimo es $1,000,000";
    } else if (Number(formState.monto) > 500000000) {
      newErrors.monto = "El monto máximo es $500,000,000";
    }

    // Validar plazo
    if (!formState.plazo) {
      newErrors.plazo = "El plazo es obligatorio";
    } else if (isNaN(formState.plazo) || Number(formState.plazo) <= 0) {
      newErrors.plazo = "El plazo debe ser un número mayor a 0";
    } else if (Number(formState.plazo) < 3) {
      newErrors.plazo = "El plazo mínimo es 3 meses";
    } else if (Number(formState.plazo) > 60) {
      newErrors.plazo = "El plazo máximo es 60 meses";
    }

    // Validar tasa
    if (!formState.tasaInteres) {
      newErrors.tasaInteres = "La tasa de interés es obligatoria";
    } else if (isNaN(formState.tasaInteres) || Number(formState.tasaInteres) <= 0) {
      newErrors.tasaInteres = "La tasa debe ser un número mayor a 0";
    } else if (Number(formState.tasaInteres) < 0.1) {
      newErrors.tasaInteres = "La tasa mínima es 0.1%";
    } else if (Number(formState.tasaInteres) > 20) {
      newErrors.tasaInteres = "La tasa máxima es 20%";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();

    if (!validateForm()) {
      return;
    }

    setGuardando(true);

    try {
      const datosActualizados = {
        monto: Number(formState.monto),
        plazo: Number(formState.plazo),
        tasaInteres: Number(formState.tasaInteres),
        estado: formState.estado,
      };

      const resultado = await dispatch(
        actualizarSolicitudAdmin(userId, solicitudId, datosActualizados)
      );

      if (resultado.success) {
        alert("Los cambios se han guardado correctamente.");
        navigate(`/admin/detalle/${userId}/${solicitudId}`);
      } else {
        alert("No fue posible guardar los cambios. Intenta nuevamente.");
      }
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Error al guardar los cambios");
    } finally {
      setGuardando(false);
    }
  };

  const handleCancelar = () => {
    if (window.confirm("¿Descartar los cambios?")) {
      navigate(`/admin/detalle/${userId}/${solicitudId}`);
    }
  };

  if (loading) {
    return (
      <div className="auth-loading-container">
        <div className="auth-loading-spinner">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Editar Solicitud CDT</h1>
          <p className="dashboard-subtitle">Panel de Administrador</p>
        </div>
        <div className="dashboard-user-info">
          <button onClick={handleCancelar} className="dashboard-logout-button">
            ← Cancelar
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        <section className="dashboard-section">
          <h2 className="dashboard-section-title">Modificar Datos del CDT</h2>
          
          <form onSubmit={handleSubmit} className="formulario-cdt-form">
            <div className="formulario-cdt-form-group">
              <label className="formulario-cdt-label">
                Monto del CDT <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                type="number"
                name="monto"
                value={formState.monto}
                onChange={onInputChange}
                placeholder="Ej: 5000000"
                className={errors.monto ? "formulario-cdt-input formulario-cdt-input-error" : "formulario-cdt-input"}
              />
              {errors.monto && <span className="formulario-cdt-error-text">{errors.monto}</span>}
              <small className="formulario-cdt-info-text">Monto entre $1,000,000 y $500,000,000</small>
            </div>

            <div className="formulario-cdt-form-group">
              <label className="formulario-cdt-label">
                Plazo (en meses) <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                type="number"
                name="plazo"
                value={formState.plazo}
                onChange={onInputChange}
                placeholder="Ej: 12"
                className={errors.plazo ? "formulario-cdt-input formulario-cdt-input-error" : "formulario-cdt-input"}
              />
              {errors.plazo && <span className="formulario-cdt-error-text">{errors.plazo}</span>}
              <small className="formulario-cdt-info-text">Plazo entre 3 y 60 meses</small>
            </div>

            <div className="formulario-cdt-form-group">
              <label className="formulario-cdt-label">
                Tasa de Interés (% anual) <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                type="number"
                step="0.01"
                name="tasaInteres"
                value={formState.tasaInteres}
                onChange={onInputChange}
                placeholder="Ej: 5.5"
                className={errors.tasaInteres ? "formulario-cdt-input formulario-cdt-input-error" : "formulario-cdt-input"}
              />
              {errors.tasaInteres && <span className="formulario-cdt-error-text">{errors.tasaInteres}</span>}
              <small className="formulario-cdt-info-text">Tasa entre 0.1% y 20%</small>
            </div>

            <div className="formulario-cdt-form-group">
              <label className="formulario-cdt-label">
                Estado de la Solicitud <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <select
                name="estado"
                value={formState.estado}
                onChange={onInputChange}
                className="formulario-cdt-select"
              >
                <option value="BORRADOR">Borrador</option>
                <option value="EN_VALIDACION">En Validación</option>
                <option value="APROBADA">Aprobada</option>
                <option value="RECHAZADA">Rechazada</option>
                <option value="CANCELADA">Cancelada</option>
              </select>
              <small className="formulario-cdt-info-text">Como administrador puedes cambiar el estado directamente</small>
            </div>

            <div className="formulario-cdt-button-group">
              <button
                type="button"
                onClick={handleCancelar}
                className="formulario-cdt-cancel-button"
                disabled={guardando}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="formulario-cdt-submit-button"
                disabled={guardando}
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
