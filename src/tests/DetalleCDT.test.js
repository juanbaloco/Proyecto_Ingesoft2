// src/tests/DetalleCDT.test.jsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { DetalleCDT } from "../components/DetalleCDT";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";

jest.mock("react-redux");
jest.mock("react-router-dom", () => ({
  useParams: jest.fn(),
  useNavigate: jest.fn(),
}));

describe("DetalleCDT Component", () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
  });

  const mockSolicitud = {
    id: "abc123",
    monto: 1500000,
    plazo: 12,
    tasaInteres: 5.5,
    estado: "Aprobado",
    fechaSolicitud: new Date("2025-11-01T15:30:00"),
  };

  test("muestra mensaje cuando no se encuentra la solicitud", () => {
    useParams.mockReturnValue({ id: "no-existe" });
    useSelector.mockReturnValue({ solicitudes: [mockSolicitud] }); // no coincide id

    render(<DetalleCDT />);
    expect(screen.getByText("Detalle de Solicitud")).toBeInTheDocument();
    expect(screen.getByText("No se encontró la solicitud.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Volver" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Volver" }));
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
  });

 // src/tests/DetalleCDT.test.jsx (corrección en matchers flexibles)

test("muestra detalles correctamente para la solicitud encontrada", () => {
  useParams.mockReturnValue({ id: "abc123" });
  useSelector.mockReturnValue({ solicitudes: [mockSolicitud] });

  render(<DetalleCDT />);

  expect(screen.getByText("Detalle de Solicitud")).toBeInTheDocument();

  expect(screen.getByText(mockSolicitud.id)).toBeInTheDocument();

  expect(
    screen.getByText((content) => content.includes("1.500.000"))
  ).toBeInTheDocument();

  // Para plazo y meses, busca el elemento padre que contenga ambos
  expect(
    screen.getByText((content, element) =>
      content.includes("12") && content.includes("meses") && element.style.fontWeight === "800"
    )
  ).toBeInTheDocument();

  expect(
    screen.getByText((content) => content.includes("5.5") && content.includes("% E.A."))
  ).toBeInTheDocument();

  expect(screen.getByText(mockSolicitud.estado)).toBeInTheDocument();

  const formattedDate = mockSolicitud.fechaSolicitud.toLocaleString("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const partialDate = formattedDate.split(",")[0];
  expect(
    screen.getByText((content) => content.includes(partialDate))
  ).toBeInTheDocument();

  const btnVolver = screen.getByRole("button", { name: /volver/i });
  const btnEditar = screen.getByRole("button", { name: /editar/i });

  expect(btnVolver).toBeInTheDocument();
  expect(btnEditar).toBeInTheDocument();

  fireEvent.click(btnVolver);
  expect(mockNavigate).toHaveBeenCalledWith("/dashboard");

  fireEvent.click(btnEditar);
  expect(mockNavigate).toHaveBeenCalledWith(`/cdt/${mockSolicitud.id}/editar`);
});



  test("maneja fechas sin método toDate", () => {
    const solicitudSinToDate = {
      ...mockSolicitud,
      fechaSolicitud: "2025-12-25T10:00:00",
    };

    useParams.mockReturnValue({ id: "abc123" });
    useSelector.mockReturnValue({ solicitudes: [solicitudSinToDate] });

    render(<DetalleCDT />);
    const formattedDate = new Date(solicitudSinToDate.fechaSolicitud).toLocaleString("es-CO", {
      dateStyle: "medium",
      timeStyle: "short",
    });
    const partialDate = formattedDate.split(",")[0];
    expect(
      screen.getByText((content) => content.includes(partialDate))
    ).toBeInTheDocument();
  });

  test("muestra '-' cuando no hay fechaSolicitud", () => {
    const solicitudSinFecha = {
      ...mockSolicitud,
      fechaSolicitud: null,
    };

    useParams.mockReturnValue({ id: "abc123" });
    useSelector.mockReturnValue({ solicitudes: [solicitudSinFecha] });

    render(<DetalleCDT />);
    expect(screen.getByText("-")).toBeInTheDocument();
  });
});
