import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Dashboard } from "../components/Dashboard";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutAuth } from "../store/thunks/logout";
import { clearCdtState } from "../store/slices/cdtSlice";
import { cargarSolicitudesCDT } from "../store/thunks/cdtThunk";

// 🧩 Mocks
jest.mock("react-redux", () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

jest.mock("../store/thunks/logout", () => ({
  logoutAuth: jest.fn(() => ({ type: "logoutAuth" })),
}));

jest.mock("../store/thunks/cdtThunk", () => ({
  cargarSolicitudesCDT: jest.fn((uid) => ({ type: "cargarSolicitudesCDT", payload: uid })),
}));

jest.mock("../store/slices/cdtSlice", () => ({
  clearCdtState: jest.fn(() => ({ type: "clearCdtState" })),
}));

jest.mock("../components/FormularioCDT", () => ({
  FormularioCDT: () => <div data-testid="formulario">FormularioCDT</div>,
}));

jest.mock("../components/ListaCDT", () => ({
  ListaCDT: () => <div data-testid="lista">ListaCDT</div>,
}));

jest.mock("../components/Footer", () => ({
  Footer: () => <div data-testid="footer">Footer</div>,
}));

describe("Dashboard Component", () => {
  const mockDispatch = jest.fn();
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useDispatch.mockReturnValue(mockDispatch);
    useNavigate.mockReturnValue(mockNavigate);
  });

  test("🔹 redirige a /login si no está autenticado", () => {
    useSelector.mockImplementation((selector) =>
      selector({
        auth: { status: "not-authenticated", role: "user" },
        cdt: { solicitudes: [] },
      })
    );

    render(<Dashboard />);
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  test("🔹 redirige a /admin/dashboard si el rol es admin", () => {
    useSelector.mockImplementation((selector) =>
      selector({
        auth: { status: "authenticated", role: "admin", uid: "123" },
        cdt: { solicitudes: [] },
      })
    );

    render(<Dashboard />);
    expect(mockNavigate).toHaveBeenCalledWith("/admin/dashboard");
  });

  test("🔹 carga solicitudes si autenticado como usuario normal", () => {
    useSelector.mockImplementation((selector) =>
      selector({
        auth: { status: "authenticated", displayName: "Juan", uid: "u1", role: "user" },
        cdt: { solicitudes: [{ id: 1 }, { id: 2 }] },
      })
    );

    render(<Dashboard />);

    expect(mockDispatch).toHaveBeenCalledWith(cargarSolicitudesCDT("u1"));
    expect(screen.getByText("NeoBank - NeoCDT")).toBeInTheDocument();
    expect(screen.getByText("Juan")).toBeInTheDocument();
    expect(screen.getByTestId("formulario")).toBeInTheDocument();
    expect(screen.getByTestId("lista")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();
  });

  test("🔹 no renderiza nada si no está autenticado o es admin", () => {
    useSelector.mockImplementation((selector) =>
      selector({
        auth: { status: "checking", role: "user" },
        cdt: { solicitudes: [] },
      })
    );

    const { container } = render(<Dashboard />);
    expect(container.firstChild).toBeNull();
  });

  test("🔹 ejecuta logout y limpia el estado al hacer clic", () => {
    useSelector.mockImplementation((selector) =>
      selector({
        auth: { status: "authenticated", displayName: "Carlos", uid: "abc", role: "user" },
        cdt: { solicitudes: [] },
      })
    );

    render(<Dashboard />);
    const button = screen.getByText("Cerrar Sesión");
    fireEvent.click(button);

    expect(mockDispatch).toHaveBeenCalledWith(clearCdtState());
    expect(mockDispatch).toHaveBeenCalledWith(logoutAuth());
  });
});

