// src/tests/AdminDashboard.test.js
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AdminDashboard } from "../components/AdminDashboard";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AdminListaCDT } from "../components/AdminListaCDT";
import { Footer } from "../components/Footer";
import { clearCdtState } from "../store/slices/cdtSlice";
import { logoutAuth } from "../store/thunks/logout";
import { cargarTodasSolicitudesCDT } from "../store/thunks/cdtThunk";

jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

jest.mock("../components/AdminListaCDT", () => ({
  AdminListaCDT: jest.fn(() => <div>AdminListaCDT Mock</div>),
}));

jest.mock("../components/Footer", () => ({
  Footer: jest.fn(() => <div>Footer Mock</div>),
}));

jest.mock("../store/thunks/logout", () => ({
  logoutAuth: jest.fn(() => ({ type: "LOGOUT" })),
}));

jest.mock("../store/thunks/cdtThunk", () => ({
  cargarTodasSolicitudesCDT: jest.fn(() => ({ type: "CARGAR_SOLICITUDES" })),
}));

jest.mock("../store/slices/cdtSlice", () => ({
  clearCdtState: jest.fn(() => ({ type: "CLEAR_CDT" })),
}));

describe("AdminDashboard", () => {
  const mockDispatch = jest.fn();
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useDispatch.mockReturnValue(mockDispatch);
    useNavigate.mockReturnValue(mockNavigate);
    useSelector.mockImplementation((selectorFn) =>
      selectorFn({
        auth: {
          status: "authenticated",
          displayName: "AdminUser",
          role: "admin",
        },
      })
    );
  });

  test("renders title, subtitle, user info, and loading state initially", async () => {
    render(<AdminDashboard />);

    expect(screen.getByText("NeoBank - Panel de Administrador")).toBeInTheDocument();
    expect(screen.getByText("Gestión de Solicitudes de CDT")).toBeInTheDocument();
    expect(screen.getByText(/AdminUser \(Admin\)/)).toBeInTheDocument();
    expect(screen.getByText("Cargando solicitudes...")).toBeInTheDocument();

    await waitFor(() => {
  expect(mockDispatch).toHaveBeenCalledWith(
    expect.objectContaining({ type: "CARGAR_SOLICITUDES" })
  );
});

  });

  test("renders AdminListaCDT and Footer after loading", async () => {
    render(<AdminDashboard />);

    // Simula el final de la carga
    await waitFor(() => {
      expect(screen.getByText("AdminListaCDT Mock")).toBeInTheDocument();
      expect(screen.getByText("Footer Mock")).toBeInTheDocument();
    });
  });

  test("calls dispatch clearCdtState and logoutAuth on logout button click", async () => {
    render(<AdminDashboard />);

    const button = screen.getByText("Cerrar Sesión");
    fireEvent.click(button);

    expect(mockDispatch).toHaveBeenCalledWith(clearCdtState());
    expect(mockDispatch).toHaveBeenCalledWith(logoutAuth());
  });

  test("redirects to /login if not authenticated or not admin", () => {
    useSelector.mockImplementation((selectorFn) =>
      selectorFn({
        auth: {
          status: "not-authenticated",
          displayName: "AdminUser",
          role: "client",
        },
      })
    );

    render(<AdminDashboard />);
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });
});
