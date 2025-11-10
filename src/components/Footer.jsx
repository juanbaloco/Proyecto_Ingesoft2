export const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <div className="footer-section">
          <h3 className="footer-title">NeoBank</h3>
          <p className="footer-description">
            Tu aliado financiero de confianza. Soluciones innovadoras para hacer crecer tu patrimonio.
          </p>
        </div>

        <div className="footer-section">
          <h4 className="footer-section-title">Contacto</h4>
          <ul className="footer-list">
            <li className="footer-list-item">
              <span className="footer-icon">📧</span>
              <a href="mailto:contacto@neobank.com" className="footer-link">
                contacto@neobank.com
              </a>
            </li>
            <li className="footer-list-item">
              <span className="footer-icon">📞</span>
              <a href="tel:+573001234567" className="footer-link">
                +57 (300) 123-4567
              </a>
            </li>
            <li className="footer-list-item">
              <span className="footer-icon">📍</span>
              <span className="footer-text">
                Cali, Valle del Cauca, Colombia
              </span>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h4 className="footer-section-title">Horario de Atención</h4>
          <ul className="footer-list">
            <li className="footer-list-item">
              <span className="footer-text">Lunes - Viernes: 8:00 AM - 6:00 PM</span>
            </li>
            <li className="footer-list-item">
              <span className="footer-text">Sábados: 9:00 AM - 1:00 PM</span>
            </li>
            <li className="footer-list-item">
              <span className="footer-text">Domingos: Cerrado</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p className="footer-copyright">
          © {new Date().getFullYear()} NeoBank. Todos los derechos reservados.
        </p>
        <div className="footer-legal">
          <a href="#" className="footer-legal-link">Términos y Condiciones</a>
          <span className="footer-separator">|</span>
          <a href="#" className="footer-legal-link">Política de Privacidad</a>
          <span className="footer-separator">|</span>
          <a href="#" className="footer-legal-link">Protección de Datos</a>
        </div>
      </div>
    </footer>
  );
};
