// src/components/__tests__/FormularioCDT.test.jsx

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { FormularioCDT } from "../components/FormularioCDT";
import * as redux from "react-redux";
import * as router from "react-router-dom";
import * as slices from "../store/slices/cdtSlice";
import * as thunks from "../store/thunks/cdtThunk";

// Mockear Firebase Analytics para tests
// Mock Firebase Analytics para tests
jest.mock("firebase/analytics", () => ({
  getAnalytics: jest.fn(() => null),
  isSupported: jest.fn(() => Promise.resolve(false)),
}));

const mockUseDispatch = jest.fn();
const mockUseSelector = jest.fn();

jest.mock("react-redux", () => ({
  useDispatch: () => mockUseDispatch,
  useSelector: (selector) => mockUseSelector(selector),
}));

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

afterEach(() => {
  jest.clearAllMocks();
});

describe("FormularioCDT", () => {
  beforeEach(() => {
    mockUseSelector.mockImplementation((selector) =>
      selector({
        cdt: { solicitudActual: null, error: "" },
        auth: { uid: "testid", displayName: "Test User" },
      })
    );
  });

  test("valida formulario y muestra error si hay campo vacío", async () => {
  render(<FormularioCDT />);

  // No llenar campos, solo dispara submit
  fireEvent.click(screen.getByRole("button", { name: /guardar solicitud/i }));

  // Espera que la UI muestre un mensaje de error (e.g. un texto con la palabra "Seleccione")
  await waitFor(() => {
    expect(screen.getByText(/Seleccione un producto/i)).toBeInTheDocument();
  });
});




  it("renderiza inputs y botones correctamente", () => {
    render(<FormularioCDT />);
    expect(screen.getAllByRole("combobox")[0]).toBeInTheDocument(); // Producto select
    expect(screen.getByPlaceholderText(/10\.000\.000/i)).toBeInTheDocument(); // Monto input
    expect(screen.getAllByRole("combobox")[1]).toBeInTheDocument(); // Plazo select
    expect(screen.getByRole("button", { name: /guardar solicitud/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancelar/i })).toBeInTheDocument();
  });

  it("ejecuta dispatch para crear solicitud en onSubmit", async () => {
    mockUseDispatch.mockResolvedValue({ success: true });
    const { container } = render(<FormularioCDT />);

    fireEvent.change(screen.getAllByRole("combobox")[0], { target: { value: "tradicional" } });
    fireEvent.change(screen.getByPlaceholderText(/10\.000\.000/i), { target: { value: "300000" } });
    fireEvent.change(screen.getAllByRole("combobox")[1], { target: { value: "6" } });

    const form = container.querySelector("form");
    fireEvent.submit(form);

    await waitFor(() => expect(mockUseDispatch).toHaveBeenCalled());
    expect(screen.getByText(/Solicitud creada|Solicitud actualizada/i)).toBeInTheDocument();
  });

  it("navega a dashboard al cancelar", () => {
    render(<FormularioCDT />);
    fireEvent.click(screen.getByRole("button", { name: /cancelar/i }));
    expect(mockUseDispatch).toHaveBeenCalledWith(slices.clearSolicitudActual());
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
  });
});