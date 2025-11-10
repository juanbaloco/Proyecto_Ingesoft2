/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DetalleCDT } from "../components/DetalleCDT";

// ===============================
// 🔹 MOCKS PRINCIPALES
// ===============================
const mockDispatch = jest.fn();
const mockNavigate = jest.fn();

jest.mock("react-redux", () => ({
  useDispatch: () => mockDispatch,
  useSelector: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  useParams: jest.fn(),
  useNavigate: () => mockNavigate,
}));

jest.mock("firebase/firestore", () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
}));

jest.mock("../firebase/config", () => ({
  db: {},
}));

import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";

// ===============================
// 🔹 SUITE DE TESTS
// ===============================
describe("🧩 DetalleCDT (modo bypass)", () => {
  const mockSolicitud = {
    id: "cdt1",
    monto: 5000000,
    plazo: 12,
    tasaInteres: 7.5,
    estado: "Borrador",
    interesEstimado: 100000,
    totalAlVencimiento: 5100000,
    fechaSolicitud: new Date("2025-11-10T12:00:00"),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --------------------------------------------------
  test("✅ muestra correctamente los datos de la solicitud desde Redux", async () => {
    useParams.mockReturnValue({ id: "cdt1" });
    useSelector.mockImplementation((selector) =>
      selector({
        auth: { uid: "user123" },
        cdt: { solicitudes: [mockSolicitud] },
      })
    );

    // Forzar que Firestore no interfiera
    getDoc.mockResolvedValue({ exists: () => false });

    render(<DetalleCDT />);

    await waitFor(() => {
      expect(screen.getByText(/5\.000\.000/)).toBeInTheDocument();
      expect(screen.getByText(/12 meses/)).toBeInTheDocument();
      expect(screen.getByText(/7\.50% E\.A\./)).toBeInTheDocument();
      expect(screen.getByText(/Borrador/)).toBeInTheDocument();
    });
  });

  // --------------------------------------------------
  test("✅ muestra mensaje de error si la solicitud no existe", async () => {
    useParams.mockReturnValue({ id: "no-existe" });
    useSelector.mockImplementation((selector) =>
      selector({
        auth: { uid: "user123" },
        cdt: { solicitudes: [] },
      })
    );

    getDoc.mockResolvedValue({ exists: () => false });

    render(<DetalleCDT />);

    await waitFor(() => {
      expect(screen.getByText(/Solicitud no encontrada/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Volver/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /Volver/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
  });

  // --------------------------------------------------
  test("✅ carga correctamente desde Firestore si no está en Redux", async () => {
    const firestoreSolicitud = {
      id: "fire1",
      data: () => ({
        monto: 8000000,
        plazo: 6,
        tasaInteres: 8,
        estado: "En Validación",
      }),
      exists: () => true,
    };

    useParams.mockReturnValue({ id: "fire1" });
    useSelector.mockImplementation((selector) =>
      selector({
        auth: { uid: "user123" },
        cdt: { solicitudes: [] },
      })
    );

    doc.mockReturnValue("mockDocRef");
    getDoc.mockResolvedValue(firestoreSolicitud);

    render(<DetalleCDT />);

    await waitFor(() => {
      expect(screen.getByText(/8\.000\.000/)).toBeInTheDocument();
      expect(screen.getByText(/6 meses/)).toBeInTheDocument();
      expect(screen.getByText(/8\.00% E\.A\./)).toBeInTheDocument();
      expect(screen.getByText(/En Validación/)).toBeInTheDocument();
    });
  });

  // --------------------------------------------------
  test("🔹 maneja errores al cargar de Firestore", async () => {
    useParams.mockReturnValue({ id: "cdt1" });
    useSelector.mockImplementation((sel) =>
      sel({
        cdt: { solicitudes: [] },
        auth: { uid: "user123" },
      })
    );

    getDoc.mockRejectedValue(new Error("Error Firestore"));

    render(<DetalleCDT />);

    // ✅ Esperamos a que el error se refleje en pantalla
    await waitFor(() => {
  expect(screen.getByText(/Error Firestore/i)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /Volver/i })).toBeInTheDocument();
});

  });

  // --------------------------------------------------
  test("✅ formatea correctamente valores vacíos y fechas", async () => {
    const solicitudSinFecha = {
      ...mockSolicitud,
      fechaSolicitud: null,
      interesEstimado: undefined,
      totalAlVencimiento: undefined,
    };

    useParams.mockReturnValue({ id: "cdt1" });
    useSelector.mockImplementation((selector) =>
      selector({
        auth: { uid: "user123" },
        cdt: { solicitudes: [solicitudSinFecha] },
      })
    );

    render(<DetalleCDT />);

    await waitFor(() => {
      expect(screen.getByText("-")).toBeInTheDocument();
    });
  });
});
