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

describe('validateForm', () => {
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
});
