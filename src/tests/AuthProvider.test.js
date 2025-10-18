import { render, screen, waitFor, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { AuthProvider } from '../components/AuthProvider';
import { onAuthStateChanged } from 'firebase/auth';

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

import { checkingCredentials, register, logout } from '../store/slices/authSlice';

const createMockStore = () => {
  return configureStore({
    reducer: {
      auth: (state = { status: 'checking' }, action) => {
        switch (action.type) {
          case 'auth/checkingCredentials':
            return { ...state, status: 'checking' };
          case 'auth/register':
            return { ...state, status: 'authenticated', ...action.payload };
          case 'auth/logout':
            return { status: 'not-authenticated' };
          default:
            return state;
        }
      },
    },
  });
};

const TestChild = () => <div>Contenido de la aplicación</div>;

describe('AuthProvider Component', () => {
  let mockUnsubscribe;

  beforeEach(() => {
    jest.clearAllMocks();

    mockUnsubscribe = jest.fn();
    
    onAuthStateChanged.mockImplementation(() => mockUnsubscribe);
  });

  describe('Estado de carga inicial', () => {
    it('debe mostrar el estado de carga al iniciar', () => {
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
    });
  });
});