import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { ProtectedRoute } from '../components/ProtectedRoute';

const createMockStore = (authStatus) => {
  return configureStore({
    reducer: {
      auth: (state = { status: authStatus }) => state,
    },
  });
};


const TestComponent = () => <div>Contenido Protegido</div>;
const LoginComponent = () => <div>Página de Login</div>;

const renderWithProviders = (component, { store, initialRoute = '/' } = {}) => {
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[initialRoute]}>
        <Routes>
          <Route path="/" element={component} />
          <Route path="/login" element={<LoginComponent />} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
};

describe('ProtectedRoute Component', () => {
  
  describe('Usuario autenticado', () => {
    it('debe renderizar el contenido children cuando status es "authenticated"', () => {
      const store = createMockStore('authenticated');
      
      renderWithProviders(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>,
        { store }
      );

      expect(screen.getByText('Contenido Protegido')).toBeInTheDocument();
      expect(screen.queryByText('Página de Login')).not.toBeInTheDocument();
    });

    it('debe renderizar múltiples children cuando está autenticado', () => {
      const store = createMockStore('authenticated');
      
      renderWithProviders(
        <ProtectedRoute>
          <div>Primer elemento</div>
          <div>Segundo elemento</div>
          <div>Tercer elemento</div>
        </ProtectedRoute>,
        { store }
      );

      expect(screen.getByText('Primer elemento')).toBeInTheDocument();
      expect(screen.getByText('Segundo elemento')).toBeInTheDocument();
      expect(screen.getByText('Tercer elemento')).toBeInTheDocument();
    });

    it('debe renderizar componentes complejos cuando está autenticado', () => {
      const store = createMockStore('authenticated');
      
      const ComplexComponent = () => (
        <div>
          <h1>Dashboard</h1>
          <p>Bienvenido al sistema</p>
          <button>Acción</button>
        </div>
      );

      renderWithProviders(
        <ProtectedRoute>
          <ComplexComponent />
        </ProtectedRoute>,
        { store }
      );

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Bienvenido al sistema')).toBeInTheDocument();
      expect(screen.getByText('Acción')).toBeInTheDocument();
    });
  });
});