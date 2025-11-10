import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { AuthProvider } from '../components/AuthProvider';
import { onAuthStateChanged } from 'firebase/auth';
import { checkingCredentials, register, logout } from '../store/slices/authSlice';

// Mocks de Firebase y Redux
jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn(),
}));

jest.mock('../firebase/config', () => ({
  auth: {},
}));

jest.mock('../store/slices/authSlice', () => ({
  checkingCredentials: jest.fn(() => ({ type: 'auth/checkingCredentials' })),
  register: jest.fn((payload) => ({ type: 'auth/register', payload })),
  logout: jest.fn(() => ({ type: 'auth/logout' })),
}));

// Utilidad para crear un store de prueba
const createMockStore = () =>
  configureStore({
    reducer: {
      auth: (state = { status: 'checking' }, action) => {
        switch (action.type) {
          case 'auth/checkingCredentials':
            return { ...state, status: 'checking' };
          case 'auth/register':
            return { ...state, status: 'authenticated', user: action.payload };
          case 'auth/logout':
            return { status: 'not-authenticated' };
          default:
            return state;
        }
      },
    },
  });

// Componente hijo simulado
const TestChild = () => <div>Contenido de la aplicación</div>;

describe('AuthProvider Component', () => {
  let mockUnsubscribe;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUnsubscribe = jest.fn();
  });

  describe('Estado de carga inicial', () => {
    it('muestra el spinner de carga al montar el componente', () => {
      const store = createMockStore();
      onAuthStateChanged.mockImplementation(() => mockUnsubscribe);

      render(
        <Provider store={store}>
          <AuthProvider>
            <TestChild />
          </AuthProvider>
        </Provider>
      );

      expect(screen.getByText('Cargando...')).toBeInTheDocument();
      expect(screen.queryByText('Contenido de la aplicación')).not.toBeInTheDocument();
      expect(checkingCredentials).toHaveBeenCalled();
    });
  });

  describe('Autenticación del usuario', () => {
    it('debe llamar a register si el usuario está autenticado', async () => {
      const store = createMockStore();
      const mockUser = {
        uid: '123',
        email: 'test@correo.com',
        displayName: 'Juan Pérez',
      };

      onAuthStateChanged.mockImplementation((auth, callback) => {
        callback(mockUser);
        return mockUnsubscribe;
      });

      render(
        <Provider store={store}>
          <AuthProvider>
            <TestChild />
          </AuthProvider>
        </Provider>
      );

      await waitFor(() => {
        expect(register).toHaveBeenCalledWith({
          uid: '123',
          email: 'test@correo.com',
          displayName: 'Juan Pérez',
        });
        expect(screen.getByText('Contenido de la aplicación')).toBeInTheDocument();
      });
    });

    it('debe llamar a logout si no hay usuario autenticado', async () => {
      const store = createMockStore();

      onAuthStateChanged.mockImplementation((auth, callback) => {
        callback(null);
        return mockUnsubscribe;
      });

      render(
        <Provider store={store}>
          <AuthProvider>
            <TestChild />
          </AuthProvider>
        </Provider>
      );

      await waitFor(() => {
        expect(logout).toHaveBeenCalled();
        expect(screen.getByText('Contenido de la aplicación')).toBeInTheDocument();
      });
    });

    it('debe limpiar la suscripción al desmontarse', async () => {
      const store = createMockStore();

      onAuthStateChanged.mockImplementation((auth, callback) => {
        callback(null);
        return mockUnsubscribe;
      });

      const { unmount } = render(
        <Provider store={store}>
          <AuthProvider>
            <TestChild />
          </AuthProvider>
        </Provider>
      );

      unmount();
      expect(mockUnsubscribe).toHaveBeenCalled();
    });
  });
});
