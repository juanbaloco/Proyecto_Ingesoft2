import { useDispatch, useSelector } from "react-redux";
import { registerAuth } from "../store/thunks/registerAuth";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export const Registro = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status } = useSelector((state) => state.auth);

  const [formState, setFormState] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    displayName: "",
  });

  const [errors, setErrors] = useState({});

  const { email, password, confirmPassword, displayName } = formState;

  useEffect(() => {
    if (status === "authenticated") {
      navigate("/dashboard");
    }
  }, [status, navigate]);

  const onInputChange = (evt) => {
    const { name, value } = evt.target;
    setFormState({
      ...formState,
      [name]: value,
    });

    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!displayName.trim()) {
      newErrors.displayName = "El nombre es requerido";
    } else if (displayName.trim().length < 3) {
      newErrors.displayName = "El nombre debe tener al menos 3 caracteres";
    }

    if (!email.trim()) {
      newErrors.email = "El correo es requerido";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "El correo no es válido";
    }

    if (!password) {
      newErrors.password = "La contraseña es requerida";
    } else if (password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirma tu contraseña";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    await dispatch(registerAuth(email, password, displayName));//NOSONAR
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">NeoBank - Registro</h1>
        <p className="auth-subtitle">Crea tu cuenta NeoBank</p>

        <form onSubmit={onSubmit} className="auth-form">
          <div className="auth-form-group">
            <label htmlFor="displayName" className="auth-label">
              Nombre completo
            </label>
            <input
              id="displayName"
              name="displayName"
              type="text"
              placeholder="Juan Pérez"
              onChange={onInputChange}
              value={displayName}
              className={`auth-input ${errors.displayName ? "auth-input-error" : ""}`}
            />
            {errors.displayName && (
              <span className="auth-error-text">{errors.displayName}</span>
            )}
          </div>

          <div className="auth-form-group">
            <label htmlFor="email" className="auth-label">
              Correo electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="ejemplo@correo.com"
              onChange={onInputChange}
              value={email}
              className={`auth-input ${errors.email ? "auth-input-error" : ""}`}
            />
            {errors.email && (
              <span className="auth-error-text">{errors.email}</span>
            )}
          </div>

          <div className="auth-form-group">
            <label htmlFor="password" className="auth-label">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Mínimo 6 caracteres"
              onChange={onInputChange}
              value={password}
              className={`auth-input ${errors.password ? "auth-input-error" : ""}`}
            />
            {errors.password && (
              <span className="auth-error-text">{errors.password}</span>
            )}
          </div>

          <div className="auth-form-group">
            <label htmlFor="confirmPassword" className="auth-label">
              Confirmar contraseña
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Confirma tu contraseña"
              onChange={onInputChange}
              value={confirmPassword}
              className={`auth-input ${errors.confirmPassword ? "auth-input-error" : ""}`}
            />
            {errors.confirmPassword && (
              <span className="auth-error-text">{errors.confirmPassword}</span>
            )}
          </div>

          <button type="submit" className="auth-submit-button">
            Registrarse
          </button>
        </form>

        <p className="auth-footer">
          ¿Ya tienes una cuenta?{" "}
          <Link to="/login" className="auth-link">
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
  );
};
