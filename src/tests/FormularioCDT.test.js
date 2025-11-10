// src/components/FormularioCDT.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { FormularioCDT } from '../components/FormularioCDT';
import * as cdtThunk from '../store/thunks/cdtThunk';
import cdtSlice from '../store/slices/cdtSlice';

// Mock de react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock de los thunks
jest.mock('../store/thunks/cdtThunk', () => ({
  crearSolicitudCDT: jest.fn(),
  actualizarSolicitudCDT: jest.fn(),
}));

// Helper para crear store de prueba
const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      cdt: cdtSlice,
      auth: (state = { uid: 'test-uid', displayName: 'Test User' }) => state,
    },
    preloadedState: {
      cdt: {
        solicitudActual: null,
        error: null,
        ...initialState.cdt,
      },
      auth: {
        uid: 'test-uid',
        displayName: 'Test User',
        ...initialState.auth,
      },
    },
  });
};

// Helper para renderizar con providers
const renderWithProviders = (component, { store = createTestStore() } = {}) => {
  return render(
    <Provider store={store}>
      <BrowserRouter>{component}</BrowserRouter>
    </Provider>
  );
};

describe('FormularioCDT', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
    jest.spyOn(window, 'alert').mockImplementation(() => {});
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  describe('Renderizado inicial', () => {
    test('debe renderizar el formulario correctamente', () => {
      renderWithProviders(<FormularioCDT />);

      expect(screen.getByText('Producto')).toBeInTheDocument();
      expect(screen.getByText('Monto (COP)')).toBeInTheDocument();
      expect(screen.getByText('Plazo (meses)')).toBeInTheDocument();
      expect(screen.getByText('Resumen y Confirmación')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Borrar Selección/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Guardar solicitud/i })).toBeInTheDocument();
    });

    test('debe mostrar las opciones de producto', () => {
      renderWithProviders(<FormularioCDT />);

      expect(screen.getByText('Seleccione un producto')).toBeInTheDocument();
      expect(screen.getByText('CDT Tradicional')).toBeInTheDocument();
    });

    test('debe mostrar todas las opciones de plazo', () => {
      renderWithProviders(<FormularioCDT />);

      expect(screen.getByText('6 meses')).toBeInTheDocument();
      expect(screen.getByText('12 meses')).toBeInTheDocument();
      expect(screen.getByText('18 meses')).toBeInTheDocument();
      expect(screen.getByText('24 meses')).toBeInTheDocument();
    });
  });

  describe('Manejo de cambios en el formulario', () => {
    test('debe actualizar el producto al seleccionarlo', () => {
      renderWithProviders(<FormularioCDT />);

      const productoSelect = screen.getAllByRole('combobox')[0];
      fireEvent.change(productoSelect, { target: { value: 'tradicional' } });

      expect(productoSelect.value).toBe('tradicional');
    });

    test('debe actualizar el monto y permitir solo números', () => {
      renderWithProviders(<FormularioCDT />);

      const montoInput = screen.getByPlaceholderText('10.000.000');
      fireEvent.change(montoInput, { target: { value: '5000000abc' } });

      expect(montoInput.value).toBe('5000000');
    });

    test('debe actualizar el plazo y la tasa de interés automáticamente', () => {
      renderWithProviders(<FormularioCDT />);

      const plazoSelect = screen.getAllByRole('combobox')[1];
      fireEvent.change(plazoSelect, { target: { value: '12' } });

      expect(plazoSelect.value).toBe('12');
      expect(screen.getByText('12.5% E.A.')).toBeInTheDocument();
    });

    test('debe calcular correctamente los intereses para cada plazo', () => {
      renderWithProviders(<FormularioCDT />);

      const montoInput = screen.getByPlaceholderText('10.000.000');
      const plazoSelect = screen.getAllByRole('combobox')[1];

      // Establecer monto
      fireEvent.change(montoInput, { target: { value: '10000000' } });

      // Probar con 6 meses (11% E.A.)
      fireEvent.change(plazoSelect, { target: { value: '6' } });
      expect(screen.getByText('11% E.A.')).toBeInTheDocument();

      // Probar con 24 meses (13.2% E.A.)
      fireEvent.change(plazoSelect, { target: { value: '24' } });
      expect(screen.getByText('13.2% E.A.')).toBeInTheDocument();
    });
  });

  describe('Validaciones', () => {
  test('debe mostrar error si el usuario no está autenticado', async () => {
  window.alert = jest.fn();

  const store = createTestStore({ auth: { uid: null } });
  const { container } = renderWithProviders(<FormularioCDT />, { store });

  const form = container.querySelector('form');
  form.setAttribute('noValidate', true); // deshabilita la validación HTML nativa

  const submitButton = screen.getByRole('button', { name: /Guardar solicitud/i });
  fireEvent.click(submitButton);

  await waitFor(() => {
    expect(window.alert).toHaveBeenCalledWith('Usuario no autenticado');
  });
});



  test('debe mostrar error si no se selecciona producto', async () => {
  window.alert = jest.fn();

  const { container } = renderWithProviders(<FormularioCDT />);

  const form = container.querySelector('form');
  form.setAttribute('noValidate', true); // <- deshabilita la validación HTML nativa

  const submitButton = screen.getByRole('button', { name: /Guardar solicitud/i });
  fireEvent.click(submitButton);

  await waitFor(() => {
    expect(window.alert).toHaveBeenCalledWith('Seleccione un producto');
  });
});


    test('debe mostrar error si el monto es menor al mínimo', async () => {
      renderWithProviders(<FormularioCDT />);

      const [productoSelect, plazoSelect] = screen.getAllByRole('combobox');
      const montoInput = screen.getByPlaceholderText('10.000.000');

      fireEvent.change(productoSelect, { target: { value: 'tradicional' } });
      fireEvent.change(montoInput, { target: { value: '200000' } });
      fireEvent.change(plazoSelect, { target: { value: '12' } });

      const submitButton = screen.getByRole('button', { name: /Guardar solicitud/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('Monto entre $250.000 y $500.000.000');
      });
    });

    test('debe mostrar error si el monto es mayor al máximo', async () => {
      renderWithProviders(<FormularioCDT />);

      const [productoSelect, plazoSelect] = screen.getAllByRole('combobox');
      const montoInput = screen.getByPlaceholderText('10.000.000');

      fireEvent.change(productoSelect, { target: { value: 'tradicional' } });
      fireEvent.change(montoInput, { target: { value: '600000000' } });
      fireEvent.change(plazoSelect, { target: { value: '12' } });

      const submitButton = screen.getByRole('button', { name: /Guardar solicitud/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('Monto entre $250.000 y $500.000.000');
      });
    });

    test('debe mostrar error si no se selecciona plazo', async () => {
  // Mock de window.alert
  window.alert = jest.fn();

  const { container } = renderWithProviders(<FormularioCDT />);

  // Deshabilitar validación nativa
  const form = container.querySelector('form');
  form.setAttribute('noValidate', true);

  const productoSelect = screen.getAllByRole('combobox')[0];
  const montoInput = screen.getByPlaceholderText('10.000.000');

  fireEvent.change(productoSelect, { target: { value: 'tradicional' } });
  fireEvent.change(montoInput, { target: { value: '5000000' } });

  const submitButton = screen.getByRole('button', { name: /Guardar solicitud/i });
  fireEvent.click(submitButton);

  await waitFor(() => {
    expect(window.alert).toHaveBeenCalledWith('Seleccione un plazo');
  });
});
  });

  describe('Envío del formulario - Crear solicitud', () => {
    test('debe crear una solicitud exitosamente', async () => {
      const mockDispatch = jest.fn().mockResolvedValue({ success: true });
      cdtThunk.crearSolicitudCDT.mockReturnValue(mockDispatch);

      renderWithProviders(<FormularioCDT />);

      // Llenar formulario
      fireEvent.change(screen.getAllByRole('combobox')[0], {
        target: { value: 'tradicional' },
      });
      fireEvent.change(screen.getByPlaceholderText('10.000.000'), {
        target: { value: '10000000' },
      });
      fireEvent.change(screen.getAllByRole('combobox')[1], {
        target: { value: '12' },
      });

      // Enviar
      fireEvent.click(screen.getByRole('button', { name: /Guardar solicitud/i }));

      await waitFor(() => {
        expect(screen.getByText('Solicitud creada')).toBeInTheDocument();
      });

      // Verificar navegación después del timeout
      jest.advanceTimersByTime(800);
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });

    test('debe mostrar error si falla la creación', async () => {
      const mockDispatch = jest.fn().mockResolvedValue({ 
        success: false, 
        error: 'Error al crear' 
      });
      cdtThunk.crearSolicitudCDT.mockReturnValue(mockDispatch);

      renderWithProviders(<FormularioCDT />);

      // Llenar formulario
      fireEvent.change(screen.getAllByRole('combobox')[0], {
        target: { value: 'tradicional' },
      });
      fireEvent.change(screen.getByPlaceholderText('10.000.000'), {
        target: { value: '10000000' },
      });
      fireEvent.change(screen.getAllByRole('combobox')[1], {
        target: { value: '12' },
      });

      fireEvent.click(screen.getByRole('button', { name: /Guardar solicitud/i }));

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('Error al crear');
      });
    });
  });

  describe('Envío del formulario - Actualizar solicitud', () => {
    test('debe actualizar una solicitud existente', async () => {
      const mockDispatch = jest.fn().mockResolvedValue({ success: true });
      cdtThunk.actualizarSolicitudCDT.mockReturnValue(mockDispatch);

      const store = createTestStore({
        cdt: {
          solicitudActual: {
            id: 'test-id',
            monto: 5000000,
            plazo: 12,
            tasaInteres: 12.5,
            estado: 'Borrador',
          },
        },
      });

      renderWithProviders(<FormularioCDT />, { store });

      // Esperar a que se cargue la solicitud
      await waitFor(() => {
        expect(screen.getByPlaceholderText('10.000.000').value).toBe('5000000');
      });

      // Cambiar el monto
      fireEvent.change(screen.getByPlaceholderText('10.000.000'), {
        target: { value: '8000000' },
      });

      // Enviar
      fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));

      await waitFor(() => {
        expect(screen.getByText('Solicitud actualizada')).toBeInTheDocument();
      });

      jest.advanceTimersByTime(800);
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });
  });

  describe('Botón Borrar Selección', () => {
    test('debe limpiar el formulario al hacer clic', () => {
      renderWithProviders(<FormularioCDT />);

      // Llenar el formulario
      const [productoSelect, plazoSelect] = screen.getAllByRole('combobox');
      
      fireEvent.change(productoSelect, {
        target: { value: 'tradicional' },
      });
      fireEvent.change(screen.getByPlaceholderText('10.000.000'), {
        target: { value: '10000000' },
      });
      fireEvent.change(plazoSelect, {
        target: { value: '12' },
      });

      // Limpiar
      fireEvent.click(screen.getByRole('button', { name: /Borrar Selección/i }));

      // Verificar que se limpió
      const [productoSelectAfter, plazoSelectAfter] = screen.getAllByRole('combobox');
      expect(productoSelectAfter.value).toBe('');
      expect(screen.getByPlaceholderText('10.000.000').value).toBe('');
      expect(plazoSelectAfter.value).toBe('');
    });
  });

  describe('FormularioCDT › Cálculos y formateo', () => {
  test('debe formatear correctamente el monto en COP', async () => {
    renderWithProviders(<FormularioCDT />);

    // Simular ingreso de monto
    const montoInput = screen.getByPlaceholderText('10.000.000');
    fireEvent.change(montoInput, { target: { value: '10000000' } });

    // Verificar que se renderiza el monto formateado
    await waitFor(() => {
  const montos = screen.getAllByText(/\$\s?10\.000\.000/);
  expect(montos.length).toBeGreaterThan(0);
});

  });

  test('debe calcular correctamente el resumen con monto cero', () => {
    renderWithProviders(<FormularioCDT />);

    // El monto inicial en el resumen es $ 0
    const montosCero = screen.getAllByText(/\$\s?0/);
expect(montosCero.length).toBeGreaterThan(0); // Al menos uno existe
  });
});


  describe('Efecto de solicitudActual', () => {
    test('debe cargar los datos cuando hay solicitudActual', async () => {
      const store = createTestStore({
        cdt: {
          solicitudActual: {
            id: 'test-id',
            monto: 15000000,
            plazo: 18,
            tasaInteres: 12.8,
            estado: 'Borrador',
          },
        },
      });

      renderWithProviders(<FormularioCDT />, { store });

      await waitFor(() => {
        expect(screen.getByPlaceholderText('10.000.000').value).toBe('15000000');
        const [, plazoSelect] = screen.getAllByRole('combobox');
        expect(plazoSelect.value).toBe('18');
        expect(screen.getByText('12.8% E.A.')).toBeInTheDocument();
      });
    });
  });

  describe('Manejo de errores desde Redux', () => {
    test('debe mostrar el error desde el estado de Redux', () => {
      const store = createTestStore({
        cdt: {
          error: 'Error de conexión',
        },
      });

      renderWithProviders(<FormularioCDT />, { store });

      expect(screen.getByText('Error de conexión')).toBeInTheDocument();
    });
  });
});