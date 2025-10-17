// Simulamos la lógica de validateForm y su contexto de estado

/**
 * Crea una función de prueba que simula el entorno de validateForm.
 * @param {object} initialFormState - El estado inicial de email y password.
 * @returns {object} Contiene validateForm para ejecutar y getErrors para leer los errores.
 */
const createValidateFormTester = (initialFormState) => {
  const { email, password } = initialFormState;
  let currentErrors = {};

  const setErrors = (errors) => {
    currentErrors = errors;
  };

  const validateForm = () => {
    const newErrors = {};

    // --- Lógica de validación de email ---
    if (!email.trim()) {
      newErrors.email = "El correo es requerido";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "El correo no es válido";
    }

    // --- Lógica de validación de password ---
    if (!password) {
      newErrors.password = "La contraseña es requerida";
    } else if (password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return { validateForm, getErrors: () => currentErrors };
};

// ----------------------------------------------------------------------
// PRUEBAS UNITARIAS
// ----------------------------------------------------------------------

describe('validateForm', () => {

  // Test 1: Caso exitoso con credenciales válidas
  test('debe retornar true y no establecer errores si el email y password son válidos', () => {
    const formState = {
      email: "test@example.com",
      password: "securepassword123",
    };
    const { validateForm, getErrors } = createValidateFormTester(formState);

    const isValid = validateForm();

    expect(isValid).toBe(true);
    expect(getErrors()).toEqual({});
  });

  // Test 2: Email vacío
  test('debe fallar y establecer error si el email está vacío', () => {
    const formState = {
      email: "",
      password: "validpassword",
    };
    const { validateForm, getErrors } = createValidateFormTester(formState);

    const isValid = validateForm();

    expect(isValid).toBe(false);
    expect(getErrors().email).toBe("El correo es requerido");
    expect(getErrors().password).toBeUndefined();
  });

  // Test 3: Email inválido (formato incorrecto)
  test('debe fallar y establecer error si el email no es válido', () => {
    const formState = {
      email: "invalid-email",
      password: "validpassword",
    };
    const { validateForm, getErrors } = createValidateFormTester(formState);

    const isValid = validateForm();

    expect(isValid).toBe(false);
    expect(getErrors().email).toBe("El correo no es válido");
    expect(getErrors().password).toBeUndefined();
  });

  // Test 4: Password vacío
  test('debe fallar y establecer error si el password está vacío', () => {
    const formState = {
      email: "test@example.com",
      password: "",
    };
    const { validateForm, getErrors } = createValidateFormTester(formState);

    const isValid = validateForm();

    expect(isValid).toBe(false);
    expect(getErrors().password).toBe("La contraseña es requerida");
    expect(getErrors().email).toBeUndefined();
  });

  // Test 5: Password demasiado corto (menos de 6 caracteres)
  test('debe fallar y establecer error si el password es menor a 6 caracteres', () => {
    const formState = {
      email: "test@example.com",
      password: "short", // 5 caracteres
    };
    const { validateForm, getErrors } = createValidateFormTester(formState);

    const isValid = validateForm();

    expect(isValid).toBe(false);
    expect(getErrors().password).toBe("La contraseña debe tener al menos 6 caracteres");
    expect(getErrors().email).toBeUndefined();
  });

  // Test 6: Múltiples errores
  test('debe retornar false y establecer errores para email y password si ambos son inválidos', () => {
    const formState = {
      email: "a@b", // Inválido
      password: "123", // Inválido
    };
    const { validateForm, getErrors } = createValidateFormTester(formState);

    const isValid = validateForm();

    expect(isValid).toBe(false);
    expect(getErrors().email).toBe("El correo no es válido");
    expect(getErrors().password).toBe("La contraseña debe tener al menos 6 caracteres");
    expect(Object.keys(getErrors()).length).toBe(2);
  });
});