import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { loginWithEmailAndPassword } from "../store/thunks/loginAuth";
import { loginWithGoogle } from "../store/thunks/loginGoogle";
import { Link, useNavigate } from "react-router-dom";

export const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status } = useSelector((state) => state.auth);

  const [formState, setFormState] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState("");

  const { email, password } = formState;

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
    setLoginError("");
  };

  const validateForm = () => {
    const newErrors = {};

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");

    if (!validateForm()) {
      return;
    }

    try {
      await dispatch(loginWithEmailAndPassword(email, password));//NOSONAR
    } catch (error) {
      setLoginError("Correo o contraseña incorrectos. Por favor, intenta de nuevo.");
    }
  };

  const onGoogleLogin = async () => {
    try {
      await dispatch(loginWithGoogle());//NOSONAR
    } catch (error) {
      setLoginError("Error al iniciar sesión con Google. Intenta de nuevo.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">NeoBank - Iniciar Sesión</h1>
        <p className="auth-subtitle">Ingresando a NeoCDT</p>

        {loginError && <div className="auth-error-message">{loginError}</div>}

        <form onSubmit={onLoginSubmit} className="auth-form">
          <div className="auth-form-group">
            <label htmlFor="email" className="auth-label">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="ejemplo@correo.com"
              value={email}
              onChange={onInputChange}
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
              type="password"
              name="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={onInputChange}
              className={`auth-input ${errors.password ? "auth-input-error" : ""}`}
            />
            {errors.password && (
              <span className="auth-error-text">{errors.password}</span>
            )}
          </div>

          <button type="submit" className="auth-submit-button">
            Entrar
          </button>
        </form>

        <div className="auth-divider">
          <span>o</span>
        </div>

        <button onClick={onGoogleLogin} className="auth-google-button">
          Iniciar con Google
        </button>

        <p className="auth-footer">
          ¿No tienes cuenta?{" "}
          <Link to="/registro" className="auth-link">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
};
