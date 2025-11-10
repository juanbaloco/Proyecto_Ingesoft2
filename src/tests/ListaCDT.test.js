// __tests__/ListaCDT.test.jsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ListaCDT } from "../components/ListaCDT";
import * as reactRedux from "react-redux";
import * as router from "react-router-dom";
import * as cdtThunk from "../store/thunks/cdtThunk";

jest.mock("../store/thunks/cdtThunk");

const mockDispatch = jest.fn();
const mockNavigate = jest.fn();
jest.mock("react-redux", () => {
  const original = jest.requireActual("react-redux");
  return {
    __esModule: true,
    ...original,
    useDispatch: () => mockDispatch,
    useSelector: jest.fn(),
  };
});

jest.mock("react-router-dom", () => {
  const original = jest.requireActual("react-router-dom");
  return {
    __esModule: true,
    ...original,
    useNavigate: () => mockNavigate,
  };
});

// Crear un mock para eliminarSolicitudCDT, que retorna función que llamaremos
// Crea las funciones mock thunk una vez
const eliminarMock1 = jest.fn(() => Promise.resolve({ success: true }));
const eliminarMock2 = jest.fn(() => Promise.resolve({ success: false }));

// Mockea la función thunk para devolver siempre las mismas funciones mock
cdtThunk.eliminarSolicitudCDT = jest.fn((id) => {
  if (id === "1") return eliminarMock1;
  if (id === "2") return eliminarMock2;
  return jest.fn(() => Promise.resolve({ success: true }));
});
describe("ListaCDT Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    reactRedux.useSelector.mockImplementation((selector) =>
      selector({
        cdt: {
          solicitudes: [
            {
              id: "1",
              monto: 1200000,
              plazo: 12,
              tasaInteres: 5.5,
              estado: "Aprobado",
              fechaSolicitud: new Date("2025-10-01T12:30:00Z"),
            },
            {
              id: "2",
              monto: 500000,
              plazo: 3,
              tasaInteres: 4.2,
              estado: "Borrador",
              fechaSolicitud: null,
            },
          ],
          status: "idle",
        },
        auth: {
          uid: "user123",
        },
      })
    );

    // mockDispatch retorna objeto con unwrap que llama al thunk mock
    mockDispatch.mockImplementation((thunkFunction) => ({
      unwrap: () => thunkFunction(),
    }));
  });

  test("carga solicitudes y muestra lista", () => {
  render(<ListaCDT />);
  expect(mockDispatch).toHaveBeenCalledWith(cdtThunk.cargarSolicitudesCDT("user123"));

  // quitar esto porque no existe
  // expect(screen.getByText("Solicitudes CDT")).toBeInTheDocument();

  // verificar que la tabla tiene los datos cargados
  expect(screen.getByText(/\$?\s?1\.200\.000/)).toBeInTheDocument();
  expect(screen.getByText("12 meses")).toBeInTheDocument();
  expect(screen.getByText("5.5%")).toBeInTheDocument();
});


  test("filtra por estado", () => {
    render(<ListaCDT />);
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "Borrador" } });

    expect(screen.queryByText(/\$?\s?1\.?200\.?000/)).not.toBeInTheDocument();
    expect(screen.getByText(/\$?\s?500\.?000/)).toBeInTheDocument();
  });

  test("busca por término", () => {
  render(<ListaCDT />);
  const input = screen.getByPlaceholderText("🔍 Buscar por monto o plazo"); // <-- ajustar aquí
  fireEvent.change(input, { target: { value: "12" } });

  expect(screen.getByText(/\$?\s?1\.?200\.?000/)).toBeInTheDocument();
  expect(screen.queryByText(/\$?\s?500\.?000/)).not.toBeInTheDocument();
});


  test("mensaje 'No hay resultados' si no hay visibles", () => {
    reactRedux.useSelector.mockImplementationOnce((selector) =>
      selector({ cdt: { solicitudes: [], status: "idle" }, auth: { uid: "user123" } })
    );
    render(<ListaCDT />);
    expect(screen.getByText("No hay resultados")).toBeInTheDocument();
  });

  test("botones Ver, Editar y Eliminar funcionan correctamente", async () => {
  window.confirm = jest.fn(() => true);
  window.alert = jest.fn();

  render(<ListaCDT />);

  // Esperar a que la tabla se cargue
  const botones = await screen.findAllByRole("button");

  const verBotones = botones.filter(btn => btn.textContent.includes("Ver"));
  const editarBotones = botones.filter(btn => btn.textContent.includes("Editar"));
  const eliminarBotones = botones.filter(btn => btn.textContent.includes("Eliminar"));

  // --- Botón Ver ---
  fireEvent.click(verBotones[0]);
  expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining("/cdt/1"));

  // --- Botón Editar ---
  fireEvent.click(editarBotones[0]);
  expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining("/editar"));

  // --- Botón Eliminar ---
  // Primer botón eliminar (confirmado)
  fireEvent.click(eliminarBotones[0]);
  await waitFor(() => {
    expect(mockDispatch).toHaveBeenCalled();
  });

  // Segundo botón eliminar (cancelado)
  window.confirm = jest.fn(() => false);
  if (eliminarBotones[1]) {
    fireEvent.click(eliminarBotones[1]);
    expect(mockDispatch).not.toHaveBeenCalledWith(expect.anything());
  }

  // Segundo botón eliminar (fallido)
  window.confirm = jest.fn(() => true);
  if (eliminarBotones[1]) {
    fireEvent.click(eliminarBotones[1]);
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("No fue posible eliminar");
    });
  }
});



});