import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { EditarCDT } from "../components/EditarCDT";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

// Mock de thunks
jest.mock("../store/thunks/cdtThunk", () => ({
  actualizarSolicitudCDT: jest.fn(() => async () => ({ success: true })),
  cargarSolicitudesCDT: jest.fn(() => async () => Promise.resolve()),
}));

const mockDispatch = jest.fn(() =>
  new Promise((resolve) => setTimeout(() => resolve({ success: true }), 20))
);
const mockNavigate = jest.fn();

// Mocks jest.fn() estáticos iniciales para hooks
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
  useParams: jest.fn(),
}));

describe("EditarCDT Component", () => {
  let selectorState;

  beforeEach(() => {
    // Estado simulado mutable
    selectorState = {
      cdt: {
        solicitudes: [
          { id: "123", monto: 1000000, plazo: 12, tasaInteres: 12.5 },
        ],
      },
      auth: { uid: "user1" },
    };

    // Implementación dinámica de useSelector y useDispatch
    useSelector.mockImplementation((selector) => selector(selectorState));
    useDispatch.mockReturnValue(mockDispatch);

    // Implementación dinámica de useNavigate y useParams
    useNavigate.mockReturnValue(mockNavigate);
    useParams.mockReturnValue({ id: "123" });

    // Limpiar mocks
    mockNavigate.mockClear();
    mockDispatch.mockClear();
  });

  it("renders form with data from redux state", () => {
  render(<EditarCDT />);
  expect(screen.getByPlaceholderText("10.000.000").value).toBe("1000000");
  expect(screen.getByRole("combobox").value).toBe("12");
  expect(screen.getByText(/12.5% E\.A\./i)).toBeInTheDocument();
});

  it("loads solicitudes if empty on mount", () => {
    selectorState = {
      cdt: { solicitudes: [] },
      auth: { uid: "user1" },
    };
    useSelector.mockImplementation((selector) => selector(selectorState));
    render(<EditarCDT />);
    expect(mockDispatch).toHaveBeenCalled();
  });

  it("updates form fields on user input", () => {
  render(<EditarCDT />);
  const montoInput = screen.getByPlaceholderText("10.000.000");
  fireEvent.change(montoInput, { target: { name: "monto", value: "2000000" } });
  expect(montoInput.value).toBe("2000000");

  const plazoSelect = screen.getByRole("combobox"); // Selecciona el único select disponible
  fireEvent.change(plazoSelect, { target: { name: "plazo", value: "18" } });
  expect(plazoSelect.value).toBe("18");

  expect(screen.getByText(/12.8% E\.A\./i)).toBeInTheDocument();
});


  it("does not call dispatch or navigate if monto is invalid", async () => {
    render(<EditarCDT />);
    const montoInput = screen.getByPlaceholderText("10.000.000");

    fireEvent.change(montoInput, { target: { name: "monto", value: "100" } });
    expect(montoInput.value).toBe("100");  // monto inválido

    const form = document.querySelector("form");

    await act(async () => {
      fireEvent.submit(form);
    });

    expect(mockDispatch).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });



it("shows loading state on submit", async () => {
  const { container } = render(<EditarCDT />);
  const submitButton = screen.getByRole("button", { name: /Guardar cambios/i });
  const form = container.querySelector("form");

  await act(async () => {
    fireEvent.submit(form);
  });

  await waitFor(() => {
    expect(submitButton).toBeDisabled();
    expect(submitButton.textContent).toBe("Guardando...");
  });
});

it("shows loading state on submit", async () => {
  const { container } = render(<EditarCDT />);
  const submitButton = screen.getByRole("button", { name: /Guardar cambios/i });
  const form = container.querySelector("form");

  await act(async () => {
    fireEvent.submit(form);
  });

  await waitFor(() => {
    expect(submitButton).toBeDisabled();
    expect(submitButton.textContent).toBe("Guardando...");
  });
});

  it("renders loading message if solicitud not found", () => {
    selectorState = {
      cdt: { solicitudes: [] },
      auth: { uid: "user1" },
    };
    useSelector.mockImplementation((selector) => selector(selectorState));
    useParams.mockReturnValue({ id: "not-exist" });
    render(<EditarCDT />);
    expect(screen.getByText(/Cargando o no existe el registro/i)).toBeInTheDocument();
  });
});
