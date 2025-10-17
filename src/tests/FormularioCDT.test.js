// Importamos 'renderHook' de RTL para simular el hook personalizado o el componente,
// aunque para esta función interna, es más limpio extraer la lógica y simular el estado.

// --- Lógica de validateForm y su contexto simulado ---

// La función de prueba que simulará la ejecución de validateForm
const createValidateFormTester = (initialFormState) => {
  const plazoOpciones = [
    { dias: 90, tasa: 6.5, label: "90 días" },
    { dias: 180, tasa: 8, label: "180 días" },
    { dias: 360, tasa: 12, label: "360 días" },
  ];

  let currentErrors = {};

  const setValidationErrors = (errors) => {
    currentErrors = errors;
  };

  const validateForm = () => {
    const { monto, plazo, tasaInteres } = initialFormState;
    const errors = {};

    const montoNum = parseFloat(monto);
    if (!monto || isNaN(montoNum)) {
      errors.monto = "El monto es requerido";
    } else if (montoNum <= 0) {
      errors.monto = "El monto debe ser mayor a 0";
    } else if (montoNum < 250000) {
      errors.monto = "El monto mínimo es $250,000 COP";
    } else if (montoNum > 500000000) {
      errors.monto = "El monto máximo es $500,000,000 COP";
    }

    if (!plazo) {
      errors.plazo = "Debes seleccionar un plazo";
    } else {
      const plazoValido = plazoOpciones.some(
        (op) => op.dias.toString() === plazo
      );
      if (!plazoValido) {
        errors.plazo = "Plazo no válido";
      }
    }

    if (!tasaInteres) {
      errors.tasaInteres = "La tasa de interés debe estar asignada";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  return { validateForm, getErrors: () => currentErrors };
};

// --- Pruebas Unitarias ---

describe('validateForm', () => {
  // Test 1: Caso exitoso con todos los campos válidos
  test('debe retornar true y no establecer errores si el formulario es válido', () => {
    const formState = {
      monto: "5000000",
      plazo: "180",
      tasaInteres: "8",
    };
    const { validateForm, getErrors } = createValidateFormTester(formState);

    const isValid = validateForm();
    
    expect(isValid).toBe(true);
    expect(getErrors()).toEqual({});
  });

  // Test 2: Monto requerido
  test('debe fallar y establecer error si el monto está vacío', () => {
    const formState = {
      monto: "",
      plazo: "180",
      tasaInteres: "8",
    };
    const { validateForm, getErrors } = createValidateFormTester(formState);

    const isValid = validateForm();
    
    expect(isValid).toBe(false);
    expect(getErrors().monto).toBe("El monto es requerido");
  });

  // Test 3: Monto menor o igual a cero
  test('debe fallar si el monto es cero o negativo', () => {
    const formStateZero = { monto: "0", plazo: "180", tasaInteres: "8" };
    const formStateNegative = { monto: "-1000", plazo: "180", tasaInteres: "8" };

    let testerZero = createValidateFormTester(formStateZero);
    expect(testerZero.validateForm()).toBe(false);
    expect(testerZero.getErrors().monto).toBe("El monto debe ser mayor a 0");
    
    let testerNegative = createValidateFormTester(formStateNegative);
    expect(testerNegative.validateForm()).toBe(false);
    expect(testerNegative.getErrors().monto).toBe("El monto debe ser mayor a 0");
  });

  // Test 4: Monto mínimo ($250,000 COP)
  test('debe fallar si el monto es menor al mínimo ($250,000)', () => {
    const formState = {
      monto: "249999",
      plazo: "180",
      tasaInteres: "8",
    };
    const { validateForm, getErrors } = createValidateFormTester(formState);

    const isValid = validateForm();
    
    expect(isValid).toBe(false);
    expect(getErrors().monto).toBe("El monto mínimo es $250,000 COP");
  });

  // Test 5: Monto máximo ($500,000,000 COP)
  test('debe fallar si el monto es mayor al máximo ($500,000,000)', () => {
    const formState = {
      monto: "500000001",
      plazo: "180",
      tasaInteres: "8",
    };
    const { validateForm, getErrors } = createValidateFormTester(formState);

    const isValid = validateForm();
    
    expect(isValid).toBe(false);
    expect(getErrors().monto).toBe("El monto máximo es $500,000,000 COP");
  });

  // Test 6: Plazo requerido
  test('debe fallar y establecer error si el plazo está vacío', () => {
    const formState = {
      monto: "5000000",
      plazo: "",
      tasaInteres: "", // Tasa también fallará, pero verificamos plazo
    };
    const { validateForm, getErrors } = createValidateFormTester(formState);

    const isValid = validateForm();
    
    expect(isValid).toBe(false);
    expect(getErrors().plazo).toBe("Debes seleccionar un plazo");
  });

  // Test 7: Plazo no válido
  test('debe fallar y establecer error si el plazo es un valor no predefinido', () => {
    const formState = {
      monto: "5000000",
      plazo: "100", // Plazo no en plazoOpciones
      tasaInteres: "8",
    };
    const { validateForm, getErrors } = createValidateFormTester(formState);

    const isValid = validateForm();
    
    expect(isValid).toBe(false);
    expect(getErrors().plazo).toBe("Plazo no válido");
  });

  // Test 8: Tasa de Interés requerido
  test('debe fallar si la tasa de interés está vacía', () => {
    const formState = {
      monto: "5000000",
      plazo: "180",
      tasaInteres: "",
    };
    const { validateForm, getErrors } = createValidateFormTester(formState);

    const isValid = validateForm();
    
    expect(isValid).toBe(false);
    expect(getErrors().tasaInteres).toBe("La tasa de interés debe estar asignada");
  });
  
  // Test 9: Múltiples errores
  test('debe retornar false y establecer errores para todos los campos inválidos', () => {
    const formState = {
      monto: "1", // Inválido (muy bajo)
      plazo: "100", // Inválido (no existe)
      tasaInteres: "", // Inválido (vacío)
    };
    const { validateForm, getErrors } = createValidateFormTester(formState);

    const isValid = validateForm();
    
    expect(isValid).toBe(false);
    expect(getErrors().monto).toBe("El monto mínimo es $250,000 COP");
    expect(getErrors().plazo).toBe("Plazo no válido");
    expect(getErrors().tasaInteres).toBe("La tasa de interés debe estar asignada");
    expect(Object.keys(getErrors()).length).toBe(3);
  });
});