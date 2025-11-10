// src/components/InitAdmin.jsx
import { useState } from "react";
import { createInitialAdmin, promoteToAdmin } from "../utils/initializeAdmin";

export const InitAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [emailToPromote, setEmailToPromote] = useState("");

  const handleCreateInitialAdmin = async () => {
    setLoading(true);
    setMessage("Creando administrador inicial...");

    const result = await createInitialAdmin();

    if (result.success) {
      setMessage(`✅ ${result.message}\n\n` +
        `📧 Email: admin@neobank.com\n` +
        `🔑 Contraseña: Admin123456\n\n` +
        `⚠️ IMPORTANTE: Cambia la contraseña después del primer login`
      );
    } else {
      setMessage(`❌ Error: ${result.error}`);
    }

    setLoading(false);
  };

  const handlePromoteUser = async (e) => {
    e.preventDefault();

    if (!emailToPromote.trim()) {
      setMessage("❌ Por favor ingresa un email válido");
      return;
    }

    setLoading(true);
    setMessage("Promoviendo usuario a administrador...");

    const result = await promoteToAdmin(emailToPromote);

    if (result.success) {
      setMessage(`✅ ${result.message}\n📧 ${emailToPromote} ahora es administrador`);
      setEmailToPromote("");
    } else {
      setMessage(`❌ Error: ${result.error || result.message}`);
    }

    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🔧 Configuración de Administradores</h1>
        <p style={styles.subtitle}>
          Esta página solo debe usarse durante la configuración inicial del sistema
        </p>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>1. Crear Administrador Inicial</h2>
          <p style={styles.description}>
            Crea el primer usuario administrador del sistema con credenciales predeterminadas.
          </p>
          <button 
            onClick={handleCreateInitialAdmin}
            disabled={loading}
            style={styles.button}
          >
            {loading ? "Creando..." : "Crear Admin Inicial"}
          </button>
        </div>

        <div style={styles.divider}></div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>2. Promover Usuario Existente</h2>
          <p style={styles.description}>
            Convierte un usuario cliente existente en administrador.
          </p>
          <form onSubmit={handlePromoteUser} style={styles.form}>
            <input
              type="email"
              placeholder="email@ejemplo.com"
              value={emailToPromote}
              onChange={(e) => setEmailToPromote(e.target.value)}
              style={styles.input}
              disabled={loading}
            />
            <button 
              type="submit"
              disabled={loading}
              style={styles.button}
            >
              {loading ? "Promoviendo..." : "Promover a Admin"}
            </button>
          </form>
        </div>

        {message && (
          <div style={styles.messageBox}>
            <pre style={styles.message}>{message}</pre>
          </div>
        )}

        <div style={styles.warning}>
          <strong>⚠️ Advertencia de Seguridad:</strong>
          <p>
            Esta página debe ser eliminada o protegida en producción. 
            Solo debe usarse durante la configuración inicial del sistema.
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    padding: "20px",
    backgroundColor: "#f5f5f5",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    maxWidth: "600px",
    width: "100%",
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "40px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  title: {
    fontSize: "28px",
    marginBottom: "10px",
    color: "#333",
  },
  subtitle: {
    fontSize: "14px",
    color: "#666",
    marginBottom: "30px",
  },
  section: {
    marginBottom: "30px",
  },
  sectionTitle: {
    fontSize: "20px",
    marginBottom: "10px",
    color: "#444",
  },
  description: {
    fontSize: "14px",
    color: "#666",
    marginBottom: "15px",
    lineHeight: "1.6",
  },
  form: {
    display: "flex",
    gap: "10px",
  },
  input: {
    flex: 1,
    padding: "12px 16px",
    fontSize: "14px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    outline: "none",
  },
  button: {
    padding: "12px 24px",
    fontSize: "14px",
    fontWeight: "600",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  divider: {
    height: "1px",
    backgroundColor: "#e0e0e0",
    margin: "30px 0",
  },
  messageBox: {
    marginTop: "20px",
    padding: "20px",
    backgroundColor: "#f8f9fa",
    borderRadius: "6px",
    border: "1px solid #dee2e6",
  },
  message: {
    margin: 0,
    fontSize: "13px",
    fontFamily: "monospace",
    whiteSpace: "pre-wrap",
    color: "#333",
  },
  warning: {
    marginTop: "30px",
    padding: "15px",
    backgroundColor: "#fff3cd",
    border: "1px solid #ffc107",
    borderRadius: "6px",
    fontSize: "13px",
    color: "#856404",
  },
};
