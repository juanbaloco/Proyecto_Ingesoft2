import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import { Registro } from '../components/registro';
import { registerAuth } from '../store/thunks/registerAuth';

// Mock de thunk y navegación
jest.mock('../store/thunks/registerAuth', () => ({
  registerAuth: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Store mockeado
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: (state = { status: 'not-authenticated', ...initialState }, action) => {
        switch (action.type) {
          case 'auth/authenticated':
            return { ...state, status: 'authenticated' };
          default:
            return state;
        }
      },
    },
  });
};

// Render con Provider + Router
const renderWithProviders = (component, { store = createMockStore() } = {}) => {
  return render(
    <Provider store={store}>
      <MemoryRouter>
        {component}
      </MemoryRouter>
    </Provider>
  );
};

describe('Registro Component - Pruebas Completas', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
    registerAuth.mockReturnValue({ type: 'auth/register' });
  });

  describe('Renderizado inicial', () => {
    it('debe renderizar correctamente el título y los campos', () => {
      renderWithProviders(<Registro />);
      expect(screen.getByText('NeoBank - Registro')).toBeInTheDocument();
      expect(screen.getByLabelText(/nombre completo/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^contraseña$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirmar contraseña/i)).toBeInTheDocument();
    });
  });

  describe('Validaciones del formulario', () => {
    it('muestra errores al enviar formulario vacío', async () => {
      renderWithProviders(<Registro />);
      fireEvent.submit(screen.getByRole('button', { name: /registrarse/i }));

      expect(await screen.findByText('El nombre es requerido')).toBeInTheDocument();
      expect(screen.getByText('El correo es requerido')).toBeInTheDocument();
      expect(screen.getByText('La contraseña es requerida')).toBeInTheDocument();
      expect(screen.getByText('Confirma tu contraseña')).toBeInTheDocument();
    });

    it('muestra error si las contraseñas no coinciden', async () => {
      renderWithProviders(<Registro />);

      fireEvent.change(screen.getByLabelText(/nombre completo/i), {
        target: { value: 'Juan Pérez' },
      });
      fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
        target: { value: 'juan@correo.com' },
      });
      fireEvent.change(screen.getByLabelText(/^contraseña$/i), {
        target: { value: '123456' },
      });
      fireEvent.change(screen.getByLabelText(/confirmar contraseña/i), {
        target: { value: '654321' },
      });

      fireEvent.submit(screen.getByRole('button', { name: /registrarse/i }));
      expect(await screen.findByText('Las contraseñas no coinciden')).toBeInTheDocument();
    });
  });

  describe('Envío exitoso del formulario', () => {
    it('llama al dispatch con los datos correctos cuando el formulario es válido', async () => {
      renderWithProviders(<Registro />);
      
      fireEvent.change(screen.getByLabelText(/nombre completo/i), {
        target: { value: 'Juan Pérez' },
      });
      fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
        target: { value: 'juan@correo.com' },
      });
      fireEvent.change(screen.getByLabelText(/^contraseña$/i), {
        target: { value: '123456' },
      });
      fireEvent.change(screen.getByLabelText(/confirmar contraseña/i), {
        target: { value: '123456' },
      });

      fireEvent.submit(screen.getByRole('button', { name: /registrarse/i }));

      await waitFor(() => {
        expect(registerAuth).toHaveBeenCalledWith('juan@correo.com', '123456', 'Juan Pérez');
      });
    });
  });

  describe('Comportamiento según estado del usuario', () => {
    it('redirecciona automáticamente si ya está autenticado', () => {
      const store = createMockStore({ status: 'authenticated' });
      renderWithProviders(<Registro />, { store });
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });
});
