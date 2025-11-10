/**
 * Crea una función de prueba que simula el entorno de validateForm.
 * @param {object} initialFormState - El estado inicial de email y password.
 * @returns {object} Contiene validateForm para ejecutar y getErrors para leer los errores.
 
 */
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
    ok: true,
  })
);

import { describe, test, expect } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import { Login } from '../components/Login';
const createValidateFormTester = (initialFormState) => {
  const { email, password } = initialFormState;
  let currentErrors = {};

  const setErrors = (errors) => {
    currentErrors = errors;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "El correo es requerido";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "El correo no es válido";
    }

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

describe('validateForm', () => {

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
});
