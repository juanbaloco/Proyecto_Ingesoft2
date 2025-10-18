
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { DetalleCDT } from "../components/DetalleCDT";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";

// Mock de los hooks de Redux y React Router
jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useSelector: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: jest.fn(),
  useNavigate: () => mockNavigate,
}));

describe("Componente DetalleCDT", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("muestra mensaje cuando no se encuentra la solicitud", () => {
    useParams.mockReturnValue({ id: "abc" });
    useSelector.mockReturnValue({ solicitudes: [] });

    render(<DetalleCDT />);

    expect(screen.getByText("No se encontró la solicitud.")).toBeInTheDocument();
    expect(screen.getByText("Volver")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Volver"));
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
  });

  test("muestra los detalles de la solicitud correctamente", () => {
    const solicitud = {
      id: "123",
      monto: 5000000,
      plazo: 12,
      tasaInteres: 9.5,
      estado: "Aprobado",
      fechaSolicitud: new Date("2025-03-01T12:00:00"),
    };

    useParams.mockReturnValue({ id: "123" });
    useSelector.mockReturnValue({ solicitudes: [solicitud] });

    render(<DetalleCDT />);

    expect(screen.getByText("Detalle de Solicitud")).toBeInTheDocument();
    expect(screen.getByText("123")).toBeInTheDocument();
    expect(screen.getByText("Aprobado")).toBeInTheDocument();
    expect(screen.getByText(/9.5%/)).toBeInTheDocument();

    fireEvent.click(screen.getByText("Editar"));
    expect(mockNavigate).toHaveBeenCalledWith("/cdt/123/editar");

    fireEvent.click(screen.getByText("← Volver"));
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});const formatCOP = (v) =>
  new Intl.NumberFormat("es-CO", { 
    style: "currency", 
    currency: "COP", 
    maximumFractionDigits: 0 
  }).format(v || 0);

describe('DetalleCDT - Función formatCOP', () => {
  
  describe('Formateo de valores válidos', () => {
    it('debe formatear correctamente el valor 1000000', () => {
      const resultado = formatCOP(1000000);
      expect(resultado).toBe('$\u00A01.000.000');
    });

    it('debe formatear correctamente el valor 500000000', () => {
      const resultado = formatCOP(500000000);
      expect(resultado).toBe('$\u00A0500.000.000');
    });
  });
});