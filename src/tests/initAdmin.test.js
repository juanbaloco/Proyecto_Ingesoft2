// src/tests/InitAdmin.test.js
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { InitAdmin } from "../components/InitAdmin";

// ===== MOCK UTILS =====
jest.mock("../utils/initializeAdmin", () => ({
  createInitialAdmin: jest.fn(),
  promoteToAdmin: jest.fn(),
}));

import { createInitialAdmin, promoteToAdmin } from "../utils/initializeAdmin";

describe("InitAdmin", () => {
  beforeEach(() => {
    createInitialAdmin.mockReset();
    promoteToAdmin.mockReset();
  });

  test("renderiza correctamente los botones y inputs", () => {
    render(<InitAdmin />);
    
    expect(screen.getByText(/Crear Admin Inicial/i)).toBeInTheDocument();
    expect(screen.getByText(/Promover a Admin/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email@ejemplo.com/i)).toBeInTheDocument();
  });

  test("crea el administrador inicial y muestra mensaje de éxito", async () => {
    createInitialAdmin.mockResolvedValue({
      success: true,
      message: "Administrador inicial creado",
    });

    render(<InitAdmin />);

    const crearBtn = screen.getByText(/Crear Admin Inicial/i);
    fireEvent.click(crearBtn);

    expect(crearBtn).toHaveTextContent(/Creando.../i);

    await waitFor(() => {
      expect(createInitialAdmin).toHaveBeenCalled();
      expect(screen.getByText(/✅ Administrador inicial creado/)).toBeInTheDocument();
      expect(screen.getByText(/admin@neobank.com/i)).toBeInTheDocument();
    });
  });

  test("muestra error si falla la creación de admin inicial", async () => {
    createInitialAdmin.mockResolvedValue({
      success: false,
      error: "Error al crear admin",
    });

    render(<InitAdmin />);

    const crearBtn = screen.getByText(/Crear Admin Inicial/i);
    fireEvent.click(crearBtn);

    await waitFor(() => {
      expect(createInitialAdmin).toHaveBeenCalled();
      expect(screen.getByText(/❌ Error: Error al crear admin/)).toBeInTheDocument();
    });
  });

  test("promueve un usuario existente y muestra mensaje de éxito", async () => {
    promoteToAdmin.mockResolvedValue({
      success: true,
      message: "Usuario promovido",
    });

    render(<InitAdmin />);

    const input = screen.getByPlaceholderText(/email@ejemplo.com/i);
    const promoteBtn = screen.getByText(/Promover a Admin/i);

    fireEvent.change(input, { target: { value: "usuario@correo.com" } });
    fireEvent.click(promoteBtn);

    expect(promoteBtn).toHaveTextContent(/Promoviendo.../i);

    await waitFor(() => {
      expect(promoteToAdmin).toHaveBeenCalledWith("usuario@correo.com");
      expect(screen.getByText(/✅ Usuario promovido/)).toBeInTheDocument();
      expect(screen.getByText(/usuario@correo.com ahora es administrador/)).toBeInTheDocument();
    });
  });

  test("muestra error si no se ingresa email al promover", async () => {
    render(<InitAdmin />);

    const promoteBtn = screen.getByText(/Promover a Admin/i);
    fireEvent.click(promoteBtn);

    await waitFor(() => {
      expect(screen.getByText(/❌ Por favor ingresa un email válido/)).toBeInTheDocument();
      expect(promoteToAdmin).not.toHaveBeenCalled();
    });
  });

  test("muestra error si falla la promoción de usuario", async () => {
    promoteToAdmin.mockResolvedValue({
      success: false,
      error: "No se pudo promover",
    });

    render(<InitAdmin />);

    const input = screen.getByPlaceholderText(/email@ejemplo.com/i);
    const promoteBtn = screen.getByText(/Promover a Admin/i);

    fireEvent.change(input, { target: { value: "usuario@correo.com" } });
    fireEvent.click(promoteBtn);

    await waitFor(() => {
      expect(promoteToAdmin).toHaveBeenCalledWith("usuario@correo.com");
      expect(screen.getByText(/❌ Error: No se pudo promover/)).toBeInTheDocument();
    });
  });
});
