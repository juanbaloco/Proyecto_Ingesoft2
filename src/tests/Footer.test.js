import React from "react";
import { render, screen } from "@testing-library/react";
import { Footer } from "../components/Footer";

describe("Footer Component", () => {
  beforeEach(() => {
    render(<Footer />);
  });

  it("muestra el título principal", () => {
    expect(screen.getByText("NeoBank")).toBeInTheDocument();
  });

  it("muestra la descripción del footer", () => {
    expect(
      screen.getByText(
        "Tu aliado financiero de confianza. Soluciones innovadoras para hacer crecer tu patrimonio."
      )
    ).toBeInTheDocument();
  });

  it("muestra la sección de Contacto con email, teléfono y ubicación", () => {
    expect(screen.getByText("Contacto")).toBeInTheDocument();
    expect(screen.getByText("contacto@neobank.com")).toHaveAttribute(
      "href",
      "mailto:contacto@neobank.com"
    );
    expect(screen.getByText("+57 (300) 123-4567")).toHaveAttribute(
      "href",
      "tel:+573001234567"
    );
    expect(screen.getByText("Cali, Valle del Cauca, Colombia")).toBeInTheDocument();
  });

  it("muestra la sección de Horario de Atención con los textos correctos", () => {
    expect(screen.getByText("Horario de Atención")).toBeInTheDocument();
    expect(screen.getByText("Lunes - Viernes: 8:00 AM - 6:00 PM")).toBeInTheDocument();
    expect(screen.getByText("Sábados: 9:00 AM - 1:00 PM")).toBeInTheDocument();
    expect(screen.getByText("Domingos: Cerrado")).toBeInTheDocument();
  });

  it("muestra el texto con el año actual y derechos reservados", () => {
    const currentYear = new Date().getFullYear();
    expect(
      screen.getByText(`© ${currentYear} NeoBank. Todos los derechos reservados.`)
    ).toBeInTheDocument();
  });

  it("muestra los enlaces legales con sus textos", () => {
    expect(screen.getByText("Términos y Condiciones")).toHaveAttribute("href", "#");
    expect(screen.getByText("Política de Privacidad")).toHaveAttribute("href", "#");
    expect(screen.getByText("Protección de Datos")).toHaveAttribute("href", "#");
  });
});
