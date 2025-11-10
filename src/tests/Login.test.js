// Login.test.jsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Login } from "../components/login";
import { useDispatch, useSelector } from "react-redux";
import { loginWithEmailAndPassword } from "../store/thunks/loginAuth";
import { loginWithGoogle } from "../store/thunks/loginGoogle";
import { MemoryRouter } from "react-router-dom";

// Mock de Redux
jest.mock("react-redux", () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

// Mock de thunks
jest.mock("../store/thunks/loginAuth", () => ({
  loginWithEmailAndPassword: jest.fn(),
}));

jest.mock("../store/thunks/loginGoogle", () => ({
  loginWithGoogle: jest.fn(),
}));

// Mock de useNavigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}));

describe("Login Component", () => {
  let mockDispatch;

  beforeEach(() => {
    mockDispatch = jest.fn(() => Promise.resolve());
    useDispatch.mockReturnValue(mockDispatch);
    useSelector.mockReturnValue({ status: "not-authenticated" });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Renderiza correctamente inputs, botones y enlaces", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/Correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Entrar/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Iniciar con Google/i })).toBeInTheDocument();
    expect(screen.getByText(/Regístrate aquí/i)).toHaveAttribute("href", "/registro");
  });

  test("Muestra errores de validación en campos vacíos", async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /Entrar/i }));

    expect(await screen.findByText(/El correo es requerido/i)).toBeInTheDocument();
    expect(await screen.findByText(/La contraseña es requerida/i)).toBeInTheDocument();
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  test("Muestra error de correo inválido y contraseña corta", async () => {
  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );

  // Cambiamos los inputs
  fireEvent.change(screen.getByLabelText(/Correo electrónico/i), {
    target: { value: "correo-invalido" },
  });

  fireEvent.change(screen.getByLabelText(/Contraseña/i), {
    target: { value: "123" },
  });

  // Hacemos submit
  fireEvent.submit(screen.getByRole("button", { name: /Entrar/i }));

  // Esperamos a que los spans de error aparezcan
  expect(await screen.findByText("El correo no es válido")).toBeInTheDocument();
  expect(await screen.findByText("La contraseña debe tener al menos 6 caracteres")).toBeInTheDocument();

  expect(mockDispatch).not.toHaveBeenCalled();
});


  test("Llama dispatch loginWithEmailAndPassword correctamente", async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Correo electrónico/i), {
      target: { value: "test@example.com" },
    });

    fireEvent.change(screen.getByLabelText(/Contraseña/i), {
      target: { value: "123456" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Entrar/i }));

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(
        loginWithEmailAndPassword("test@example.com", "123456")
      );
    });
  });

  test("Muestra error si loginWithEmailAndPassword falla", async () => {
    mockDispatch.mockImplementation(() => Promise.reject());
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Correo electrónico/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Contraseña/i), {
      target: { value: "123456" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Entrar/i }));

    expect(await screen.findByText(/Correo o contraseña incorrectos/i)).toBeInTheDocument();
  });

  test("Llama dispatch loginWithGoogle correctamente", async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /Iniciar con Google/i }));

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(loginWithGoogle());
    });
  });

  test("Navega a /dashboard si status es authenticated", () => {
    useSelector.mockReturnValue({ status: "authenticated" });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
  });
});
