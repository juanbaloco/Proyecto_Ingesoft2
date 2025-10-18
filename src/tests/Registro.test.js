import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { Registro } from '../components/registro';
import { registerAuth } from '../store/thunks/registerAuth';

jest.mock('../store/thunks/registerAuth', () => ({
  registerAuth: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

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

  describe('Renderizado inicial del componente', () => {
    it('debe renderizar el componente correctamente', () => {
      renderWithProviders(<Registro />);
      
      expect(screen.getByText('NeoBank - Registro')).toBeInTheDocument();
      expect(screen.getByText('Crea tu cuenta NeoBank')).toBeInTheDocument();
    });

    it('debe renderizar todos los campos del formulario', () => {
      renderWithProviders(<Registro />);
      
      expect(screen.getByLabelText(/nombre completo/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^contraseña$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirmar contraseña/i)).toBeInTheDocument();
    });
  });
});