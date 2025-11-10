import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ListaCDT } from "../components/ListaCDT";
import { cargarSolicitudesCDT, eliminarSolicitudCDT } from "../store/thunks/cdtThunk";

jest.mock("../store/thunks/cdtThunk");

const mockDispatch = jest.fn();
const mockNavigate = jest.fn();
const mockConfirm = jest.fn();
const mockAlert = jest.fn();

jest.mock("react-redux", () => ({
  useDispatch: () => mockDispatch,
  useSelector: jest.fn((selector) =>
    selector({
      cdt: {
        solicitudes: [
          { id: "1", monto: 5000000, plazo: 12, tasaInteres: 5, estado: "Borrador", fechaSolicitud: new Date() },
          { id: "2", monto: 3000000, plazo: 3, tasaInteres: 3, estado: "Aprobado", fechaSolicitud: new Date() },
        ],
        status: "idle",
      },
      auth: { uid: "uid123" },
    })
  ),
}));

jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: "1" }),
}));

beforeAll(() => {
  window.confirm = mockConfirm;
  window.alert = mockAlert;
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("ListaCDT", () => {
  test("✅ llama a cargarSolicitudesCDT al montar si hay uid", () => {
    render(<ListaCDT />);
    expect(mockDispatch).toHaveBeenCalledWith(cargarSolicitudesCDT("uid123"));
  });

  test("✅ muestra mensaje 'No hay resultados' cuando filtro elimina todas las filas", () => {
    render(<ListaCDT />);
    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "Rechazado" } });
    expect(screen.getByText(/No hay resultados/i)).toBeInTheDocument();
  });

  test("✅ filtra por estado y búsqueda correctamente", () => {
  render(<ListaCDT />);

  const search = screen.getByPlaceholderText(/buscar por monto/i);
  fireEvent.change(search, { target: { value: "3" } }); // Coincide con 3.000.000

  // Usamos regex que ignora símbolos y espacios
  expect(screen.getByText(/\$ ?3\.000\.000/)).toBeInTheDocument();
  expect(screen.queryByText(/\$ ?5\.000\.000/)).not.toBeInTheDocument();
});

  test("✅ botones de ver detalle y editar navegan correctamente", () => {
  render(<ListaCDT />);

  // Buscar el botón por el emoji y texto real
  const verBtns = screen.getAllByRole("button", { name: /👁️ Ver/i });
  fireEvent.click(verBtns[0]);
  expect(mockNavigate).toHaveBeenCalledWith("/cdt/1");

  // Si quieres probar editar
  const editarBtns = screen.getAllByRole("button", { name: /✏️ Editar/i });
  fireEvent.click(editarBtns[0]);
  expect(mockNavigate).toHaveBeenCalledWith("/editar/1");
});


  test("✅ elimina solicitud con confirm y llama dispatch", async () => {
    mockConfirm.mockReturnValue(true);
    mockDispatch.mockResolvedValue({ success: true });
    render(<ListaCDT />);
    const deleteBtns = screen.getAllByRole("button", { name: /eliminar/i });
    fireEvent.click(deleteBtns[0]);
    await waitFor(() => expect(mockDispatch).toHaveBeenCalledWith(eliminarSolicitudCDT("1")));
    expect(mockAlert).not.toHaveBeenCalled();
  });

  test("✅ alerta si falla eliminación", async () => {
    mockConfirm.mockReturnValue(true);
    mockDispatch.mockResolvedValue({ success: false });
    render(<ListaCDT />);
    const deleteBtns = screen.getAllByRole("button", { name: /eliminar/i });
    fireEvent.click(deleteBtns[0]);
    await waitFor(() => expect(mockAlert).toHaveBeenCalledWith("No fue posible eliminar"));
  });
});
